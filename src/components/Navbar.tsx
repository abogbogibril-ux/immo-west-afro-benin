'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [langue, setLangue] = useState<'FR' | 'EN'>('FR')
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (href: string) => pathname === href

  const navLinks = [
    { href: '/', label: langue === 'FR' ? 'Accueil' : 'Home' },
    { href: '/recherche', label: langue === 'FR' ? 'Recherche' : 'Search' },
    { href: '/a-propos', label: langue === 'FR' ? 'À propos' : 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav style={{
      backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'sticky', top: 0, zIndex: 1000,
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px',
      }}>

        {/* LOGO */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <Image src="/favicon.ico" alt="Logo" width={40} height={40} style={{ borderRadius: '8px' }} />
          <span style={{ color: '#0f172a', fontWeight: '800', fontSize: '0.95rem', lineHeight: '1.2' }}>
            Immo West Afro<br />
            <span style={{ color: '#00bcd4', fontSize: '0.75rem', fontWeight: '600' }}>Bénin</span>
          </span>
        </Link>

        {/* LIENS — Desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} style={{
              padding: '0.5rem 0.85rem', borderRadius: '6px', textDecoration: 'none',
              fontSize: '0.92rem', fontWeight: '500',
              color: isActive(link.href) ? '#00bcd4' : '#4a5568',
              backgroundColor: isActive(link.href) ? '#e0f7fa' : 'transparent',
              borderBottom: isActive(link.href) ? '2px solid #00bcd4' : '2px solid transparent',
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* DROITE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* LANGUE */}
          <button onClick={() => setLangue(langue === 'FR' ? 'EN' : 'FR')} style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.4rem 0.75rem', backgroundColor: 'transparent',
            border: '1px solid #e2e8f0', borderRadius: '6px',
            cursor: 'pointer', fontSize: '0.85rem', color: '#4a5568', fontWeight: '500',
          }}>
            🌐 {langue}
          </button>

          {user ? (
            <>
              <Link href="/publier" style={{
                padding: '0.4rem 1rem', backgroundColor: '#00bcd4',
                borderRadius: '6px', color: '#fff', textDecoration: 'none',
                fontSize: '0.85rem', fontWeight: '600',
              }}>
                + {langue === 'FR' ? 'Publier' : 'Post'}
              </Link>
              <button onClick={handleLogout} style={{
                padding: '0.4rem 1rem', backgroundColor: 'transparent',
                border: '1px solid #e2e8f0', borderRadius: '6px',
                color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500',
              }}>
                {langue === 'FR' ? 'Déconnexion' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link href="/connexion" style={{
                padding: '0.4rem 1rem', backgroundColor: 'transparent',
                border: '1px solid #00bcd4', borderRadius: '6px',
                color: '#00bcd4', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500',
              }}>
                {langue === 'FR' ? 'Connexion' : 'Login'}
              </Link>
              <Link href="/inscription" style={{
                padding: '0.4rem 1rem', backgroundColor: '#00bcd4',
                borderRadius: '6px', color: '#fff', textDecoration: 'none',
                fontSize: '0.85rem', fontWeight: '600',
              }}>
                {langue === 'FR' ? 'Inscription' : 'Sign up'}
              </Link>
            </>
          )}

          {/* MENU MOBILE */}
          <button onClick={() => setMenuOuvert(!menuOuvert)} style={{
            display: 'none', backgroundColor: 'transparent', border: 'none',
            fontSize: '1.5rem', cursor: 'pointer', color: '#0f172a',
          }} className="menu-mobile">
            {menuOuvert ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* MENU MOBILE OUVERT */}
      {menuOuvert && (
        <div style={{
          backgroundColor: '#fff', borderTop: '1px solid #e2e8f0',
          padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              onClick={() => setMenuOuvert(false)}
              style={{
                padding: '0.75rem', borderRadius: '8px', textDecoration: 'none',
                color: isActive(link.href) ? '#00bcd4' : '#374151',
                backgroundColor: isActive(link.href) ? '#e0f7fa' : 'transparent',
                fontWeight: '500',
              }}>
              {link.label}
            </Link>
          ))}
          <Link href="/publier" onClick={() => setMenuOuvert(false)} style={{
            padding: '0.75rem', backgroundColor: '#00bcd4', borderRadius: '8px',
            color: '#fff', textDecoration: 'none', fontWeight: '600', textAlign: 'center',
          }}>
            + Publier un bien
          </Link>
        </div>
      )}
    </nav>
  )
}