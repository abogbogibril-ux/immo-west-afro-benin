'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [menuOuvert, setMenuOuvert] = useState(false)

  return (
    <nav style={{ backgroundColor: '#0099CC' }} className="sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold text-white"
            >
              🏗️
            </div>
            <span className="text-white font-bold text-lg leading-tight">
              Immo West<br />
              <span className="text-xs font-normal opacity-90">Afro Bénin</span>
            </span>
          </Link>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/" icone="🏠" label="Accueil" />
            <NavLink href="/search" icone="🔍" label="Recherche" />
            <NavLink href="/about" icone="ℹ️" label="À propos" />
            <NavLink href="/contact" icone="✉️" label="Contact" />
          </div>

          {/* Actions droite */}
          <div className="hidden md:flex items-center gap-3">
            {/* Sélecteur langue */}
            <button
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.35rem 0.75rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              🌐 FR
            </button>

            <Link
              href="/login"
              style={{
                color: 'white',
                textDecoration: 'none',
                padding: '0.4rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: 500,
                fontSize: '0.9rem',
                border: '1px solid rgba(255,255,255,0.4)',
                transition: 'all 0.2s',
              }}
              className="hover:bg-white hover:bg-opacity-10"
            >
              Connexion
            </Link>

            <Link
              href="/register"
              style={{
                backgroundColor: 'white',
                color: '#0099CC',
                textDecoration: 'none',
                padding: '0.4rem 1.1rem',
                borderRadius: '0.5rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'opacity 0.2s',
              }}
              className="hover:opacity-90"
            >
              Inscription
            </Link>
          </div>

          {/* Bouton menu mobile */}
          <button
            className="md:hidden text-white p-2 rounded"
            onClick={() => setMenuOuvert(!menuOuvert)}
            aria-label="Menu"
          >
            {menuOuvert ? '✕' : '☰'}
          </button>
        </div>

        {/* Menu mobile */}
        {menuOuvert && (
          <div
            style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}
            className="md:hidden py-3 pb-4 flex flex-col gap-2"
          >
            <MobileNavLink href="/" label="🏠 Accueil" onClick={() => setMenuOuvert(false)} />
            <MobileNavLink href="/search" label="🔍 Recherche" onClick={() => setMenuOuvert(false)} />
            <MobileNavLink href="/about" label="ℹ️ À propos" onClick={() => setMenuOuvert(false)} />
            <MobileNavLink href="/contact" label="✉️ Contact" onClick={() => setMenuOuvert(false)} />
            <div className="flex gap-2 mt-2 px-2">
              <Link
                href="/login"
                onClick={() => setMenuOuvert(false)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255,255,255,0.4)',
                  fontSize: '0.9rem',
                }}
              >
                Connexion
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOuvert(false)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  backgroundColor: 'white',
                  color: '#0099CC',
                  textDecoration: 'none',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                Inscription
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLink({ href, icone, label }: { href: string; icone: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        color: 'white',
        textDecoration: 'none',
        padding: '0.4rem 0.85rem',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'background-color 0.2s',
      }}
      className="hover:bg-white hover:bg-opacity-20"
    >
      <span>{icone}</span>
      {label}
    </Link>
  )
}

function MobileNavLink({
  href,
  label,
  onClick,
}: {
  href: string
  label: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        color: 'white',
        textDecoration: 'none',
        padding: '0.6rem 1rem',
        borderRadius: '0.5rem',
        fontSize: '0.95rem',
        display: 'block',
      }}
      className="hover:bg-white hover:bg-opacity-10"
    >
      {label}
    </Link>
  )
}