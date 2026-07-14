'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const ROLES = ['client', 'agent', 'admin']
const ROLE_COLORS: Record<string, string> = {
  admin: 'text-purple-400 bg-purple-400/10',
  agent: 'text-emerald-400 bg-emerald-400/10',
  client: 'text-blue-400 bg-blue-400/10',
}

export default function UtilisateursAdmin() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtreRole, setFiltreRole] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) showToast('Erreur chargement : ' + error.message, 'error')
    setUsers(data || [])
    setLoading(false)
  }

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  /* ── Changer le rôle ─────────────────────────────────────── */
  const changerRole = async (id: string, role: string) => {
    if (!confirm('Changer le rôle en "' + role + '" ?')) return
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (error) { showToast('❌ Échec changement de rôle : ' + error.message, 'error'); return }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
    showToast('✅ Rôle modifié en "' + role + '"')
  }

  /* ── Suspendre / Réactiver ───────────────────────────────── */
  const toggleSuspendre = async (id: string, suspendu: boolean, nom: string) => {
    const action = suspendu ? 'réactiver' : 'suspendre'
    if (!confirm('Êtes-vous sûr de vouloir ' + action + ' le compte de ' + nom + ' ?')) return

    const { error } = await supabase
      .from('profiles')
      .update({ suspendu: !suspendu })
      .eq('id', id)

    if (error) { showToast('❌ Échec : ' + error.message, 'error'); return }

    // Si on suspend → archiver automatiquement tous ses biens publiés
    if (!suspendu) {
      const { error: errBiens } = await supabase
        .from('biens')
        .update({ statut: 'archivé' })
        .eq('agent_id', id)
        .eq('statut', 'publié')
      if (errBiens) showToast('⚠️ Compte suspendu mais biens non archivés : ' + errBiens.message, 'error')
      else showToast('⚠️ Compte suspendu — biens publiés archivés automatiquement')
    } else {
      showToast('✅ Compte réactivé — l\'agent peut à nouveau publier')
    }

    setUsers(prev => prev.map(u => u.id === id ? { ...u, suspendu: !suspendu } : u))
  }

  /* ── Supprimer ───────────────────────────────────────────── */
  const supprimerUser = async (id: string, nom: string) => {
    if (!confirm('Supprimer définitivement ' + nom + ' et tous ses biens ?')) return

    // Supprimer images → biens → profil (ordre respectant les FK)
    const { error: errImg } = await supabase
      .from('images_biens')
      .delete()
      .in('bien_id',
        (await supabase.from('biens').select('id').eq('agent_id', id)).data?.map((b: any) => b.id) || []
      )
    if (errImg) { showToast('❌ Erreur suppression images : ' + errImg.message, 'error'); return }

    const { error: errBiens } = await supabase.from('biens').delete().eq('agent_id', id)
    if (errBiens) { showToast('❌ Erreur suppression biens : ' + errBiens.message, 'error'); return }

    const { error: errProfil } = await supabase.from('profiles').delete().eq('id', id)
    if (errProfil) { showToast('❌ Erreur suppression profil : ' + errProfil.message, 'error'); return }

    setUsers(prev => prev.filter(u => u.id !== id))
    showToast('✅ Utilisateur supprimé définitivement')
  }

  const usersFiltres = users.filter(u => {
    const matchRecherche = !recherche ||
      u.nom_complet?.toLowerCase().includes(recherche.toLowerCase()) ||
      u.email?.toLowerCase().includes(recherche.toLowerCase())
    const matchRole = !filtreRole || u.role === filtreRole
    return matchRecherche && matchRole
  })

  const stats = [
    { label: 'Total',     value: users.length,                            color: 'text-white border-white/20' },
    { label: 'Admins',    value: users.filter(u => u.role === 'admin').length,  color: 'text-purple-400 border-purple-400/30' },
    { label: 'Agents',    value: users.filter(u => u.role === 'agent').length,  color: 'text-emerald-400 border-emerald-400/30' },
    { label: 'Clients',   value: users.filter(u => u.role === 'client').length, color: 'text-blue-400 border-blue-400/30' },
    { label: 'Suspendus', value: users.filter(u => u.suspendu).length,         color: 'text-red-400 border-red-400/30' },
  ]

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl font-semibold shadow-lg text-sm text-white ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white m-0">Gestion des utilisateurs</h1>
        <p className="text-slate-400 mt-1">{users.length} utilisateur(s) enregistré(s)</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {stats.map(s => {
          const [textColor, borderColor] = s.color.split(' ')
          return (
            <div key={s.label} className={`bg-[#1e293b] rounded-xl p-4 text-center border ${borderColor}`}>
              <div className={`text-3xl font-extrabold ${textColor}`}>{s.value}</div>
              <div className="text-slate-400 text-xs mt-1">{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* FILTRES */}
      <div className="bg-[#1e293b] rounded-xl p-5 mb-6 shadow-lg border border-[#334155] flex gap-4 flex-wrap">
        <input
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="flex-1 min-w-[200px] px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm outline-none focus:border-[#00bcd4] transition-colors placeholder-slate-600"
        />
        <select
          value={filtreRole}
          onChange={e => setFiltreRole(e.target.value)}
          className="px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm outline-none focus:border-[#00bcd4] transition-colors"
        >
          <option value="">Tous les rôles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* TABLEAU */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Chargement...</div>
      ) : (
        <div className="bg-[#1e293b] rounded-xl shadow-lg border border-[#334155] overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#0f172a] border-b-2 border-[#334155]">
                {['Avatar', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Inscription', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-slate-500 text-left text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersFiltres.map(u => (
                <tr
                  key={u.id}
                  className={`border-b border-[#334155] hover:bg-[#0f172a] transition-colors ${u.suspendu ? 'opacity-60' : ''}`}
                >
                  {/* Avatar */}
                  <td className="px-4 py-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base ${ROLE_COLORS[u.role] || 'text-slate-400 bg-slate-400/10'}`}>
                      {(u.nom_complet || u.email || '?')[0].toUpperCase()}
                    </div>
                  </td>

                  {/* Nom */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold m-0 text-sm">{u.nom_complet || 'Sans nom'}</p>
                      {u.suspendu && (
                        <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                          SUSPENDU
                        </span>
                      )}
                    </div>
                    {u.nom_agence && <p className="text-slate-400 text-xs mt-0.5 m-0">{u.nom_agence}</p>}
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 text-slate-300 text-sm">{u.email}</td>

                  {/* Téléphone */}
                  <td className="px-4 py-3 text-slate-300 text-sm whitespace-nowrap">{u.telephone || '-'}</td>

                  {/* Rôle */}
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={e => changerRole(u.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border-none cursor-pointer outline-none ${ROLE_COLORS[u.role] || 'text-slate-400 bg-slate-400/10'}`}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>

                  {/* Inscription */}
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {u.role !== 'admin' && (
                      <div className="flex gap-2 items-center">

                        {/* Suspendre / Réactiver */}
                        <button
                          onClick={() => toggleSuspendre(u.id, u.suspendu, u.nom_complet || u.email)}
                          title={u.suspendu ? 'Réactiver le compte' : 'Suspendre le compte'}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-none cursor-pointer text-xs font-semibold transition-colors ${
                            u.suspendu
                              ? 'bg-green-500/15 text-green-400 hover:bg-green-500/30'
                              : 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/30'
                          }`}
                        >
                          {u.suspendu ? (
                            <>
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              Activer
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              Suspendre
                            </>
                          )}
                        </button>

                        {/* Supprimer */}
                        <button
                          onClick={() => supprimerUser(u.id, u.nom_complet || u.email)}
                          title="Supprimer définitivement"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/15 text-red-400 hover:bg-red-500/30 rounded-lg border-none cursor-pointer text-xs font-semibold transition-colors"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                          Supprimer
                        </button>

                      </div>
                    )}
                    {u.role === 'admin' && (
                      <span className="text-slate-600 text-xs italic">Protégé</span>
                    )}
                  </td>
                </tr>
              ))}

              {usersFiltres.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
