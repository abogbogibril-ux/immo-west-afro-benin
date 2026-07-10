'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const NAV = [
  {
    href: '/dashboard/client',
    label: 'Accueil',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/dashboard/client/demandes',
    label: 'Mes demandes',
    badge: 'demandes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/dashboard/client/visites',
    label: 'Mes visites',
    badge: 'visites',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/client/messages',
    label: 'Messages',
    badge: 'messages',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/client/documents',
    label: 'Documents',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/client/favoris',
    label: 'Favoris',
    badge: 'favoris',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/client/notifications',
    label: 'Notifications',
    badge: 'notifications',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    href: '/dashboard/client/parametres',
    label: 'Paramètres',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

// Bottom nav mobile (5 items max)
const BOTTOM_NAV = [
  { href: '/dashboard/client', label: 'Accueil', badge: '', icon: '🏠' },
  { href: '/dashboard/client/messages', label: 'Messages', badge: 'messages', icon: '💬' },
  { href: '/dashboard/client/favoris', label: 'Favoris', badge: 'favoris', icon: '❤️' },
  { href: '/dashboard/client/parametres', label: 'Parametres', badge: '', icon: '⚙️' },
]


export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [client, setClient] = useState<any>(null)
  const [badges, setBadges] = useState({ demandes: 0, visites: 0, messages: 0, favoris: 0, notifications: 0 })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/connexion'); return }

      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      setClient({ ...profile, id: user.id, email: user.email })

      // Badges
      const [msgs, favs, notifs] = await Promise.all([
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('destinataire_id', user.id).eq('lu', false),
        supabase.from('favoris').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('destinataire_id', user.id).eq('lu', false),
      ])

      setBadges({
        demandes: 0,
        visites: 0,
        messages: msgs.count ?? 0,
        favoris: favs.count ?? 0,
        notifications: notifs.count ?? 0,
      })
    }
    load()
  }, [])

  const isActive = (href: string) =>
    href === '/dashboard/client' ? pathname === href : pathname.startsWith(href)

  const getBadge = (key: string) => badges[key as keyof typeof badges] ?? 0

  return (
    <div className="min-h-screen bg-[#0f172a] flex" data-theme="dark">

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar desktop ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-100 z-30 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <p className="text-gray-900 font-bold text-sm leading-tight">Immo West Afro</p>
              <p className="text-green-600 text-[10px] font-medium">Espace Client</p>
            </div>
          </Link>
        </div>

        {/* Profil client */}
        {client && (
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
                {(client.prenom?.[0] ?? '').toUpperCase()}{(client.nom?.[0] ?? '').toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-gray-900 text-sm font-semibold truncate">
                  {client.prenom} {client.nom}
                </p>
                <p className="text-gray-400 text-xs">Client</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const badgeCount = item.badge ? getBadge(item.badge) : 0
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {badgeCount > 0 && (
                  <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Déconnexion */}
        <div className="px-3 py-4 border-t border-gray-100">
          <Link href="/recherche"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-green-600 hover:bg-green-50 transition-all w-full mb-1">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Chercher un bien
          </Link>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all w-full">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Contenu ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <p className="text-sm font-semibold text-gray-900 flex-1 truncate">
            {NAV.find(n => isActive(n.href))?.label ?? 'Dashboard'}
          </p>

          <div className="flex items-center gap-2">
            <Link href="/recherche"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              Rechercher
            </Link>

            <Link href="/dashboard/client/notifications"
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              {badges.notifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"/>
              )}
            </Link>

            {client && (
              <Link href="/dashboard/client/parametres"
                className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs hover:ring-2 hover:ring-green-300 transition-all">
                {(client.prenom?.[0] ?? '').toUpperCase()}{(client.nom?.[0] ?? '').toUpperCase()}
              </Link>
            )}
          </div>
        </header>

        {/* Contenu page */}
        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          {children}
        </main>

        {/* ── Bottom Nav mobile ── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-10">
          <div className="grid grid-cols-5 h-16">
            {BOTTOM_NAV.map(item => {
              const active = item.href === '/dashboard/client' ? pathname === item.href : pathname.startsWith(item.href)
              const count = item.badge ? getBadge(item.badge) : 0
              return (
                <Link key={item.href} href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
                    active ? 'text-green-600' : 'text-gray-400'
                  }`}>
                  <span className="text-xl leading-none">{item.icon}</span>
                  <span className="text-[9px] font-medium">{item.label}</span>
                  {count > 0 && (
                    <span className="absolute top-2 right-4 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}