'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Annonce {
  id: string
  titre: string
  ville: string
  vues: number
  numero_sequence: number
  statut: string
  created_at: string
  prix: number
}

const STATUT_COLORS: Record<string, string> = {
  'publié':   'bg-green-100 text-green-700',
  'brouillon': 'bg-yellow-100 text-yellow-700',
  'archivé':  'bg-gray-100 text-gray-600',
  'vendu':    'bg-blue-100 text-blue-700',
  'loué':     'bg-purple-100 text-purple-700',
}

function formatPrice(p: number) {
  return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'
}

export default function AgentDashboardPage() {
  const [agent, setAgent] = useState<any>(null)
  const [suspendu, setSuspendu] = useState(false)
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [kpis, setKpis] = useState({ total: 0, vues: 0, messages: 0, favoris: 0 })
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [guideOpen, setGuideOpen] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      setAgent(profile)
      setSuspendu(profile?.suspendu ?? false)

      const { data: biens } = await supabase
        .from('biens')
        .select('id, titre, ville, vues, statut, created_at, prix, numero_sequence')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setAnnonces(biens ?? [])

      const { count: total } = await supabase
        .from('biens').select('id', { count: 'exact', head: true })
        .eq('agent_id', user.id).eq('statut', 'publié')

      const { count: msgs } = await supabase
        .from('messages').select('id', { count: 'exact', head: true })
        .eq('destinataire_id', user.id)

      const totalVues = (biens ?? []).reduce((sum, b) => sum + (b.vues ?? 0), 0)

      setKpis({ total: total ?? 0, vues: totalVues, messages: msgs ?? 0, favoris: 0 })
      setLoading(false)
    }
    load()
  }, [])

  const KPI_CARDS = [
    { label: 'Annonces actives', value: kpis.total,    icon: '📊', color: 'bg-green-50 text-green-600' },
    { label: 'Vues totales',     value: kpis.vues,     icon: '👁️', color: 'bg-blue-50 text-blue-600' },
    { label: 'Messages reçus',   value: kpis.messages, icon: '💬', color: 'bg-purple-50 text-purple-600' },
    { label: 'Taux de contact',  value: kpis.vues > 0 ? `${Math.round((kpis.messages / kpis.vues) * 100)}%` : '0%',
      icon: '✉️', color: 'bg-orange-50 text-orange-600' },
  ]

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const displayedAnnonces = showAll ? annonces : annonces.slice(0, 5)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-[#0f172a] min-h-screen">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Bonjour, {agent?.prenom ?? '...'} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-0.5 capitalize">{today}</p>
        </div>
      </div>

      {/* KPI Cards — statistiques globales, dont Vues totales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {KPI_CARDS.map(kpi => (
          <div key={kpi.label} className="bg-[#1e293b] rounded-2xl shadow-sm border border-[#334155] p-4 md:p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white mb-0.5">
              {loading ? <span className="animate-pulse bg-gray-600 rounded h-8 w-16 inline-block"/> : kpi.value}
            </div>
            <p className="text-xs text-slate-300 font-medium uppercase tracking-wide">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Annonces récentes — juste après les stats, avec vues réelles par annonce */}
      <div className="bg-[#1e293b] rounded-2xl shadow-sm border border-[#334155] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#334155]">
          <h2 className="font-semibold text-white">Annonces récentes</h2>
          {annonces.length > 5 && (
            <button onClick={() => setShowAll(prev => !prev)}
              className="text-sm text-[#00bcd4] font-medium hover:underline min-h-[44px] flex items-center">
              {showAll ? 'Voir moins ↑' : 'Voir toutes →'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="h-4 bg-gray-700 rounded flex-1"/>
                <div className="h-4 bg-gray-700 rounded w-16"/>
              </div>
            ))}
          </div>
        ) : annonces.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="text-4xl mb-2">🏠</p>
            <p className="text-sm">Aucune annonce publiée</p>
            {!suspendu && <Link href="/publier" className="mt-3 inline-block text-sm text-[#00bcd4] font-medium hover:underline">
              Publier votre première annonce →
            </Link>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0f172a]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Référence</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Titre</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Ville</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">Vues</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Statut</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {displayedAnnonces.map(a => (
                  <tr key={a.id} className="hover:bg-[#0f172a] transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-slate-300 bg-[#0f172a] px-1.5 py-0.5 rounded whitespace-nowrap">
                        {`IWA-${String(a.numero_sequence).padStart(5, "0")}`}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="font-medium text-white truncate max-w-[160px]">{a.titre}</p>
                      <p className="text-xs text-[#00bcd4] whitespace-nowrap">{formatPrice(a.prix)}</p>
                    </td>
                    <td className="px-3 py-3.5 text-gray-400 whitespace-nowrap">{a.ville}</td>
                    <td className="px-3 py-3.5 font-semibold text-white whitespace-nowrap">{a.vues ?? 0}</td>
                    <td className="px-3 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUT_COLORS[a.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                        {a.statut}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link href={a.statut === 'brouillon' ? `/dashboard/agent/apercu/${a.id}` : a.statut === 'archivé' ? `/publier?edit=${a.id}` : `/bien/${a.id}`}
                          title={a.statut === 'brouillon' ? "Voir l'aperçu" : a.statut === 'archivé' ? 'Modifier et republier' : "Voir l'annonce"}
                          className="relative group p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </Link>
                        {a.statut === 'brouillon' && (
                          <button
                            onClick={async () => {
                              await fetch('/api/agent/biens', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (await supabase.auth.getSession()).data.session?.access_token }, body: JSON.stringify({ bienId: a.id, statut: 'publié' }) })
                              setAnnonces(prev => prev.map(x => x.id === a.id ? { ...x, statut: 'publié' } : x))
                            }}
                            className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                          >
                            Publier
                          </button>
                        )}
                        <Link href={`/publier?edit=${a.id}`}
                          title="Modifier l'annonce"
                          className="relative group p-1.5 rounded-lg text-slate-400 hover:text-[#00bcd4] hover:bg-[#00bcd4]/10 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GUIDE DE DEMARRAGE — en dernier */}
      <div className="bg-gradient-to-br from-[#0f3460] to-[#1e293b] rounded-2xl border border-[#00bcd4]/30 overflow-hidden">
        <button onClick={() => setGuideOpen(prev => !prev)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors min-h-[44px]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            <div className="text-left">
              <p className="font-bold text-white text-sm">Guide de démarrage rapide</p>
              <p className="text-xs text-slate-400">Apprenez à utiliser votre dashboard en quelques étapes</p>
            </div>
          </div>
          <svg className={`w-5 h-5 text-slate-400 transition-transform ${guideOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        {guideOpen && (
          <div className="px-5 pb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  num: '1', icon: '📸', titre: 'Publiez votre premier bien',
                  desc: "Cliquez sur + Publier, remplissez les détails et ajoutez des photos. Utilisez l'IA pour générer titre et description.",
                  lien: '/publier', labelLien: 'Publier maintenant'
                },
                {
                  num: '2', icon: '✏️', titre: 'Gérez vos annonces',
                  desc: 'Dans Mes annonces, modifiez, archivez ou dépubliez vos biens. Suivez les vues et les statistiques.',
                  lien: '/dashboard/agent/annonces', labelLien: 'Voir mes annonces'
                },
                {
                  num: '3', icon: '💬', titre: 'Répondez aux messages',
                  desc: 'Les acheteurs et locataires vous contactent via la messagerie. Répondez rapidement pour maximiser vos chances.',
                  lien: '/dashboard/agent/messages', labelLien: 'Voir les messages'
                },
                {
                  num: '4', icon: '⚙️', titre: 'Complétez votre profil',
                  desc: "Ajoutez votre photo, numéro WhatsApp et informations d'agence pour inspirer confiance aux clients.",
                  lien: '/dashboard/agent/parametres', labelLien: 'Mon profil'
                },
              ].map(step => (
                <div key={step.num} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-[#00bcd4]/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#00bcd4] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {step.num}
                    </span>
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  <p className="font-semibold text-white text-sm mb-1">{step.titre}</p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{step.desc}</p>
                  <a href={step.lien}
                    className="inline-flex items-center gap-1 text-xs text-[#00bcd4] font-semibold hover:underline">
                    {step.labelLien}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-[#00bcd4]/10 rounded-xl border border-[#00bcd4]/20">
              <p className="text-xs text-[#00bcd4] font-semibold mb-1">💡 Conseil du jour</p>
              <p className="text-xs text-slate-300">
                Les annonces avec au moins 3 photos reçoivent 3x plus de contacts. Utilisez l'IA pour générer des descriptions professionnelles et optimisées SEO.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CTA Messages */}
      <Link href="/dashboard/agent/messages"
        className="flex items-center justify-center gap-2 w-full py-3.5 border border-dashed border-[#334155] rounded-xl text-sm text-slate-400 hover:border-[#00bcd4] hover:text-[#00bcd4] transition-colors min-h-[44px]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
        Voir les messages clients
      </Link>
    </div>
  )
}