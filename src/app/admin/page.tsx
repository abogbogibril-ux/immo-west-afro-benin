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
    loadSignalements()
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
    loadSignalements()
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
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a' }}>
                  {['Nom', 'Email', 'Rôle', 'Tél', 'Action'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.75rem', color: '#94a3b8', textAlign: 'left', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map((u) => (
                  <tr key={u.id} style={{ borderTop: '1px solid #334155', verticalAlign: 'middle' }}>
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
                          padding: '0.35rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}><svg width='14' height='14' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'/></svg></button>
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
            <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a' }}>
                    {['Titre', 'Ville', 'Prix', 'Statut', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.75rem', color: '#94a3b8', textAlign: 'left', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {biensFiltres.map((b) => (
                    <tr key={b.id} style={{ borderTop: '1px solid #334155', verticalAlign: 'middle' }}>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#f1f5f9', fontSize: '0.82rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.titre}</td>



                      <td style={{ padding: '0.6rem 0.75rem', color: '#cbd5e1', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{b.ville || '-'}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#34d399', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{b.prix ? new Intl.NumberFormat('fr-FR').format(b.prix) + ' F' : '-'}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem',
                          backgroundColor: b.statut === 'publié' ? '#059669' : b.statut === 'brouillon' ? '#d97706' : '#6b7280',
                          color: '#fff',
                        }}>{b.statut}</span>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem' }}><div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        {b.statut === 'brouillon' && (
                          <button onClick={() => changerStatutBien(b.id, 'publié')} style={{
                            padding: '0.35rem', backgroundColor: '#dcfce7', color: '#059669', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}><svg width='14' height='14' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'/></svg></button>
                        )}
                        {b.statut === 'publié' && (
                          <button onClick={() => changerStatutBien(b.id, 'brouillon')} style={{
                            padding: '0.35rem', backgroundColor: '#fef9c3', color: '#d97706', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}><svg width='14' height='14' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'/></svg></button>
                        )}
                        <button onClick={() => supprimerBien(b.id)} style={{
                          padding: '0.35rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}><svg width='14' height='14' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'/></svg></button>
                      </div></td>
                    </tr>
                  ))}
                  {biensFiltres.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>Aucun bien</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* BESOINS */}
        {onglet === 'besoins' && (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a' }}>
                    {['Type', 'Ville', 'Contact', 'Statut', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.75rem', color: '#94a3b8', textAlign: 'left', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {besoins.map((b) => (
                    <tr key={b.id} style={{ borderTop: '1px solid #334155', verticalAlign: 'middle' }}>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#fff', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        <span style={{ textTransform: 'capitalize' }}>{b.type_besoin}</span>
                        <br/>
                        <span style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'capitalize' }}>{b.transaction}</span>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#cbd5e1', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{b.ville || '-'}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#cbd5e1', fontSize: '0.8rem' }}>
                        <span style={{ display: 'block' }}>{b.nom || 'Anonyme'}</span>
                        <a href={'tel:' + b.telephone} style={{ color: '#00bcd4', fontSize: '0.75rem' }}>{b.telephone}</a>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <select value={b.statut} onChange={e => changerStatutBesoin(b.id, e.target.value)} style={{
                          backgroundColor: b.statut === 'nouveau' ? '#0891b2' : b.statut === 'traite' ? '#059669' : '#6b7280',
                          color: '#fff', border: 'none', borderRadius: '6px', padding: '0.25rem 0.4rem', fontSize: '0.7rem', cursor: 'pointer',
                        }}>
                          <option value="nouveau">Nouveau</option>
                          <option value="en_cours">En cours</option>
                          <option value="traite">Traite</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                          <a href={'/besoins/' + b.id} target="_blank" title="Voir le besoin"
                            style={{ padding: '0.35rem', backgroundColor: '#1e40af20', color: '#60a5fa', borderRadius: '6px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          </a>
                          <button onClick={() => supprimerBesoin(b.id)} title="Supprimer"
                            style={{ padding: '0.35rem', backgroundColor: '#fee2e210', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {besoins.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>Aucun besoin depose</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SIGNALEMENTS */}
        {onglet === 'signalements' && (
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a' }}>
                  {['Bien', 'Motif', 'Description', 'Email', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.75rem', color: '#94a3b8', textAlign: 'left', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {signalements.map((s) => (
                  <tr key={s.id} style={{ borderTop: '1px solid #334155', verticalAlign: 'middle' }}>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#fff', fontSize: '0.8rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.biens?.titre || 'Bien supprime'}</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#fca5a5', fontWeight: '600', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{s.motif}</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#94a3b8', fontSize: '0.78rem', maxWidth: '200px' }}><div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{s.description || '-'}</div></td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#cbd5e1', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{s.email_signaleur || '-'}</td>









                    <td style={{ padding: '0.6rem 0.75rem' }}><div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      {s.bien_id && (<a href={'/bien/' + s.bien_id} target='_blank' title='Voir le bien' style={{ padding: '0.35rem', backgroundColor: '#1e40af20', color: '#60a5fa', borderRadius: '6px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}><svg width='14' height='14' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'/></svg></a>)}
                      <button onClick={() => supprimerSignalement(s.id)} title='Supprimer' style={{ padding: '0.35rem', backgroundColor: '#fee2e210', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><svg width='14' height='14' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'/></svg></button>
                    </div></td>


                  </tr>
                ))}
                {signalements.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>Aucun signalement</td></tr>
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