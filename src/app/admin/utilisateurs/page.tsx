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

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const changerRole = async (id: string, role: string) => {
    if (!confirm(`Changer le rôle en "${role}" ?`)) return
    await supabase.from('profiles').update({ role }).eq('id', id)
    loadUsers()
  }

  const supprimerUser = async (id: string) => {
    if (!confirm('Supprimer cet utilisateur définitivement ?')) return
    await supabase.from('profiles').delete().eq('id', id)
    loadUsers()
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
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Gestion des utilisateurs</h1>
        <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>{users.length} utilisateur(s) enregistré(s)</p>
      </div>

      {/* STATS RAPIDES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: stats.total, color: '#0f172a', bg: '#f8fafc' },
          { label: 'Admins', value: stats.admins, color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Agents', value: stats.agents, color: '#059669', bg: '#f0fdf4' },
          { label: 'Clients', value: stats.clients, color: '#1d4ed8', bg: '#eff6ff' },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: s.bg, borderRadius: '10px', padding: '1rem', textAlign: 'center', border: `1px solid ${s.color}20` }}>
            <div style={{ color: s.color, fontSize: '1.8rem', fontWeight: '800' }}>{s.value}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* FILTRES */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          value={recherche} onChange={e => setRecherche(e.target.value)}
          placeholder="🔍 Rechercher par nom ou email..."
          style={{ flex: 1, minWidth: '200px', padding: '0.6rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
        />
        <select value={filtreRole} onChange={e => setFiltreRole(e.target.value)}
          style={{ padding: '0.6rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', color: '#374151' }}>
          <option value="">Tous les rôles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* TABLEAU */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Chargement...</div>
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['Avatar', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Inscription', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '1rem', color: '#64748b', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersFiltres.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      backgroundColor: ROLE_COLORS[u.role] + '20',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: ROLE_COLORS[u.role], fontWeight: '700', fontSize: '1rem',
                    }}>
                      {(u.nom_complet || u.email || '?')[0].toUpperCase()}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <p style={{ color: '#0f172a', fontWeight: '600', margin: 0, fontSize: '0.9rem' }}>{u.nom_complet || 'Sans nom'}</p>
                    {u.nom_agence && <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>{u.nom_agence}</p>}
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>{u.email}</td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>{u.telephone || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <select value={u.role} onChange={e => changerRole(u.id, e.target.value)}
                      style={{
                        padding: '0.3rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600',
                        border: 'none', cursor: 'pointer', outline: 'none',
                        backgroundColor: `${ROLE_COLORS[u.role]}20`, color: ROLE_COLORS[u.role],
                      }}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {u.role !== 'admin' && (
                      <button onClick={() => supprimerUser(u.id)}
                        style={{ padding: '0.4rem 0.75rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                        🗑️ Suppr.
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {usersFiltres.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Aucun utilisateur trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}