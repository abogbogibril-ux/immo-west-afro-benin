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
  vuesTotal: number
}

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ agents: 0, proprietaires: 0, biensPublies: 0, biensBrouillons: 0, besoins: 0, messages: 0, signalements: 0, vuesTotal: 0 })
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState<'stats' | 'utilisateurs' | 'biens' | 'besoins' | 'signalements' | 'messages'>('stats')
  const [utilisateurs, setUtilisateurs] = useState<any[]>([])
  const [biens, setBiens] = useState<any[]>([])
  const [besoins, setBesoins] = useState<any[]>([])
  const [signalements, setSignalements] = useState<any[]>([])
  const [filtreStatut, setFiltreStatut] = useState<string>('tous')

  useEffect(() => { checkAdmin() }, [])

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
      { data: vuesData },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'agent'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'proprietaire'),
      supabase.from('biens').select('*', { count: 'exact', head: true }).eq('statut', 'publié'),
      supabase.from('biens').select('*', { count: 'exact', head: true }).eq('statut', 'brouillon'),
      supabase.from('besoins').select('*', { count: 'exact', head: true }),
      supabase.from('signalements').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('biens').select('vues'),
    ])
    const vuesTotal = (vuesData ?? []).reduce((sum: number, b: any) => sum + (b.vues ?? 0), 0)
    setStats({ agents: agents || 0, proprietaires: proprietaires || 0, biensPublies: biensPublies || 0, biensBrouillons: biensBrouillons || 0, besoins: besoins || 0, signalements: signalementsCount || 0, messages: messages || 0, vuesTotal })
    setLoading(false)
  }

  const loadUtilisateurs = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUtilisateurs(data || [])
  }

  const loadBiens = async () => {
    const { data } = await supabase.from('biens').select('*, profiles(nom_complet, nom, prenom)').order('created_at', { ascending: false })
    setBiens(data || [])
  }

  const loadBesoins = async () => {
    const { data } = await supabase.from('besoins').select('*').order('created_at', { ascending: false })
    setBesoins(data || [])
  }

  const loadSignalements = async () => {
    const { data } = await supabase.from('signalements').select('*, biens(titre)').order('created_at', { ascending: false })
    setSignalements(data || [])
  }

  const supprimerSignalement = async (id: string) => {
    if (!confirm('Supprimer ce signalement ?')) return
    await supabase.from('signalements').delete().eq('id', id)
    loadSignalements()
  }

  const supprimerUtilisateur = async (id: string) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    await supabase.from('profiles').delete().eq('id', id)
    loadUtilisateurs(); loadStats()
  }

  const supprimerBien = async (id: string) => {
    if (!confirm('Supprimer ce bien ?')) return
    await supabase.from('biens').delete().eq('id', id)
    loadBiens(); loadStats()
  }

  const changerStatutBien = async (id: string, nouveauStatut: string) => {
    await supabase.from('biens').update({ statut: nouveauStatut }).eq('id', id)
    loadBiens(); loadStats()
  }

  const supprimerBesoin = async (id: string) => {
    if (!confirm('Supprimer ce besoin ?')) return
    await supabase.from('besoins').delete().eq('id', id)
    loadBesoins(); loadStats()
  }

  const changerStatutBesoin = async (id: string, nouveauStatut: string) => {
    await supabase.from('besoins').update({ statut: nouveauStatut }).eq('id', id)
    loadBesoins()
  }

  const biensFiltres = filtreStatut === 'tous' ? biens : biens.filter(b => b.statut === filtreStatut)

  const ONGLETS = [
    { key: 'stats', label: 'Statistiques' },
    { key: 'utilisateurs', label: 'Utilisateurs' },
    { key: 'biens', label: 'Biens' },
    { key: 'besoins', label: 'Besoins', badge: stats.besoins },
    { key: 'signalements', label: 'Signalements', badge: stats.signalements },
    { key: 'messages', label: 'Messages' },
  ] as const

  const TITRES: Record<string, string> = {
    stats: 'Tableau de bord', utilisateurs: 'Gestion des utilisateurs',
    biens: 'Moderation des biens', besoins: 'Besoins deposes',
    signalements: 'Signalements', messages: 'Messages'
  }

  const iconBtn = "p-1.5 rounded-lg border-none cursor-pointer flex items-center justify-center transition-colors"

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <p className="text-white">Chargement...</p>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#0f172a]">

      {/* SIDEBAR */}
      <aside className="w-[240px] bg-[#1e293b] px-4 py-8 flex flex-col gap-2 flex-shrink-0">
        <div className="text-[#00bcd4] font-extrabold text-lg mb-8 text-center">Admin Panel</div>
        {ONGLETS.map(o => (
          <button key={o.key} onClick={() => setOnglet(o.key as any)}
            className={`px-4 py-3 rounded-lg border-none font-medium cursor-pointer text-left flex items-center justify-between transition-all text-sm ${
              onglet === o.key ? 'bg-[#00bcd4] text-white' : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            <span>{o.label}</span>
            {'badge' in o && o.badge ? (
              <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${onglet === o.key ? 'bg-white/30' : 'bg-red-500'}`}>
                {o.badge}
              </span>
            ) : null}
          </button>
        ))}
        <div className="mt-auto pt-4 border-t border-[#334155]">
          <button onClick={() => { supabase.auth.signOut(); router.push('/connexion') }}
            className="w-full px-4 py-3 rounded-lg border border-red-500 bg-transparent text-red-500 cursor-pointer font-medium text-sm hover:bg-red-500/10 transition-colors">
            Deconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-white text-2xl font-bold mb-8">{TITRES[onglet]}</h1>

        {/* STATS */}
        {onglet === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              { label: 'Agents', value: stats.agents, border: 'border-l-blue-500' },
              { label: 'Proprietaires', value: stats.proprietaires, border: 'border-l-emerald-500' },
              { label: 'Biens publies', value: stats.biensPublies, border: 'border-l-green-500' },
              { label: 'Brouillons', value: stats.biensBrouillons, border: 'border-l-amber-500' },
              { label: 'Besoins deposes', value: stats.besoins, border: 'border-l-red-400' },
              { label: 'Signalements', value: stats.signalements, border: 'border-l-red-600' },
              { label: 'Messages', value: stats.messages, border: 'border-l-purple-500' },
                { label: 'Vues totales', value: stats.vuesTotal, border: 'border-l-cyan-500' },
            ].map(s => (
              <div key={s.label} className={`bg-[#1e293b] rounded-xl p-6 border-l-4 ${s.border}`}>
                <div className="text-white text-3xl font-extrabold">{s.value}</div>
                <div className="text-slate-400 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* UTILISATEURS */}
        {onglet === 'utilisateurs' && (
          <div className="bg-[#1e293b] rounded-xl overflow-x-auto border border-[#334155]">
            <table className="w-full border-collapse min-w-[480px]">
              <thead>
                <tr className="bg-[#0f172a]">
                  {['Nom', 'Email', 'Role', 'Tel', 'Action'].map(h => (
                    <th key={h} className="px-3 py-3 text-slate-400 text-left text-xs font-bold uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map(u => (
                  <tr key={u.id} className="border-t border-[#334155] align-middle hover:bg-[#0f172a] transition-colors">
                    <td className="px-3 py-3 text-white text-sm">{u.nom_complet || `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || '-'}</td>
                    <td className="px-3 py-3 text-slate-300 text-sm">{u.email}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${
                        u.role === 'admin' ? 'bg-purple-600' : u.role === 'agent' ? 'bg-emerald-600' : 'bg-blue-600'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-300 text-sm">{u.telephone || '-'}</td>
                    <td className="px-3 py-3">
                      {u.role !== 'admin' && (
                        <button onClick={() => supprimerUtilisateur(u.id)}
                          className={`${iconBtn} bg-red-100 text-red-500 hover:bg-red-200`}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
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
            <div className="flex gap-2 mb-6">
              {[{ val: 'tous', label: 'Tous' }, { val: 'publié', label: 'Publies' }, { val: 'brouillon', label: 'Brouillons' }].map(f => (
                <button key={f.val} onClick={() => setFiltreStatut(f.val)}
                  className={`px-4 py-2 rounded-lg border-none text-sm font-semibold cursor-pointer transition-colors ${
                    filtreStatut === f.val ? 'bg-[#00bcd4] text-white' : 'bg-[#1e293b] text-slate-400 hover:text-white'
                  }`}>{f.label}</button>
              ))}
            </div>
            <div className="bg-[#1e293b] rounded-xl overflow-x-auto border border-[#334155]">
              <table className="w-full border-collapse min-w-[480px]">
                <thead>
                  <tr className="bg-[#0f172a]">
                    {['Titre', 'Ville', 'Prix', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="px-3 py-3 text-slate-400 text-left text-xs font-bold uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {biensFiltres.map(b => (
                    <tr key={b.id} className="border-t border-[#334155] align-middle hover:bg-[#0f172a] transition-colors">
                      <td className="px-3 py-3 text-slate-100 text-sm max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">{b.titre}</td>
                      <td className="px-3 py-3 text-slate-300 text-sm whitespace-nowrap">{b.ville || '-'}</td>
                      <td className="px-3 py-3 text-emerald-400 text-sm whitespace-nowrap font-semibold">{b.prix ? new Intl.NumberFormat('fr-FR').format(b.prix) + ' F' : '-'}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${
                          b.statut === 'publié' ? 'bg-emerald-600' : b.statut === 'brouillon' ? 'bg-amber-500' : 'bg-slate-500'
                        }`}>{b.statut}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1 items-center">
                          {b.statut === 'brouillon' && (
                            <button onClick={() => changerStatutBien(b.id, 'publié')} title="Publier"
                              className={`${iconBtn} bg-green-100 text-green-600 hover:bg-green-200`}>
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </button>
                          )}
                          {b.statut === 'publié' && (
                            <button onClick={() => changerStatutBien(b.id, 'brouillon')} title="Depublier"
                              className={`${iconBtn} bg-yellow-100 text-yellow-600 hover:bg-yellow-200`}>
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                            </button>
                          )}
                          <button onClick={() => supprimerBien(b.id)} title="Supprimer"
                            className={`${iconBtn} bg-red-100 text-red-500 hover:bg-red-200`}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {biensFiltres.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-slate-400">Aucun bien</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* BESOINS */}
        {onglet === 'besoins' && (
          <div className="bg-[#1e293b] rounded-xl overflow-x-auto border border-[#334155]">
            <table className="w-full border-collapse min-w-[400px]">
              <thead>
                <tr className="bg-[#0f172a]">
                  {['Type', 'Ville', 'Contact', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-3 py-3 text-slate-400 text-left text-xs font-bold uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {besoins.map(b => (
                  <tr key={b.id} className="border-t border-[#334155] align-middle hover:bg-[#0f172a] transition-colors">
                    <td className="px-3 py-3 text-white text-sm whitespace-nowrap">
                      <span className="capitalize">{b.type_besoin}</span>
                      <br/>
                      <span className="text-slate-400 text-xs capitalize">{b.transaction}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-300 text-sm whitespace-nowrap">{b.ville || '-'}</td>
                    <td className="px-3 py-3 text-slate-300 text-sm">
                      <span className="block">{b.nom || 'Anonyme'}</span>
                      <a href={'tel:' + b.telephone} className="text-[#00bcd4] text-xs hover:underline">{b.telephone}</a>
                    </td>
                    <td className="px-3 py-3">
                      <select value={b.statut} onChange={e => changerStatutBesoin(b.id, e.target.value)}
                        className={`text-white border-none rounded-lg px-2 py-1 text-xs cursor-pointer outline-none ${
                          b.statut === 'nouveau' ? 'bg-cyan-700' : b.statut === 'traite' ? 'bg-emerald-700' : 'bg-slate-600'
                        }`}>
                        <option value="nouveau">Nouveau</option>
                        <option value="en_cours">En cours</option>
                        <option value="traite">Traite</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1 items-center">
                        <a href={'/besoins/' + b.id} target="_blank" title="Voir"
                          className={`${iconBtn} bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 no-underline`}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </a>
                        <button onClick={() => supprimerBesoin(b.id)} title="Supprimer"
                          className={`${iconBtn} bg-red-100/10 text-red-400 hover:bg-red-100/20`}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {besoins.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-400">Aucun besoin depose</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* SIGNALEMENTS */}
        {onglet === 'signalements' && (
          <div className="bg-[#1e293b] rounded-xl overflow-x-auto border border-[#334155]">
            <table className="w-full border-collapse min-w-[480px]">
              <thead>
                <tr className="bg-[#0f172a]">
                  {['Bien', 'Motif', 'Description', 'Email', 'Actions'].map(h => (
                    <th key={h} className="px-3 py-3 text-slate-400 text-left text-xs font-bold uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {signalements.map(s => (
                  <tr key={s.id} className="border-t border-[#334155] align-middle hover:bg-[#0f172a] transition-colors">
                    <td className="px-3 py-3 text-white text-sm max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">{s.biens?.titre || 'Bien supprime'}</td>
                    <td className="px-3 py-3 text-red-300 font-semibold text-xs whitespace-nowrap">{s.motif}</td>
                    <td className="px-3 py-3 text-slate-300 text-xs max-w-[200px]">
                      <div className="whitespace-pre-wrap break-words">{s.description || '-'}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-300 text-xs whitespace-nowrap">{s.email_signaleur || '-'}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1 items-center">
                        {s.bien_id && (
                          <a href={'/bien/' + s.bien_id} target="_blank" title="Voir le bien"
                            className={`${iconBtn} bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 no-underline`}>
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          </a>
                        )}
                        <button onClick={() => supprimerSignalement(s.id)} title="Supprimer"
                          className={`${iconBtn} bg-red-100/10 text-red-400 hover:bg-red-100/20`}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {signalements.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-400">Aucun signalement</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* MESSAGES */}
        {onglet === 'messages' && (
          <div className="bg-[#1e293b] rounded-xl p-8 text-center border border-[#334155]">
            <p className="text-slate-400">Total des messages echanges : {stats.messages}</p>
          </div>
        )}
      </main>
    </div>
  )
}
