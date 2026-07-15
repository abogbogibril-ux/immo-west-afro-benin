'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Annonce {
  id: string
  titre: string
  ville: string
  arrondissement: string
  type_bien: string
  transaction: string
  prix: number
  vues: number
  statut: string
  created_at: string
  surface?: number
}

const STATUTS = ['Tous', 'publié', 'archivé', 'vendu', 'loué']
const TYPES   = ['Tous', 'Maison', 'Appartement', 'Villa', 'Terrain', 'Bureau', 'Studio']
const STATUT_COLORS: Record<string, string> = {
  'publié':  'bg-green-100 text-green-700',
  'archivé': 'bg-gray-100 text-gray-500',
  'vendu':   'bg-blue-100 text-blue-700',
  'loué':    'bg-purple-100 text-purple-700',
}

function formatPrice(p: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(p)) + ' FCFA'
}

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [filtered, setFiltered] = useState<Annonce[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState('Tous')
  const [type, setType]     = useState('Tous')
  const [sortBy, setSortBy] = useState('recent')
  const [userId, setUserId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  // Charger les annonces
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase
        .from('biens')
        .select('id, titre, ville, arrondissement, type_bien, transaction, prix, vues, statut, created_at, surface, numero_sequence')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
      setAnnonces(data ?? [])
      setFiltered(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  // Filtres
  useEffect(() => {
    let res = [...annonces]
    if (search) res = res.filter(a => a.titre.toLowerCase().includes(search.toLowerCase()) || a.ville.toLowerCase().includes(search.toLowerCase()))
    if (statut !== 'Tous') res = res.filter(a => a.statut === statut)
    if (type !== 'Tous')   res = res.filter(a => a.type_bien === type)
    if (sortBy === 'recent')  res.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (sortBy === 'vues')    res.sort((a, b) => (b.vues ?? 0) - (a.vues ?? 0))
    if (sortBy === 'prix_asc') res.sort((a, b) => a.prix - b.prix)
    if (sortBy === 'prix_desc') res.sort((a, b) => b.prix - a.prix)
    setFiltered(res)
  }, [annonces, search, statut, type, sortBy])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleArchive = async (id: string, currentStatut: string) => {
    const action = currentStatut === 'publi\u00e9' ? 'archiver' : 'republier'
    if (!confirm("Etes-vous sur de vouloir " + action + " cette annonce ?")) return
    const newStatut = currentStatut === 'publié' ? 'archivé' : 'publié'
    const { error } = await supabase.from('biens').update({ statut: newStatut }).eq('id', id)
    if (!error) {
      setAnnonces(prev => prev.map(a => a.id === id ? { ...a, statut: newStatut } : a))
      showToast(newStatut === 'archivé' ? 'Annonce archivée' : 'Annonce republiée')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer définitivement cette annonce ?')) return
    setDeleting(id)
    const { error } = await supabase.from('biens').delete().eq('id', id)
    if (!error) {
      setAnnonces(prev => prev.filter(a => a.id !== id))
      showToast('Annonce supprimée')
    }
    setDeleting(null)
  }

  const stats = {
    total: annonces.length,
    actives: annonces.filter(a => a.statut === 'publié').length,
    archivees: annonces.filter(a => a.statut === 'archivé').length,
    vendues: annonces.filter(a => a.statut === 'vendu' || a.statut === 'loué').length,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 bg-[#0f172a] min-h-screen">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
          {toast}
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Mes annonces</h1>
          <p className="text-sm text-slate-400 mt-0.5">{stats.total} annonce{stats.total > 1 ? 's' : ''} au total</p>
        </div>
        <Link href="/publier"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00bcd4] text-white text-sm font-semibold rounded-xl hover:bg-[#0097a7] transition-colors self-start">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Nouvelle annonce
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-white', bg: 'bg-[#1e293b]' },
          { label: 'Actives', value: stats.actives, color: 'text-green-400', bg: 'bg-green-900/20' },
          { label: 'Archivées', value: stats.archivees, color: 'text-slate-300', bg: 'bg-[#0f172a]' },
          { label: 'Vendus/Loués', value: stats.vendues, color: 'text-blue-400', bg: 'bg-blue-900/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-[#334155] p-3.5 text-center`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-300 mt-0.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text" placeholder="Rechercher une annonce..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4]/30 bg-[#0f172a] text-white placeholder-slate-500"
            />
          </div>

          <select value={statut} onChange={e => setStatut(e.target.value)}
            className="px-3 py-2.5 border border-[#334155] rounded-xl text-sm text-slate-200 focus:outline-none bg-[#0f172a]">
            {STATUTS.map(s => <option key={s} value={s}>{s === 'Tous' ? 'Tous les statuts' : s}</option>)}
          </select>

          <select value={type} onChange={e => setType(e.target.value)}
            className="px-3 py-2.5 border border-[#334155] rounded-xl text-sm text-slate-200 focus:outline-none bg-[#0f172a]">
            {TYPES.map(t => <option key={t} value={t}>{t === 'Tous' ? 'Tous les types' : t}</option>)}
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2.5 border border-[#334155] rounded-xl text-sm text-slate-200 focus:outline-none bg-[#0f172a]">
            <option value="recent">Plus récent</option>
            <option value="vues">Plus vues</option>
            <option value="prix_asc">Prix croissant</option>
            <option value="prix_desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-[#00bcd4] border-t-transparent rounded-full mx-auto mb-3" />
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-4xl mb-3">🏠</p>
            <p className="text-slate-400 font-medium">Aucune annonce trouvée</p>
            <p className="text-sm text-slate-400 mt-1">Modifiez vos filtres ou publiez une nouvelle annonce</p>
            <Link href="/publier" className="mt-4 inline-block px-4 py-2 bg-[#00bcd4] text-white text-sm font-semibold rounded-xl hover:bg-[#0097a7] transition-colors">
              Publier une annonce
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0f172a] border-b border-[#334155]">
                  {['Référence', 'Bien', 'Type', 'Prix', 'Vues', 'Statut', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-[#0f172a] transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-slate-400 bg-[#0f172a] px-1.5 py-0.5 rounded">
                        {`IWA-${String(a.numero_sequence).padStart(5, "0")}`}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 min-w-[160px]">
                      <p className="font-medium text-white truncate max-w-[160px]">{a.titre}</p>
                      <p className="text-xs text-slate-300">{a.ville}{a.arrondissement ? `, ${a.arrondissement}` : ''}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap">{a.type_bien}</td>
                    <td className="px-4 py-3.5 font-semibold text-[#00bcd4] whitespace-nowrap">{formatPrice(a.prix)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        <span className="font-semibold text-slate-200">{a.vues ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[a.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                        {a.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        {/* Voir */}
                        <Link href={a.statut === 'archivé' ? `/publier?edit=${a.id}` : a.statut === 'brouillon' ? `/dashboard/agent/apercu/${a.id}` : `/bien/${a.id}`}
                          className="relative group inline-flex items-center justify-center p-1.5 rounded-lg text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 transition-colors duration-150">
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            {a.statut === 'archivé' ? 'Modifier' : a.statut === 'brouillon' ? 'Aperçu' : 'Voir'}
                          </span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </Link>
                        {/* Archiver/Republier */}
                        <button onClick={() => handleArchive(a.id, a.statut)}
                          className={`relative group p-1.5 rounded-lg transition-colors duration-150 border-none cursor-pointer ${
                            a.statut === 'publié'
                              ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                              : 'text-green-400 bg-green-400/10 hover:bg-green-400/20'
                          }`}
                        >
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            {a.statut === 'publié' ? 'Archiver' : 'Republier'}
                          </span>
                          {a.statut === 'publié' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                            </svg>
                          )}
                        </button>
                        {/* Supprimer */}
                        <button onClick={() => handleDelete(a.id)} disabled={deleting === a.id}
                          className="relative group p-1.5 rounded-lg text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors duration-150 border-none cursor-pointer disabled:opacity-50"
                        >
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">Supprimer</span>
                          {deleting === a.id ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer table */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-[#334155] flex items-center justify-between text-xs text-slate-300">
            <span>{filtered.length} annonce{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}</span>
            <span>Total vues : <strong className="text-slate-300">{filtered.reduce((s, a) => s + (a.vues ?? 0), 0)}</strong></span>
          </div>
        )}
      </div>
    </div>
  )
}