'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const ROLES = ['client', 'agent', 'admin']
const ROLE_COLORS: Record<string, string> = {
  admin: 'text-purple-400 bg-purple-400/10',
  agent: 'text-emerald-400 bg-emerald-400/10',
  client: 'text-blue-400 bg-blue-400/10'
}

export default function UtilisateursAdmin() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtreRole, setFiltreRole] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const changerRole = async (id: string, role: string) => {
    if (!confirm('Changer le role en "' + role + '" ?')) return
    await supabase.from('profiles').update({ role }).eq('id', id)
    loadUsers()
    showToast('Role modifie')
  }

  const toggleSuspendre = async (id: string, suspendu: boolean, nom: string) => {
    const action = suspendu ? 'reactiver' : 'suspendre'
    if (!confirm('Etes-vous sur de vouloir ' + action + ' le compte de ' + nom + ' ?')) return
    await supabase.from('profiles').update({ suspendu: !suspendu }).eq('id', id)
    loadUsers()
    showToast(suspendu ? 'Compte reactive' : 'Compte suspendu')
  }

  const supprimerUser = async (id: string, nom: string) => {
    if (!confirm('Supprimer definitivement ' + nom + ' ?')) return
    await supabase.from('biens').delete().eq('agent_id', id)
    await supabase.from('profiles').delete().eq('id', id)
    loadUsers()
    showToast('Utilisateur supprime')
  }

  const usersFiltres = users.filter(u => {
    const matchRecherche = !recherche ||
      u.nom_complet?.toLowerCase().includes(recherche.toLowerCase()) ||
      u.email?.toLowerCase().includes(recherche.toLowerCase())
    const matchRole = !filtreRole || u.role === filtreRole
    return matchRecherche && matchRole
  })

  const stats = [
    { label: 'Total', value: users.length, color: 'text-white border-white/20' },
    { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'text-purple-400 border-purple-400/30' },
    { label: 'Agents', value: users.filter(u => u.role === 'agent').length, color: 'text-emerald-400 border-emerald-400/30' },
    { label: 'Clients', value: users.filter(u => u.role === 'client').length, color: 'text-blue-400 border-blue-400/30' },
    { label: 'Suspendus', value: users.filter(u => u.suspendu).length, color: 'text-red-400 border-red-400/30' },
  ]

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white m-0">Gestion des utilisateurs</h1>
        <p className="text-slate-400 mt-1">{users.length} utilisateur(s) enregistre(s)</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className={`bg-[#1e293b] rounded-xl p-4 text-center border ${s.color.split(' ')[1] || 'border-white/10'}`}>
            <div className={`text-3xl font-extrabold ${s.color.split(' ')[0]}`}>{s.value}</div>
            <div className="text-slate-400 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* FILTRES */}
      <div className="bg-[#1e293b] rounded-xl p-5 mb-6 shadow-lg border border-[#334155] flex gap-4 flex-wrap">
        <input value={recherche} onChange={e => setRecherche(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="flex-1 min-w-[200px] px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm outline-none focus:border-[#00bcd4] transition-colors placeholder-slate-600" />
        <select value={filtreRole} onChange={e => setFiltreRole(e.target.value)}
          className="px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm outline-none focus:border-[#00bcd4] transition-colors">
          <option value="">Tous les roles</option>
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
                {['Avatar', 'Nom', 'Email', 'Telephone', 'Role', 'Inscription', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-slate-500 text-left text-xs font-bold uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersFiltres.map(u => (
                <tr key={u.id} className={`border-b border-[#334155] hover:bg-[#0f172a] transition-colors ${u.suspendu ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base ${ROLE_COLORS[u.role] || 'text-slate-400 bg-slate-400/10'}`}>
                      {(u.nom_complet || u.email || '?')[0].toUpperCase()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold m-0 text-sm">{u.nom_complet || 'Sans nom'}</p>
                      {u.suspendu && <span className="bg-red-100 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full">SUSPENDU</span>}
                    </div>
                    {u.nom_agence && <p className="text-slate-400 text-xs mt-0.5 m-0">{u.nom_agence}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{u.email}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm whitespace-nowrap">{u.telephone || '-'}</td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={e => changerRole(u.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border-none cursor-pointer outline-none ${ROLE_COLORS[u.role] || 'text-slate-400 bg-slate-400/10'}`}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== 'admin' && (
                      <div className="flex gap-1 items-center">
                        <button onClick={() => toggleSuspendre(u.id, u.suspendu, u.nom_complet || u.email)}
                          title={u.suspendu ? 'Reactiver' : 'Suspendre'}
                          className={`p-1.5 rounded-lg border-none cursor-pointer flex items-center justify-center transition-colors ${
                            u.suspendu ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                          }`}>
                          {u.suspendu ? (
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          )}
                        </button>
                        <button onClick={() => supprimerUser(u.id, u.nom_complet || u.email)}
                          title="Supprimer"
                          className="p-1.5 bg-red-100 text-red-500 rounded-lg border-none cursor-pointer flex items-center justify-center hover:bg-red-200 transition-colors">
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {usersFiltres.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Aucun utilisateur trouve</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}