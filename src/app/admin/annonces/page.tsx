'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const STATUTS = ['Tous', 'publié', 'brouillon', 'archivé']
const STATUT_COLORS: Record<string, string> = {
  'publié': 'bg-green-100 text-green-700',
  'brouillon': 'bg-yellow-100 text-yellow-700',
  'archivé': 'bg-gray-100 text-gray-500',
}

export default function AdminAnnoncesPage() {
  const router = useRouter()
  const [biens, setBiens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('Tous')
  const [toast, setToast] = useState('')

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/connexion'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/'); return }
    loadBiens()
  }

  const loadBiens = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('biens')
      .select('*, profiles(nom, prenom, nom_complet, email)')
      .order('created_at', { ascending: false })
    setBiens(data || [])
    setLoading(false)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const changerStatut = async (id: string, nouveauStatut: string) => {
    const action = nouveauStatut === 'publié' ? 'publier' : nouveauStatut === 'archivé' ? 'archiver' : 'mettre en brouillon'
    if (!confirm(`Etes-vous sur de vouloir ${action} cette annonce ?`)) return
    const { error } = await supabase.from('biens').update({ statut: nouveauStatut }).eq('id', id)
    if (!error) {
      setBiens(prev => prev.map(b => b.id === id ? { ...b, statut: nouveauStatut } : b))
      showToast(`Annonce ${nouveauStatut === 'publié' ? 'publiée' : nouveauStatut === 'archivé' ? 'archivée' : 'mise en brouillon'}`)
    }
  }

  const supprimer = async (id: string) => {
    if (!confirm('Supprimer definitivement cette annonce et toutes ses photos ?')) return
    await supabase.from('images_biens').delete().eq('bien_id', id)
    const { error } = await supabase.from('biens').delete().eq('id', id)
    if (!error) {
      setBiens(prev => prev.filter(b => b.id !== id))
      showToast('Annonce supprimee')
    }
  }

  const biensFiltres = biens.filter(b => {
    const matchStatut = filtreStatut === 'Tous' || b.statut === filtreStatut
    const matchSearch = !search || b.titre?.toLowerCase().includes(search.toLowerCase()) || b.ville?.toLowerCase().includes(search.toLowerCase())
    return matchStatut && matchSearch
  })

  const stats = {
    total: biens.length,
    publies: biens.filter(b => b.statut === 'publié').length,
    brouillons: biens.filter(b => b.statut === 'brouillon').length,
    archives: biens.filter(b => b.statut === 'archivé').length,
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des annonces</h1>
        <span className="text-sm text-gray-500">{stats.total} annonce{stats.total > 1 ? 's' : ''} au total</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-700' },
          { label: 'Publiées', value: stats.publies, color: 'bg-green-50 text-green-700' },
          { label: 'Brouillons', value: stats.brouillons, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Archivées', value: stats.archives, color: 'bg-gray-50 text-gray-600' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Rechercher par titre ou ville..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
        />
        <select
          value={filtreStatut}
          onChange={e => setFiltreStatut(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-white"
        >
          {STATUTS.map(s => <option key={s} value={s}>{s === 'Tous' ? 'Tous les statuts' : s}</option>)}
        </select>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : biensFiltres.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Aucune annonce trouvée</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Titre', 'Agent', 'Ville', 'Prix', 'Statut', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {biensFiltres.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-gray-900 truncate">{b.titre}</p>
                      <p className="text-xs text-gray-400 capitalize">{b.type_bien} · {b.transaction}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-gray-700 text-xs">{b.profiles?.nom_complet || `${b.profiles?.prenom || ''} ${b.profiles?.nom || ''}`.trim() || '-'}</p>
                      <p className="text-gray-400 text-xs">{b.profiles?.email || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{b.ville || '-'}</td>
                    <td className="px-4 py-3 text-green-600 font-semibold whitespace-nowrap">
                      {b.prix ? new Intl.NumberFormat('fr-FR').format(b.prix) + ' FCFA' : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[b.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                        {b.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(b.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link href={`/bien/${b.id}`} target="_blank"
                          className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap">
                          Voir
                        </Link>
                        {b.statut !== 'publié' && (
                          <button onClick={() => changerStatut(b.id, 'publié')}
                            className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors whitespace-nowrap">
                            Publier
                          </button>
                        )}
                        {b.statut === 'publié' && (
                          <button onClick={() => changerStatut(b.id, 'archivé')}
                            className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap">
                            Archiver
                          </button>
                        )}
                        {b.statut === 'archivé' && (
                          <button onClick={() => changerStatut(b.id, 'brouillon')}
                            className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-lg hover:bg-yellow-100 transition-colors whitespace-nowrap">
                            Brouillon
                          </button>
                        )}
                        <button onClick={() => supprimer(b.id)}
                          className="px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap">
                          Suppr.
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}