'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const menuItems = [
  { href: '/admin', label: 'Tableau de bord', icon: '📊' },
  { href: '/admin/annonces', label: 'Annonces', icon: '🏘️' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: '👥' },
  { href: '/admin/messages', label: 'Messages', icon: '💬' },
  { href: '/admin/contenu', label: 'Contenu', icon: '📝' },
  { href: '/admin/parametres', label: 'Paramètres', icon: '⚙️' },
  { href: '/admin/seo', label: 'SEO', icon: '🔍' },
  { href: '/admin/securite', label: 'Sécurité', icon: '🔒' },
  { href: '/admin/support', label: 'Support', icon: '🛠️' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [adminNom, setAdminNom] = useState('A')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => { checkAdmin() }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/connexion'); return }
    const { data: profile } = await supabase.from('profiles').select('role, nom, prenom, suspendu').eq('id', user.id).single()
    if (profile?.role !== 'admin' || profile?.suspendu) { router.push('/'); return }
    setAdminNom((profile?.prenom ?? '') + ' ' + (profile?.nom ?? 'Admin'))
    setChecking(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/connexion')
  }

  if (checking) return (
    <div className="min-h-screen bg-[#0f172a] dark:bg-[#0f172a] flex items-center justify-center">
      <div className="text-white text-center">
        <div className="text-5xl mb-4">🔐</div>
        <p className="text-slate-400">Vérification des droits...</p>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#0f172a]" data-theme="dark">

      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-[260px]' : 'w-[70px]'} bg-[#0f172a] dark:bg-[#0f172a] flex flex-col flex-shrink-0 sticky top-0 h-screen transition-all duration-300`}>

        {/* LOGO */}
        <div className="px-4 py-6 border-b border-[#1e293b] flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <div className="text-[#00bcd4] font-extrabold text-base">🏠 Immo West Afro</div>
              <div className="text-slate-500 text-xs mt-0.5">Panel Administrateur</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-transparent border-none text-slate-400 cursor-pointer text-xl p-1 hover:text-white transition-colors">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-1 no-underline text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#00bcd4] text-white font-semibold'
                    : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* DÉCONNEXION */}
        <div className="p-4 border-t border-[#1e293b]">
          <button onClick={handleLogout}
            className="w-full py-3 bg-transparent border border-red-500 rounded-lg text-red-500 cursor-pointer font-medium flex items-center justify-center gap-2 text-sm hover:bg-red-500/10 transition-colors">
            <span>🚪</span>
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 overflow-y-auto">
        {/* TOPBAR */}
        <div className="bg-[#1e293b] dark:bg-[#1e293b] px-8 py-4 border-b border-[#334155] flex items-center justify-between sticky top-0 z-[100]">
          <div className="text-white font-semibold text-base">
            {menuItems.find(m => m.href === pathname)?.icon}{' '}
            {menuItems.find(m => m.href === pathname)?.label || 'Admin'}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-[#00bcd4] text-sm no-underline hover:underline">
              🌐 Voir le site
            </Link>
            <div className="w-9 h-9 bg-[#00bcd4] rounded-full flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
          </div>
        </div>

        {/* PAGE */}
        <div className="p-8 bg-[#0f172a] dark:bg-[#0f172a] min-h-[calc(100vh-60px)]">
          {children}
        </div>
      </main>
    </div>
  )
}