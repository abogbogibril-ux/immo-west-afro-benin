'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'

export default function ClientDashboardPage() {
  const [client, setClient] = useState<any>(null)
  const [stats, setStats] = useState({ demandes: 0, visites: 0, favoris: 0, messages: 0 })
  const [prochaineVisite, setProchaineVisite] = useState<any>(null)
  const [activite, setActivite] = useState<any[]>([])
  const [biensSuggeres, setBiensSuggeres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      setClient(profile)

      const [msgs, favs] = await Promise.all([
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('expediteur_id', user.id),
        supabase.from('favoris').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ])

      const { data: recentMsgs } = await supabase
        .from('messages')
        .select('id, sujet, created_at, biens(titre)')
        .eq('expediteur_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4)

      setActivite(recentMsgs ?? [])

      const { data: biens } = await supabase
        .from('biens')
        .select('id, titre, prix, ville, transaction, images(url, is_principale)')
        .eq('statut', 'publié')
        .limit(3)

      setBiensSuggeres(biens ?? [])

      setStats({
        demandes: msgs.count ?? 0,
        visites: 0,
        favoris: favs.count ?? 0,
        messages: msgs.count ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const KPI = [
    { label: 'Demandes', value: stats.demandes, icon: '📋', href: '/dashboard/client/demandes', color: 'bg-blue-50 text-blue-600' },
    { label: 'Visites', value: stats.visites, icon: '🗓', href: '/dashboard/client/visites', color: 'bg-purple-50 text-purple-600' },
    { label: 'Favoris', value: stats.favoris, icon: '❤️', href: '/dashboard/client/favoris', color: 'bg-red-50 text-red-500' },
    { label: 'Messages', value: stats.messages, icon: '💬', href: '/dashboard/client/messages', color: 'bg-green-50 text-green-600' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Bienvenue */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-5 md:p-6 text-white">
        <p className="text-green-200 text-sm mb-1 capitalize">{today}</p>
        <h1 className="text-xl md:text-2xl font-bold mb-2">
          Bonjour, {client?.prenom ?? '...'} 👋
        </h1>
        <p className="text-green-100 text-sm mb-4">
          {stats.messages > 0
            ? `Vous avez ${stats.demandes} demande${stats.demandes > 1 ? 's' : ''} en cours et ${stats.favoris} bien${stats.favoris > 1 ? 's' : ''} sauvegardé${stats.favoris > 1 ? 's' : ''}.`
            : 'Bienvenue sur votre espace personnel Immo West Afro.'}
        </p>
        <Link href="/recherche"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-green-700 text-sm font-semibold rounded-xl hover:bg-green-50 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Chercher un bien
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {KPI.map(k => (
          <Link key={k.label} href={k.href}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${k.color}`}>
              {k.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-0.5">
              {loading ? <span className="animate-pulse bg-gray-200 rounded h-7 w-10 inline-block"/> : k.value}
            </div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{k.label}</p>
          </Link>
        ))}
      </div>

      {/* Prochaine visite */}
      {prochaineVisite ? (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide mb-1">Prochaine visite</p>
              <h3 className="font-bold text-gray-900">{prochaineVisite.bien}</h3>
              <p className="text-sm text-gray-500 mt-1">🗓 {prochaineVisite.date} · 👤 {prochaineVisite.agent}</p>
            </div>
            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full flex-shrink-0">
              Confirmée
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <a href={`tel:${prochaineVisite.telephone}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-purple-200 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-50 transition-colors">
              📞 Appeler
            </a>
            <Link href="/dashboard/client/visites"
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
              Voir les détails →
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
          <p className="text-3xl mb-2">🗓</p>
          <p className="font-semibold text-gray-700 mb-1">Aucune visite programmée</p>
          <p className="text-sm text-gray-400 mb-4">Contactez un agent pour planifier une visite</p>
          <Link href="/recherche"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
            Parcourir les annonces
          </Link>
        </div>
      )}

      {/* Activité récente + Biens suggérés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Activité récente */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Activité récente</h2>
            <Link href="/dashboard/client/messages"
              className="text-sm text-green-600 font-medium hover:underline">Voir tout →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"/>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4"/>
                      <div className="h-3 bg-gray-100 rounded w-1/2"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : activite.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-sm">Aucune activité récente</p>
              </div>
            ) : (
              activite.map(a => (
                <div key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm flex-shrink-0">
                    💬
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{a.sujet}</p>
                    {a.biens?.titre && (
                      <p className="text-xs text-green-600 mt-0.5 truncate">🏠 {a.biens.titre}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Biens suggérés */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Biens suggérés</h2>
            <Link href="/recherche"
              className="text-sm text-green-600 font-medium hover:underline">Voir tout →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-16 h-12 bg-gray-200 rounded-lg flex-shrink-0"/>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4"/>
                      <div className="h-3 bg-gray-100 rounded w-1/3"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : biensSuggeres.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="text-2xl mb-2">🏠</p>
                <p className="text-sm">Aucun bien disponible</p>
              </div>
            ) : (
              biensSuggeres.map(bien => {
                const photo = bien.images?.find((i: any) => i.is_principale)?.url ?? bien.images?.[0]?.url
                return (
                  <Link key={bien.id} href={`/bien/${bien.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <OptimizedImage
                        src={photo}
                        alt={bien.titre}
                        fill
                        sizes="64px"
                        priority={false}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{bien.titre}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{bien.ville}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-green-600">
                        {new Intl.NumberFormat('fr-FR').format(bien.prix)}
                      </p>
                      <p className="text-[10px] text-gray-400">FCFA</p>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}