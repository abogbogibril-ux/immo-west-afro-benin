/**
 * not-found.tsx — Page 404 personnalisée
 * Immo West Afro Bénin
 *
 * Next.js App Router : ce fichier remplace automatiquement la 404 par défaut.
 * Thème adaptatif light/dark avec les couleurs du site.
 */

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page introuvable — Immo West Afro Bénin",
  description: "Cette page n'existe pas ou a été déplacée.",
  robots: { index: false, follow: false },
};

const suggestions = [
  { href: "/", label: "Accueil", description: "Retourner à l'accueil" },
  { href: "/recherche", label: "Rechercher", description: "Trouver un bien" },
  { href: "/publier", label: "Publier", description: "Poster une annonce" },
  { href: "/contact", label: "Contact", description: "Nous contacter" },
];

const quickLinks = [
  { href: "/recherche?type=appartement&ville=Cotonou", label: "Appartements à Cotonou" },
  { href: "/recherche?type=villa&ville=Cotonou", label: "Villas à Cotonou" },
  { href: "/recherche?type=terrain&ville=Calavi", label: "Terrains à Calavi" },
  { href: "/recherche?type=bureau&ville=Cotonou", label: "Bureaux à Cotonou" },
];

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      {/* Header minimal */}
      <header className="px-6 py-4 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2 w-fit group">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">IW</span>
          </div>
          <span className="font-bold text-[var(--foreground)] group-hover:text-emerald-500 transition-colors">
            Immo West Afro
          </span>
          <span className="text-xs text-[var(--muted)] bg-[var(--card)] px-2 py-0.5 rounded-full">
            Bénin
          </span>
        </Link>
      </header>

      {/* Contenu 404 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* Illustration */}
        <div className="relative mb-8">
          {/* Cercles décoratifs */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-emerald-500/10 animate-pulse" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-emerald-500/15" />
          </div>

          {/* Maison SVG */}
          <div className="relative z-10 flex items-center justify-center w-32 h-32 mx-auto">
            <svg
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-24 h-24"
            >
              {/* Maison */}
              <path
                d="M60 15L10 55V110H45V75H75V110H110V55L60 15Z"
                fill="#10b981"
                fillOpacity="0.2"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Toit */}
              <path
                d="M60 15L110 55H10L60 15Z"
                fill="#10b981"
                fillOpacity="0.4"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Porte */}
              <rect x="48" y="80" width="24" height="30" rx="12" fill="#10b981" fillOpacity="0.6" />
              {/* Fenêtres */}
              <rect x="20" y="65" width="18" height="16" rx="3" fill="#10b981" fillOpacity="0.5" />
              <rect x="82" y="65" width="18" height="16" rx="3" fill="#10b981" fillOpacity="0.5" />
              {/* Point d'interrogation */}
              <text
                x="60"
                y="107"
                textAnchor="middle"
                fontSize="24"
                fontWeight="bold"
                fill="#10b981"
              >
                ?
              </text>
            </svg>
          </div>
        </div>

        {/* 404 */}
        <div className="mb-4">
          <p className="text-8xl font-black text-emerald-500/20 leading-none select-none" aria-hidden="true">
            404
          </p>
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-3">
          Ce bien est introuvable
        </h1>
        <p className="text-[var(--muted)] text-base max-w-md mb-10 leading-relaxed">
          La page que vous cherchez a peut-être été déplacée, supprimée, ou n&apos;a jamais existé.
          <br className="hidden sm:block" />
          Retournez à l&apos;accueil ou utilisez la recherche.
        </p>

        {/* Boutons CTA */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <Link
            href="/"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors min-h-[44px] flex items-center"
          >
            ← Retour à l&apos;accueil
          </Link>
          <Link
            href="/recherche"
            className="px-6 py-3 bg-[var(--card)] hover:bg-[var(--border)] text-[var(--foreground)] font-semibold rounded-xl border border-[var(--border)] transition-colors min-h-[44px] flex items-center"
          >
            Rechercher un bien
          </Link>
        </div>

        {/* Liens rapides */}
        <div className="w-full max-w-lg">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
            Recherches populaires au Bénin
          </p>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="
                  px-4 py-3 rounded-lg border border-[var(--border)]
                  bg-[var(--card)] hover:border-emerald-500/50 hover:bg-emerald-500/5
                  text-sm text-[var(--foreground)] text-left
                  transition-all duration-150 min-h-[44px] flex items-center
                "
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer minimal */}
      <footer className="px-6 py-4 border-t border-[var(--border)] text-center">
        <p className="text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} Immo West Afro Bénin —{" "}
          <a href="mailto:calavi_immo@immowestafro.com" className="hover:text-emerald-500 transition-colors">
            calavi_immo@immowestafro.com
          </a>
        </p>
      </footer>
    </main>
  );
}
