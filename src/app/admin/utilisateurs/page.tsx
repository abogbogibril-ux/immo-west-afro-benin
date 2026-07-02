'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const ROLES = ['client', 'agent', 'admin']
const ROLE_COLORS: Record<string, string> = { admin: '#7c3aed', agent: '#059669', client: '#1d4ed8' }

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
    if (!confirm('Supprimer definitivement ' + nom + ' ? Tous ses biens seront supprimes du site.')) return
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

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    agents: users.filter(u => u.role === 'agent').length,
    clients: users.filter(u => u.role === 'client').length,
    suspendus: users.filter(u => u.suspendu).length,
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 50, backgroundColor: '#16a34a', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Gestion des utilisateurs</h1>
        <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>{users.length} utilisateur(s) enregistre(s)</p>
      </div>

      {/* STATS RAPIDES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: stats.total, color: '#ffffff', bg: '#1e293b' },
          { label: 'Admins', value: stats.admins, color: '#a78bfa', bg: '#1e293b' },
          { label: 'Agents', value: stats.agents, color: '#34d399', bg: '#1e293b' },
          { label: 'Clients', value: stats.clients, color: '#60a5fa', bg: '#1e293b' },
          { label: 'Suspendus', value: stats.suspendus, color: '#f87171', bg: '#1e293b' },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: '#1e293b', borderRadius: '10px', padding: '1rem', textAlign: 'center', border: '1px solid ' + s.color + '40' }}>
            <div style={{ color: s.color, fontSize: '1.8rem', fontWeight: '800' }}>{s.value}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* FILTRES */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          value={recherche} onChange={e => setRecherche(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          style={{ flex: 1, minWidth: '200px', padding: '0.6rem 1rem', border: '1px solid #334155', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', backgroundColor: '#0f172a', color: '#fff' }}
        />
        <select value={filtreRole} onChange={e => setFiltreRole(e.target.value)}
          style={{ padding: '0.6rem 1rem', border: '1px solid #334155', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', color: '#fff', backgroundColor: '#0f172a' }}>
          <option value="">Tous les roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* TABLEAU */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Chargement...</div>
      ) : (
        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', borderBottom: '2px solid #334155' }}>
                {['Avatar', 'Nom', 'Email', 'Telephone', 'Role', 'Inscription', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '1rem', color: '#64748b', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersFiltres.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #334155', opacity: u.suspendu ? 0.7 : 1 }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: (ROLE_COLORS[u.role] || '#64748b') + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ROLE_COLORS[u.role] || '#64748b', fontWeight: '700', fontSize: '1rem' }}>
                      {(u.nom_complet || u.email || '?')[0].toUpperCase()}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <p style={{ color: '#fff', fontWeight: '600', margin: 0, fontSize: '0.9rem' }}>{u.nom_complet || 'Sans nom'}</p>
                      {u.suspendu && <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', fontSize: '0.65rem', fontWeight: '700', padding: '1px 6px', borderRadius: '999px' }}>SUSPENDU</span>}
                    </div>
                    {u.nom_agence && <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>{u.nom_agence}</p>}
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>{u.email}</td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{u.telephone || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <select value={u.role} onChange={e => changerRole(u.id, e.target.value)}
                      style={{ padding: '0.3rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', border: 'none', cursor: 'pointer', outline: 'none', backgroundColor: (ROLE_COLORS[u.role] || '#64748b') + '20', color: ROLE_COLORS[u.role] || '#64748b' }}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {u.role !== 'admin' && (
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        {/* Suspendre / Reactiver */}
                        <button onClick={() => toggleSuspendre(u.id, u.suspendu, u.nom_complet || u.email)}
                          title={u.suspendu ? 'Reactiver le compte' : 'Suspendre le compte'}
                          style={{ padding: '0.4rem', backgroundColor: u.suspendu ? '#dcfce7' : '#fef9c3', color: u.suspendu ? '#16a34a' : '#ca8a04', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {u.suspendu ? (
                            <svg width='16' height='16' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'/>
                            </svg>
                          ) : (
                            <svg width='16' height='16' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z'/>
                            </svg>
                          )}
                        </button>
                        {/* Supprimer */}
                        <button onClick={() => supprimerUser(u.id, u.nom_complet || u.email)}
                          title='Supprimer definitivement'
                          style={{ padding: '0.4rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width='16' height='16' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {usersFiltres.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Aucun utilisateur trouve</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}