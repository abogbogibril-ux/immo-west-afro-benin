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
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/connexion'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/'); return }
    setChecking(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/connexion')
  }

  if (checking) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
        <p>Vérification des droits...</p>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a' }}>

      {/* SIDEBAR */}
      <aside style={{
        width: sidebarOpen ? '260px' : '70px',
        backgroundColor: '#0f172a',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s ease',
        flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* LOGO */}
        <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {sidebarOpen && (
            <div>
              <div style={{ color: '#00bcd4', fontWeight: '800', fontSize: '1rem' }}>🏠 Immo West Afro</div>
              <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.2rem' }}>Panel Administrateur</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            backgroundColor: 'transparent', border: 'none', color: '#94a3b8',
            cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem',
          }}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* MENU */}
        <nav style={{ flex: 1, padding: '1rem 0.5rem', overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 0.75rem', borderRadius: '8px', marginBottom: '0.25rem',
                textDecoration: 'none',
                backgroundColor: isActive ? '#00bcd4' : 'transparent',
                color: isActive ? '#fff' : '#94a3b8',
                fontWeight: isActive ? '600' : '400',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* DÉCONNEXION */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1e293b' }}>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '0.75rem', backgroundColor: 'transparent',
            border: '1px solid #ef4444', borderRadius: '8px',
            color: '#ef4444', cursor: 'pointer', fontWeight: '500',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            fontSize: '0.9rem',
          }}>
            <span>🚪</span>
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {/* TOPBAR */}
        <div style={{
          backgroundColor: '#fff', padding: '1rem 2rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ color: '#fff', fontWeight: '600', fontSize: '1rem' }}>
            {menuItems.find(m => m.href === pathname)?.icon}{' '}
            {menuItems.find(m => m.href === pathname)?.label || 'Admin'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/" target="_blank" style={{ color: '#00bcd4', fontSize: '0.85rem', textDecoration: 'none' }}>
              🌐 Voir le site
            </Link>
            <div style={{
              width: '36px', height: '36px', backgroundColor: '#00bcd4',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '0.9rem',
            }}>A</div>
          </div>
        </div>

        {/* PAGE */}
        <div style={{ padding: '2rem', backgroundColor: '#0f172a', minHeight: 'calc(100vh - 60px)' }}>
          {children}
        </div>
      </main>
    </div>
  )
}