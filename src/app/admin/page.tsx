'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Stats = {
  agents: number
  proprietaires: number
  biensPublies: number
  biensBrouillons: number
  besoins: number
  messages: number
  signalements: number
}

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ agents: 0, proprietaires: 0, biensPublies: 0, biensBrouillons: 0, besoins: 0, messages: 0 })
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState<'stats' | 'utilisateurs' | 'biens' | 'besoins' | 'signalements' | 'messages'>('stats')
  const [utilisateurs, setUtilisateurs] = useState<any[]>([])
  const [biens, setBiens] = useState<any[]>([])
  const [besoins, setBesoins] = useState<any[]>([])
  const [signalements, setSignalements] = useState<any[]>([])
  const [filtreStatut, setFiltreStatut] = useState<string>('tous')

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
    loadBesoins()
  }

  const loadStats = async () => {
    const [
      { count: agents },
      { count: proprietaires },
      { count: biensPublies },
      { count: biensBrouillons },
      { count: besoins },
      { count: signalementsCount },
      { count: messages },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'agent'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'proprietaire'),
      supabase.from('biens').select('*', { count: 'exact', head: true }).eq('statut', 'publié'),
      supabase.from('biens').select('*', { count: 'exact', head: true }).eq('statut', 'brouillon'),
      supabase.from('besoins').select('*', { count: 'exact', head: true }),
      supabase.from('signalements').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
    ])
    setStats({
      agents: agents || 0,
      proprietaires: proprietaires || 0,
      biensPublies: biensPublies || 0,
      biensBrouillons: biensBrouillons || 0,
      besoins: besoins || 0,
      signalements: signalementsCount || 0,
      messages: messages || 0,
    })
    setLoading(false)
  }

  const loadUtilisateurs = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUtilisateurs(data || [])
  }

  const loadBiens = async () => {
    const { data } = await supabase
      .from('biens')
      .select('*, profiles(nom_complet, nom, prenom)')
      .order('created_at', { ascending: false })
    setBiens(data || [])
  }

  const loadBesoins = async () => {
    const { data } = await supabase
      .from('besoins')
      .select('*')
      .order('created_at', { ascending: false })
    setBesoins(data || [])
  }

  const loadSignalements = async () => {
    const { data } = await supabase
      .from('signalements')
      .select('*, biens(titre)')
      .order('created_at', { ascending: false })
    setSignalements(data || [])
  }

  const supprimerSignalement = async (id: string) => {
    if (!confirm('Supprimer ce signalement ?')) return
    await supabase.from('signalements').delete().eq('id', id)
    loadSignalements()
  }

  const changerStatutSignalement = async (id: string, nouveauStatut: string) => {
    await supabase.from('signalements').update({ statut: nouveauStatut }).eq('id', id)
    loadSignalements()
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

  const changerStatutBien = async (id: string, nouveauStatut: string) => {
    await supabase.from('biens').update({ statut: nouveauStatut }).eq('id', id)
    loadBiens()
    loadStats()
  }

  const supprimerBesoin = async (id: string) => {
    if (!confirm('Supprimer ce besoin ?')) return
    await supabase.from('besoins').delete().eq('id', id)
    loadBesoins()
    loadStats()
  }

  const changerStatutBesoin = async (id: string, nouveauStatut: string) => {
    await supabase.from('besoins').update({ statut: nouveauStatut }).eq('id', id)
    loadBesoins()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/connexion')
  }

  const biensFiltres = filtreStatut === 'tous' ? biens : biens.filter(b => b.statut === filtreStatut)

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
          Admin Panel
        </div>
        {([
          { key: 'stats', label: 'Statistiques' },
          { key: 'utilisateurs', label: 'Utilisateurs' },
          { key: 'biens', label: 'Biens' },
          { key: 'besoins', label: 'Besoins', badge: stats.besoins },
          { key: 'signalements', label: 'Signalements', badge: stats.signalements },
          { key: 'messages', label: 'Messages' },
        ] as const).map((o) => (
          <button key={o.key} onClick={() => setOnglet(o.key as any)} style={{
            padding: '0.75rem 1rem', borderRadius: '8px', border: 'none',
            backgroundColor: onglet === o.key ? '#00bcd4' : 'transparent',
            color: onglet === o.key ? '#fff' : '#94a3b8',
            fontWeight: '500', cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>{o.label}</span>
            {'badge' in o && o.badge ? (
              <span style={{
                backgroundColor: onglet === o.key ? 'rgba(255,255,255,0.3)' : '#ef4444',
                color: '#fff', fontSize: '0.7rem', fontWeight: '700',
                padding: '2px 7px', borderRadius: '999px',
              }}>{o.badge}</span>
            ) : null}
          </button>
        ))}
        <button onClick={handleLogout} style={{
          marginTop: 'auto', padding: '0.75rem 1rem', borderRadius: '8px',
          border: '1px solid #ef4444', backgroundColor: 'transparent',
          color: '#ef4444', cursor: 'pointer', fontWeight: '500',
        }}>
          Déconnexion
        </button>
      </aside>

      {/* CONTENU */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem' }}>
          {onglet === 'stats' ? 'Tableau de bord'
            : onglet === 'utilisateurs' ? 'Gestion des utilisateurs'
            : onglet === 'biens' ? 'Modération des biens'
            : onglet === 'besoins' ? 'Besoins déposés'
            : onglet === 'signalements' ? 'Signalements'
            : 'Messages'}
        </h1>

        {/* STATS */}
        {onglet === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              { label: 'Agents', value: stats.agents, color: '#3b82f6' },
              { label: 'Propriétaires', value: stats.proprietaires, color: '#10b981' },
              { label: 'Biens publiés', value: stats.biensPublies, color: '#059669' },
              { label: 'Brouillons', value: stats.biensBrouillons, color: '#d97706' },
              { label: 'Besoins déposés', value: stats.besoins, color: '#ef4444' },
              { label: 'Signalements', value: stats.signalements, color: '#dc2626' },
              { label: 'Messages', value: stats.messages, color: '#8b5cf6' },
            ].map((s) => (
              <div key={s.label} style={{
                backgroundColor: '#1e293b', borderRadius: '12px', padding: '1.5rem',
                borderLeft: `4px solid ${s.color}`,
              }}>
                <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '800' }}>{s.value}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{s.label}</div>
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
                    <td style={{ padding: '1rem', color: '#fff' }}>{u.nom_complet || `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || '-'}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600',
                        backgroundColor: u.role === 'admin' ? '#7c3aed' : u.role === 'agent' ? '#059669' : u.role === 'proprietaire' ? '#0891b2' : '#1d4ed8',
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
          <>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[
                { val: 'tous', label: 'Tous' },
                { val: 'publié', label: 'Publiés' },
                { val: 'brouillon', label: 'Brouillons' },
              ].map(f => (
                <button key={f.val} onClick={() => setFiltreStatut(f.val)} style={{
                  padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                  backgroundColor: filtreStatut === f.val ? '#00bcd4' : '#1e293b',
                  color: filtreStatut === f.val ? '#fff' : '#94a3b8',
                  cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
                }}>{f.label}</button>
              ))}
            </div>
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
                  {biensFiltres.map((b) => (
                    <tr key={b.id} style={{ borderTop: '1px solid #334155' }}>
                      <td style={{ padding: '1rem', color: '#fff', maxWidth: '250px' }}>{b.titre}</td>
                      <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                        {b.profiles?.nom_complet || `${b.profiles?.prenom ?? ''} ${b.profiles?.nom ?? ''}`.trim() || '-'}
                      </td>
                      <td style={{ padding: '1rem', color: '#cbd5e1' }}>{b.ville || '-'}</td>
                      <td style={{ padding: '1rem', color: '#10b981' }}>{b.prix ? `${b.prix.toLocaleString()} FCFA` : '-'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem',
                          backgroundColor: b.statut === 'publié' ? '#059669' : b.statut === 'brouillon' ? '#d97706' : '#6b7280',
                          color: '#fff',
                        }}>{b.statut}</span>
                      </td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.4rem' }}>
                        {b.statut === 'brouillon' && (
                          <button onClick={() => changerStatutBien(b.id, 'publié')} style={{
                            padding: '0.4rem 0.75rem', backgroundColor: '#059669', color: '#fff',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
                          }}>Publier</button>
                        )}
                        {b.statut === 'publié' && (
                          <button onClick={() => changerStatutBien(b.id, 'brouillon')} style={{
                            padding: '0.4rem 0.75rem', backgroundColor: '#d97706', color: '#fff',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
                          }}>Dépublier</button>
                        )}
                        <button onClick={() => supprimerBien(b.id)} style={{
                          padding: '0.4rem 0.75rem', backgroundColor: '#ef4444', color: '#fff',
                          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
                        }}>Suppr.</button>
                      </td>
                    </tr>
                  ))}
                  {biensFiltres.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>Aucun bien</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* BESOINS */}
        {onglet === 'besoins' && (
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a' }}>
                  {['Type', 'Ville', 'Budget', 'Contact', 'Description', 'Statut', 'Action'].map(h => (
                    <th key={h} style={{ padding: '1rem', color: '#94a3b8', textAlign: 'left', fontSize: '0.85rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {besoins.map((b) => (
                  <tr key={b.id} style={{ borderTop: '1px solid #334155' }}>
                    <td style={{ padding: '1rem', color: '#fff' }}>
                      {b.type_besoin}<br/>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{b.transaction}</span>
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{b.ville}</td>
                    <td style={{ padding: '1rem', color: '#10b981', fontSize: '0.8rem' }}>
                      {b.budget_min ? `${b.budget_min.toLocaleString()}` : '?'} - {b.budget_max ? `${b.budget_max.toLocaleString()} FCFA` : '?'}
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                      {b.nom || 'Anonyme'}<br/>
                      <a href={`tel:${b.telephone}`} style={{ color: '#00bcd4', fontSize: '0.8rem' }}>{b.telephone}</a>
                    </td>
                    <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem', maxWidth: '220px' }}>
                      {b.description || '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select value={b.statut} onChange={e => changerStatutBesoin(b.id, e.target.value)} style={{
                        backgroundColor: b.statut === 'nouveau' ? '#0891b2' : b.statut === 'traite' ? '#059669' : '#6b7280',
                        color: '#fff', border: 'none', borderRadius: '6px', padding: '0.3rem 0.5rem', fontSize: '0.75rem',
                      }}>
                        <option value="nouveau">Nouveau</option>
                        <option value="en_cours">En cours</option>
                        <option value="traite">Traité</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button onClick={() => supprimerBesoin(b.id)} style={{
                        padding: '0.4rem 0.75rem', backgroundColor: '#ef4444', color: '#fff',
                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
                      }}>Suppr.</button>
                    </td>
                  </tr>
                ))}
                {besoins.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>Aucun besoin déposé</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* SIGNALEMENTS */}
        {onglet === 'signalements' && (
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a' }}>
                  {['Bien', 'Motif', 'Description', 'Email', 'Statut', 'Action'].map(h => (
                    <th key={h} style={{ padding: '1rem', color: '#94a3b8', textAlign: 'left', fontSize: '0.85rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {signalements.map((s) => (
                  <tr key={s.id} style={{ borderTop: '1px solid #334155' }}>
                    <td style={{ padding: '1rem', color: '#fff', maxWidth: '200px' }}>{s.biens?.titre || 'Bien supprimé'}</td>
                    <td style={{ padding: '1rem', color: '#fca5a5', fontWeight: '600', fontSize: '0.85rem' }}>{s.motif}</td>
                    <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem', maxWidth: '220px' }}>{s.description || '-'}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.8rem' }}>{s.email_signaleur || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      <select value={s.statut} onChange={e => changerStatutSignalement(s.id, e.target.value)} style={{
                        backgroundColor: s.statut === 'nouveau' ? '#dc2626' : '#059669',
                        color: '#fff', border: 'none', borderRadius: '6px', padding: '0.3rem 0.5rem', fontSize: '0.75rem',
                      }}>
                        <option value="nouveau">Nouveau</option>
                        <option value="traite">Traité</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button onClick={() => supprimerSignalement(s.id)} style={{
                        padding: '0.4rem 0.75rem', backgroundColor: '#ef4444', color: '#fff',
                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
                      }}>Suppr.</button>
                    </td>
                  </tr>
                ))}
                {signalements.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>Aucun signalement</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* MESSAGES */}
        {onglet === 'messages' && (
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8' }}>Total des messages échangés : {stats.messages}</p>
          </div>
        )}
      </main>
    </div>
  )
}