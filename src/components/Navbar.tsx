'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/hooks/useTheme'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  useEffect(() => {
    if (isDashboard) return

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('profiles').select('role').eq('id', user.id).single()
        setRole(data?.role ?? null)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase
          .from('profiles').select('role').eq('id', session.user.id).single()
        setRole(data?.role ?? null)
      } else {
        setRole(null)
      }
    })

    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isDashboard])

  if (isDashboard) return null

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
    router.push('/')
  }

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin'
    if (role === 'agent' || role === 'proprietaire') return '/dashboard/agent'
    return '/dashboard/agent'
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const NAV_LINKS = [
    { href: '/', label: 'Accueil' },
    { href: '/recherche', label: 'Annonces' },
    { href: '/a-propos', label: 'A propos' },
    { href: '/contact', label: 'Contact' },
  ]

  const isHero = pathname === '/'
  const navBg = scrolled || !isHero
    ? 'bg-white shadow-sm border-b border-gray-100'
    : 'bg-gradient-to-r from-blue-900/60 to-green-900/40 backdrop-blur-sm'
  const textColor = scrolled || !isHero ? 'text-gray-700' : 'text-white'
  const logoColor = scrolled || !isHero ? 'text-blue-800' : 'text-white'
  const activeBg  = scrolled || !isHero ? 'text-blue-600' : 'text-blue-200'

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img src="/logo.png" alt="Immo West Afro" className="w-10 h-10 object-contain drop-shadow-sm"/>
            <div className="hidden sm:block">
              <p className={`font-bold text-sm leading-tight ${logoColor}`}>Immo West Afro</p>
              <p className={`text-[10px] font-medium ${scrolled || !isHero ? 'text-blue-500' : 'text-blue-200'}`}>
                Benin 2026
              </p>
            </div>
          </Link>

          {/* Toggle Dark/Light mode */}
          <button onClick={toggleTheme}
            title={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
            className="flex items-center p-1 rounded-full transition-all duration-300 mx-3"
            style={{ backgroundColor: theme === "dark" ? "#1e293b" : "#e2e8f0", border: "2px solid", borderColor: theme === "dark" ? "#334155" : "#cbd5e1", minWidth: 52 }}>
            <span style={{
              width: 22, height: 22, borderRadius: "50%",
              backgroundColor: theme === "dark" ? "#00bcd4" : "#f59e0b",
              transform: theme === "dark" ? "translateX(0)" : "translateX(24px)",
              transition: "all 0.3s ease",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12
            }}>
              {theme === "dark" ? "🌙" : "☀️"}
            </span>
          </button>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? `${activeBg} font-semibold`
                    : `${textColor} hover:bg-white/10`
                }`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {/* Deposer un besoin */}
            <Link href="/deposer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Deposer un besoin
            </Link>















            {user ? (
              <div className="relative group">
                <button className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  scrolled || !isHero ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}>
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <svg className="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <Link href={getDashboardLink()}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Mon espace
                  </Link>
                  <div className="border-t border-gray-100 my-1"/>
                  <button onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Deconnexion
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">














                <Link href="/inscription"
                  className="px-4 py-2 bg-[#00bcd4] text-white text-sm font-bold rounded-xl hover:bg-[#0097a7] transition-colors shadow-sm">
                  S'inscrire
                </Link>
                <Link href="/connexion"
                  className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                    scrolled || !isHero
                      ? 'border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600'
                      : 'border-white/30 text-white hover:bg-white/10'
                  }`}>
                  Se connecter
                </Link>
              </div>
            )}

            {/* Hamburger mobile */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className={`lg:hidden p-2 rounded-xl transition-colors ${
                scrolled || !isHero ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="lg:hidden bg-white rounded-2xl shadow-lg border border-gray-100 mb-3 overflow-hidden">
            <nav className="p-3 space-y-1">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 my-2"/>
              <Link href="/deposer" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                Deposer un besoin
              </Link>
              {user ? (
                <>
                  <Link href={getDashboardLink()} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Mon espace
                  </Link>
                  <button onClick={() => { handleSignOut(); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                    Deconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link href="/inscription" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors">
                    S'inscrire
                  </Link>
                  <Link href="/connexion" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Se connecter
                  </Link>
                </>
              )}
        )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}