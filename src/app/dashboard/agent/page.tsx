'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'

interface Annonce {
  id: string
  titre: string
  ville: string
  vues: number
  statut: string
  created_at: string
  prix: number
}

const STATUT_COLORS: Record<string, string> = {
  'publi\u00e9':  'bg-green-100 text-green-700',
  'brouillon': 'bg-yellow-100 text-yellow-700',
  'archivé': 'bg-gray-100 text-gray-600',
  'vendu':   'bg-blue-100 text-blue-700',
  'loué':    'bg-purple-100 text-purple-700',
}

function formatPrice(p: number) {
  return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'
}

export default function AgentDashboardPage() {
  const [agent, setAgent] = useState<any>(null)
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [kpis, setKpis] = useState({ total: 0, vues: 0, messages: 0, favoris: 0 })
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([
    { id: 1, label: 'Répondre aux demandes en attente', done: false },
    { id: 2, label: 'Mettre à jour les photos de l\'annonce', done: false },
    { id: 3, label: 'Vérifier la disponibilité du bien loué', done: true },
  ])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      setAgent(profile)

      const { data: biens } = await supabase
        .from('biens')
        .select('id, titre, ville, vues, statut, created_at, prix')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

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
    { label: 'Annonces actives', value: kpis.total,    icon: '📊', trend: '↑', trendVal: '+2 cette sem.', color: 'bg-green-50 text-green-600' },
    { label: 'Vues totales',     value: kpis.vues,     icon: '👁️', trend: '↑', trendVal: '+12%',          color: 'bg-blue-50 text-blue-600'  },
    { label: 'Messages reçus',   value: kpis.messages, icon: '💬', trend: '↑', trendVal: '+5%',           color: 'bg-purple-50 text-purple-600' },
    { label: 'Taux de contact',  value: kpis.vues > 0 ? `${Math.round((kpis.messages / kpis.vues) * 100)}%` : '0%',
      icon: '✉️', trend: '→', trendVal: 'Ce mois', color: 'bg-orange-50 text-orange-600' },
  ]

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Bonjour, {agent?.prenom ?? '...'} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize">{today}</p>
        </div>
        <Link href="/publier"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl hover:bg-[#e55c2a] transition-colors self-start">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Nouvelle annonce
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${kpi.color}`}>
                {kpi.icon}
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                kpi.trend === '↑' ? 'bg-green-100 text-green-600' :
                kpi.trend === '↓' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-500'
              }`}>
                {kpi.trend} {kpi.trendVal}
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-0.5">
              {loading ? <span className="animate-pulse bg-gray-200 rounded h-8 w-16 inline-block"/> : kpi.value}
            </div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Graphique + Répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Tendance des vues</h2>
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 focus:outline-none">
              <option>Ce mois</option>
              <option>3 derniers mois</option>
              <option>Cette année</option>
            </select>
          </div>
          <div className="flex items-end gap-2 h-32 mt-2">
            {[40, 65, 45, 80, 60, 90, 75, 55, 85, 70, 95, 88].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[#2D5016] rounded-t-sm hover:bg-[#FF6B35] transition-colors cursor-pointer"
                  style={{ height: `${h}%`, opacity: 0.7 + i * 0.025 }}
                  title={`${Math.round(h * kpis.vues / 100)} vues`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-2">
            {['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'].map(m => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Répartition par type</h2>
          <div className="space-y-3">
            {[
              { label: 'Villa', pct: 35, color: 'bg-[#2D5016]' },
              { label: 'Terrain', pct: 28, color: 'bg-[#FF6B35]' },
              { label: 'Appartement', pct: 25, color: 'bg-blue-500' },
              { label: 'Bureau', pct: 12, color: 'bg-purple-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Annonces récentes + Tâches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Annonces récentes</h2>
            <Link href="/dashboard/agent/annonces"
              className="text-sm text-[#FF6B35] font-medium hover:underline">
              Voir toutes →
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="h-4 bg-gray-200 rounded flex-1"/>
                  <div className="h-4 bg-gray-200 rounded w-16"/>
                </div>
              ))}
            </div>
          ) : annonces.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-4xl mb-2">🏠</p>
              <p className="text-sm">Aucune annonce publiée</p>
              <Link href="/publier" className="mt-3 inline-block text-sm text-[#FF6B35] font-medium hover:underline">
                Publier votre première annonce →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Référence</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Titre</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Ville</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Vues</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Statut</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {annonces.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {a.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-medium text-gray-900 truncate max-w-[160px]">{a.titre}</p>
                        <p className="text-xs text-gray-400">{formatPrice(a.prix)}</p>
                      </td>
                      <td className="px-3 py-3.5 text-gray-500 hidden sm:table-cell">{a.ville}</td>
                      <td className="px-3 py-3.5 font-semibold text-gray-900">{a.vues ?? 0}</td>
                      <td className="px-3 py-3.5 hidden md:table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[a.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                          {a.statut}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1">
                          <Link href={a.statut === 'brouillon' ? `/dashboard/agent/apercu/${a.id}` : `/bien/${a.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          </Link>
                          {a.statut === 'brouillon' && (
                            <button
                              onClick={async () => {
                                await supabase.from('biens').update({ statut: 'publi\u00e9' }).eq('id', a.id)
                                setAnnonces(prev => prev.map(x => x.id === a.id ? { ...x, statut: 'publi\u00e9' } : x))
                              }}
                              className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Publier
                            </button>
                          )}
                          <Link href={`/dashboard/agent/annonces?edit=${a.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#FF6B35] hover:bg-orange-50 transition-colors">
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

        {/* Tâches */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">À faire</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {tasks.filter(t => !t.done).length} restantes
            </span>
          </div>
          <div className="space-y-2.5">
            {tasks.map(task => (
              <div key={task.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  task.done ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200 hover:border-[#FF6B35]/30'
                }`}
                onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  task.done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {task.done && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {task.label}
                </span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/agent/messages"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
            Voir les messages clients
          </Link>
        </div>
      </div>
    </div>
  )
}