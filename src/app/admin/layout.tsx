'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const menuItems = [
  { href: '/admin',              icon: '📊', label: 'Tableau de bord' },
  { href: '/admin/annonces',     icon: '🏘️', label: 'Annonces' },
  { href: '/admin/utilisateurs', icon: '👥', label: 'Utilisateurs' },
  { href: '/admin/messages',     icon: '💬', label: 'Messages' },
  { href: '/admin/contenu',      icon: '📝', label: 'Contenu' },
  { href: '/admin/parametres',   icon: '⚙️', label: 'Parametres' },
  { href: '/admin/seo',          icon: '🔍', label: 'SEO' },
  { href: '/admin/securite',     icon: '🔒', label: 'Securite' },
  { href: '/admin/support',      icon: '🛠️', label: 'Support' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [adminNom, setAdminNom] = useState('A')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/connexion'); return }
      const { data: profile } = await supabase.from('profiles').select('role, nom, prenom, suspendu').eq('id', user.id).single()
      if (profile?.role !== 'admin' || profile?.suspendu) { router.push('/'); return }
      setAdminNom((profile?.prenom ?? '') + ' ' + (profile?.nom ?? 'Admin'))
      setChecking(false)
    }
    check()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const currentPage = menuItems.find(m => m.href === pathname)

  if (checking) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#00bcd4] border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#0f172a]">

      {/* OVERLAY mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}/>
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 flex flex-col bg-[#1e293b] border-r border-[#334155] transition-transform duration-300
        lg:static lg:translate-x-0 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${desktopCollapsed ? 'lg:w-[70px]' : 'lg:w-[260px]'}
        w-[260px]
      `}>
        {/* Logo */}
        <div className="px-4 py-5 border-b border-[#334155] flex items-center justify-between">
          {(!desktopCollapsed) && (
            <div>
              <p className="text-white font-bold text-sm">Immo West Afro</p>
              <p className="text-slate-400 text-xs">Panel Administrateur</p>
            </div>
          )}
          <button onClick={() => setDesktopCollapsed(!desktopCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-[#334155] transition-colors text-xs">
            {desktopCollapsed ? '▶' : '◀'}
          </button>
          <button onClick={() => setSidebarOpen(false)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-[#334155] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-lg mb-1 text-sm font-medium transition-colors no-underline ${
                  active ? 'bg-[#00bcd4]/20 text-[#00bcd4]' : 'text-slate-400 hover:bg-[#334155] hover:text-white'
                }`}>
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {(!desktopCollapsed) && <span>{item.label}</span>}

              </Link>
            )
          })}
        </nav>

        {/* DECONNEXION */}
        <div className="px-2 py-4 border-t border-[#334155]">
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-3 min-h-[44px] bg-transparent border border-red-500 rounded-lg text-red-500 cursor-pointer text-sm font-medium hover:bg-red-500/10 transition-colors">
            <span className="text-lg flex-shrink-0">🚪</span>
            {(!desktopCollapsed) && <span>Deconnexion</span>}

          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 overflow-y-auto min-w-0">

        {/* HEADER */}
        <div className="bg-[#1e293b] px-4 lg:px-8 py-4 border-b border-[#334155] flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger mobile */}
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:bg-[#334155] transition-colors border-none bg-transparent cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <span className="text-white font-semibold text-sm">
              {currentPage?.icon} {currentPage?.label || 'Admin'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#00bcd4] transition-colors no-underline">
              🌐 Voir le site
            </Link>
            <div className="w-9 h-9 bg-[#00bcd4] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {adminNom.trim()[0]?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </div>

        {/* PAGE */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}