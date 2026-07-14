'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const STATUTS = ['Tous', 'publié', 'brouillon', 'archivé']
const STATUT_COLORS: Record<string, string> = {
  'publié':   'bg-green-500/20 text-green-400 border border-green-500/30',
  'brouillon':'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  'archivé':  'bg-gray-500/20 text-gray-400 border border-gray-500/30',
}
const TRIS = [
  { val: 'date_desc', label: 'Plus récent' },
  { val: 'date_asc',  label: 'Plus ancien' },
  { val: 'ref_asc',   label: 'Référence A→Z' },
  { val: 'ref_desc',  label: 'Référence Z→A' },
  { val: 'prix_desc', label: 'Prix décroissant' },
  { val: 'prix_asc',  label: 'Prix croissant' },
]

export default function AdminAnnoncesPage() {
  const router = useRouter()
  const [biens, setBiens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('Tous')
  const [tri, setTri] = useState('date_desc')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => { checkAdmin() }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/connexion'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/'); return }
    loadBiens()
  }

  const loadBiens = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('biens')
      .select('*, profiles(nom, prenom, nom_complet, email)')
      .order('created_at', { ascending: false })
    if (error) showToast('Erreur chargement : ' + error.message, 'error')
    setBiens(data || [])
    setLoading(false)
  }

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  /* ── Changer le statut ───────────────────────────────────── */
  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }

  const changerStatut = async (id: string, nouveauStatut: string, titreAction: string) => {
    if (!confirm('Confirmer : ' + titreAction + ' cette annonce ?')) return
    const token = await getToken()
    if (!token) { showToast('Session expilee, reconnectez-vous', 'error'); return }
    const res = await fetch('/api/admin/biens', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ bienId: id, statut: nouveauStatut }),
    })
    const result = await res.json()
    if (!res.ok) { showToast('Erreur : ' + result.error, 'error'); return }
    setBiens(prev => prev.map(b => b.id === id ? { ...b, statut: nouveauStatut } : b))
    const labels: Record<string, string> = {
      'publie':   'Annonce publiee',
      'archive':  'Annonce archivee',
      'brouillon':'Annonce repassee en brouillon',
    }
    showToast(labels[nouveauStatut] || 'Statut mis a jour')
  }

  const supprimer = async (id: string, titre: string) => {
    if (!confirm('Supprimer definitivement ' + titre + ' et toutes ses photos ?')) return
    const token = await getToken()
    if (!token) { showToast('Session expilee, reconnectez-vous', 'error'); return }
    const res = await fetch('/api/admin/biens', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ bienId: id }),
    })
    const result = await res.json()
    if (!res.ok) { showToast('Erreur : ' + result.error, 'error'); return }
    setBiens(prev => prev.filter(b => b.id !== id))
    showToast('Annonce supprimee definitivement')
  }

  const biensFiltres = biens
    .filter(b => {
      const matchStatut = filtreStatut === 'Tous' || b.statut === filtreStatut
      const matchSearch = !search ||
        b.titre?.toLowerCase().includes(search.toLowerCase()) ||
        b.ville?.toLowerCase().includes(search.toLowerCase()) ||
        `IWA-${String(b.numero_sequence).padStart(5, '0')}`.includes(search.toUpperCase())
      return matchStatut && matchSearch
    })
    .sort((a, b) => {
      if (tri === 'date_desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (tri === 'date_asc')  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (tri === 'ref_asc')   return a.id.localeCompare(b.id)
      if (tri === 'ref_desc')  return b.id.localeCompare(a.id)
      if (tri === 'prix_desc') return (b.prix || 0) - (a.prix || 0)
      if (tri === 'prix_asc')  return (a.prix || 0) - (b.prix || 0)
      return 0
    })

  const stats = {
    total:      biens.length,
    publies:    biens.filter(b => b.statut === 'publié').length,
    brouillons: biens.filter(b => b.statut === 'brouillon').length,
    archives:   biens.filter(b => b.statut === 'archivé').length,
  }

  /* ── Boutons d'action selon statut ─────────────────────────
     publié    → [Archiver]   [Supprimer]
     brouillon → [Publier]    [Archiver]  [Supprimer]
     archivé   → [Republier]  [Supprimer]
  ─────────────────────────────────────────────────────────── */
  const ActionButtons = ({ b }: { b: any }) => (
    <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">

      {/* Voir */}
      <Link href={`/bien/${b.id}`} target="_blank" title="Voir l'annonce"
        className="relative group p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors">
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          Voir
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
      </Link>

      {/* Publier (brouillon uniquement) */}
      {b.statut === 'brouillon' && (
        <button onClick={() => changerStatut(b.id, 'publié', 'publier')}
          title="Publier"
          className="relative group flex items-center gap-1 px-2 py-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/30 transition-colors text-xs font-semibold border-none cursor-pointer">
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            Publier
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
          Publier
        </button>
      )}

      {/* Republier (archivé uniquement) */}
      {b.statut === 'archivé' && (
        <button onClick={() => changerStatut(b.id, 'publié', 'republier')}
          title="Republier"
          className="relative group flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/30 transition-colors text-xs font-semibold border-none cursor-pointer">
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            Republier
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Republier
        </button>
      )}

      {/* Archiver (publié ou brouillon) */}
      {(b.statut === 'publié' || b.statut === 'brouillon') && (
        <button onClick={() => changerStatut(b.id, 'archivé', 'archiver')}
          title="Archiver"
          className="relative group flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/30 transition-colors text-xs font-semibold border-none cursor-pointer">
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            Archiver
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
          </svg>
          Archiver
        </button>
      )}

      {/* Supprimer (toujours visible) */}
      <button onClick={() => supprimer(b.id, b.titre)}
        title="Supprimer définitivement"
        className="relative group p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors border-none cursor-pointer">
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          Supprimer
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>

    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-white">Gestion des annonces</h1>
        <span className="text-sm text-slate-400">{stats.total} annonce{stats.total > 1 ? 's' : ''}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total',     value: stats.total,      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
          { label: 'Publiées',  value: stats.publies,    color: 'bg-green-500/10 text-green-400 border-green-500/20' },
          { label: 'Brouillons',value: stats.brouillons, color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
          { label: 'Archivées', value: stats.archives,   color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-3 border ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] shadow-sm p-3 mb-5 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Titre, ville ou référence..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-36 px-3 py-2 border border-[#334155] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-[#0f172a] text-white placeholder-slate-600"
        />
        <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}
          className="px-3 py-2 border border-[#334155] rounded-lg text-sm focus:outline-none bg-[#0f172a] text-white min-w-32">
          {STATUTS.map(s => <option key={s} value={s}>{s === 'Tous' ? 'Tous statuts' : s}</option>)}
        </select>
        <select value={tri} onChange={e => setTri(e.target.value)}
          className="px-3 py-2 border border-[#334155] rounded-lg text-sm focus:outline-none bg-[#0f172a] text-white min-w-36">
          {TRIS.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
        </select>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Chargement...</div>
      ) : biensFiltres.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Aucune annonce trouvée</div>
      ) : (
        <div className="space-y-2">
          {biensFiltres.map(b => (
            <div key={b.id} className="bg-[#1e293b] rounded-xl border border-[#334155] shadow-sm p-3 md:p-4 flex items-center gap-3 flex-wrap">

              {/* Ref + Statut */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono text-xs text-slate-400 bg-[#0f172a] px-2 py-0.5 rounded border border-[#334155]">
                  {`IWA-${String(b.numero_sequence).padStart(5, '0')}`}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[b.statut] ?? 'bg-gray-500/20 text-gray-400'}`}>
                  {b.statut}
                </span>
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{b.titre}</p>
                <p className="text-xs text-slate-400 flex flex-wrap gap-2 mt-0.5">
                  <span>{b.ville || '-'}</span>
                  <span className="capitalize">{b.type_bien} · {b.transaction}</span>
                  <span className="text-green-400 font-medium">
                    {b.prix ? new Intl.NumberFormat('fr-FR').format(b.prix) + ' FCFA' : '-'}
                  </span>
                  <span>{b.profiles?.nom_complet || b.profiles?.prenom || 'Agent inconnu'}</span>
                  <span>{new Date(b.created_at).toLocaleDateString('fr-FR')}</span>
                </p>
              </div>

              {/* Boutons d'action */}
              <ActionButtons b={b} />
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-slate-500 mt-4">
        {biensFiltres.length} annonce{biensFiltres.length > 1 ? 's' : ''} affichée{biensFiltres.length > 1 ? 's' : ''}
      </p>
    </div>
  )
}
