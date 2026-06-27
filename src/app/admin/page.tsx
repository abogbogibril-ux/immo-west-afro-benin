'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Stats = {
  clients: number
  agents: number
  biens: number
  messages: number
}

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ clients: 0, agents: 0, biens: 0, messages: 0 })
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState<'stats' | 'utilisateurs' | 'biens' | 'messages'>('stats')
  const [utilisateurs, setUtilisateurs] = useState<any[]>([])
  const [biens, setBiens] = useState<any[]>([])

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/connexion'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/'); return }
    loadStats()
    loadUtilisateurs()
    loadBiens()
  }

  const loadStats = async () => {
    const [{ count: clients }, { count: agents }, { count: biens }, { count: messages }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'agent'),
      supabase.from('biens').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
    ])
    setStats({ clients: clients || 0, agents: agents || 0, biens: biens || 0, messages: messages || 0 })
    setLoading(false)
  }

  const loadUtilisateurs = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUtilisateurs(data || [])
  }

  const loadBiens = async () => {
    const { data } = await supabase.from('biens').select('*, profiles(nom_complet)').order('created_at', { ascending: false })
    setBiens(data || [])
  }

  const supprimerUtilisateur = async (id: string) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    await supabase.from('profiles').delete().eq('id', id)
    loadUtilisateurs()
    loadStats()
  }

  const supprimerBien = async (id: string) => {
    if (!confirm('Supprimer ce bien ?')) return
    await supabase.from('biens').delete().eq('id', id)
    loadBiens()
    loadStats()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/connexion')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#fff' }}>Chargement...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: '240px', backgroundColor: '#1e293b', padding: '2rem 1rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0,
      }}>
        <div style={{ color: '#00bcd4', fontWeight: '800', fontSize: '1.1rem', marginBottom: '2rem', textAlign: 'center' }}>
          🏠 Admin Panel
        </div>
        {(['stats', 'utilisateurs', 'biens', 'messages'] as const).map((o) => (
          <button key={o} onClick={() => setOnglet(o)} style={{
            padding: '0.75rem 1rem', borderRadius: '8px', border: 'none',
            backgroundColor: onglet === o ? '#00bcd4' : 'transparent',
            color: onglet === o ? '#fff' : '#94a3b8',
            fontWeight: '500', cursor: 'pointer', textAlign: 'left', textTransform: 'capitalize',
          }}>
            {o === 'stats' ? '📊 Statistiques' : o === 'utilisateurs' ? '👥 Utilisateurs' : o === 'biens' ? '🏘️ Biens' : '💬 Messages'}
          </button>
        ))}
        <button onClick={handleLogout} style={{
          marginTop: 'auto', padding: '0.75rem 1rem', borderRadius: '8px',
          border: '1px solid #ef4444', backgroundColor: 'transparent',
          color: '#ef4444', cursor: 'pointer', fontWeight: '500',
        }}>
          🚪 D&eacute;connexion
        </button>
      </aside>

      {/* CONTENU */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>
          {onglet === 'stats' ? 'Tableau de bord' : onglet === 'utilisateurs' ? 'Gestion des utilisateurs' : onglet === 'biens' ? 'Gestion des biens' : 'Messages'}
        </h1>

        {/* STATS */}
        {onglet === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              { label: 'Clients', value: stats.clients, icon: '👤', color: '#3b82f6' },
              { label: 'Agents', value: stats.agents, icon: '🏢', color: '#10b981' },
              { label: 'Biens publi&eacute;s', label2: 'Biens publiés', value: stats.biens, icon: '🏘️', color: '#f59e0b' },
              { label: 'Messages', value: stats.messages, icon: '💬', color: '#8b5cf6' },
            ].map((s) => (
              <div key={s.label} style={{
                backgroundColor: '#1e293b', borderRadius: '12px', padding: '1.5rem',
                borderLeft: `4px solid ${s.color}`,
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '800' }}>{s.value}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{s.label2 || s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* UTILISATEURS */}
        {onglet === 'utilisateurs' && (
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a' }}>
                  {['Nom', 'Email', 'Rôle', 'Téléphone', 'Action'].map(h => (
                    <th key={h} style={{ padding: '1rem', color: '#94a3b8', textAlign: 'left', fontSize: '0.85rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map((u) => (
                  <tr key={u.id} style={{ borderTop: '1px solid #334155' }}>
                    <td style={{ padding: '1rem', color: '#fff' }}>{u.nom_complet || '-'}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600',
                        backgroundColor: u.role === 'admin' ? '#7c3aed' : u.role === 'agent' ? '#059669' : '#1d4ed8',
                        color: '#fff',
                      }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{u.telephone || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      {u.role !== 'admin' && (
                        <button onClick={() => supprimerUtilisateur(u.id)} style={{
                          padding: '0.4rem 0.75rem', backgroundColor: '#ef4444', color: '#fff',
                          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
                        }}>Supprimer</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BIENS */}
        {onglet === 'biens' && (
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a' }}>
                  {['Titre', 'Agent', 'Ville', 'Prix', 'Statut', 'Action'].map(h => (
                    <th key={h} style={{ padding: '1rem', color: '#94a3b8', textAlign: 'left', fontSize: '0.85rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {biens.map((b) => (
                  <tr key={b.id} style={{ borderTop: '1px solid #334155' }}>
                    <td style={{ padding: '1rem', color: '#fff' }}>{b.titre}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{b.profiles?.nom_complet || '-'}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{b.ville || '-'}</td>
                    <td style={{ padding: '1rem', color: '#10b981' }}>{b.prix ? `${b.prix.toLocaleString()} FCFA` : '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem',
                        backgroundColor: b.statut === 'disponible' ? '#059669' : b.statut === 'reserve' ? '#d97706' : '#6b7280',
                        color: '#fff',
                      }}>{b.statut}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button onClick={() => supprimerBien(b.id)} style={{
                        padding: '0.4rem 0.75rem', backgroundColor: '#ef4444', color: '#fff',
                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
                      }}>Supprimer</button>
                    </td>
                  </tr>
                ))}
                {biens.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>Aucun bien publié</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* MESSAGES */}
        {onglet === 'messages' && (
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <p style={{ color: '#94a3b8' }}>Les statistiques de messagerie seront disponibles ici.</p>
          </div>
        )}
      </main>
    </div>
  )
}