'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const NAV = [
  {
    href: '/dashboard/agent',
    label: 'Tableau de bord',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/dashboard/agent/annonces',
    label: 'Mes annonces',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: '/dashboard/agent/messages',
    label: 'Messages',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    badge: true,
  },
  {
    href: '/publier',
    label: 'Publier un bien',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 4v16m8-8H4" />
      </svg>
    ),
    accent: true,
  },
  {
    href: '/dashboard/agent/parametres',
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

export default function AgentDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [agent, setAgent] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/connexion'); return }
      const { data } = await supabase
        .from('profiles')
        .select('nom, prenom, avatar_url, role')
        .eq('id', user.id)
        .single()
      if (data?.role !== 'agent' && data?.role !== 'admin') {
        router.push('/')
        return
      }
      setAgent({ ...data, id: user.id, email: user.email })

      // Messages non lus
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('destinataire_id', user.id)
        .eq('lu', false)
      setUnreadCount(count ?? 0)
    })
  }, [])

  const isActive = (href: string) =>
    href === '/dashboard/agent' ? pathname === href : pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Overlay mobile ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-[#1a2e0f] z-30 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Immo West Afro</p>
              <p className="text-green-400 text-[10px] font-medium">Espace Agent</p>
            </div>
          </Link>
        </div>

        {/* Agent info */}
        {agent && (
          <div className="px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              {agent.avatar_url ? (
                <img src={agent.avatar_url} alt=""
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FF6B35]/40" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] font-bold text-sm flex-shrink-0">
                  {(agent.prenom?.[0] ?? '').toUpperCase()}{(agent.nom?.[0] ?? '').toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {agent.prenom} {agent.nom}
                </p>
                <p className="text-green-400 text-xs capitalize">{agent.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                item.accent
                  ? 'bg-[#FF6B35] text-white hover:bg-[#e55c2a]'
                  : isActive(item.href)
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Déconnexion */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/')
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/8 hover:text-white transition-all w-full"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── Contenu principal ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-10">
          {/* Hamburger mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Ouvrir le menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Titre page courante */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-gray-900 truncate">
              {NAV.find(n => isActive(n.href))?.label ?? 'Dashboard'}
            </h1>
          </div>

          {/* Actions header */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link href="/dashboard/agent/messages"
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Link>

            {/* Publier */}
            <Link href="/publier"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B35] text-white text-sm font-semibold rounded-lg hover:bg-[#e55c2a] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Publier
            </Link>

            {/* Avatar */}
            {agent && (
              <Link href="/dashboard/agent/parametres"
                className="w-8 h-8 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] font-bold text-xs hover:ring-2 hover:ring-[#FF6B35]/40 transition-all">
                {(agent.prenom?.[0] ?? '').toUpperCase()}{(agent.nom?.[0] ?? '').toUpperCase()}
              </Link>
            )}
          </div>
        </header>

        {/* Zone contenu */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}