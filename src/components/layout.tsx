/**
 * layout.tsx — Root Layout Immo West Afro Bénin
 * Next.js 14 App Router
 *
 * Intègre :
 *   - ThemeProvider next-themes (dark par défaut)
 *   - Google Analytics 4
 *   - PWA manifest + Service Worker
 *   - Bottom Navigation mobile
 *   - Safe area CSS
 *   - Fonts optimisées
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import BottomNav from "@/components/mobile/BottomNav";
import "@/styles/globals.css";

// ── Police ──────────────────────────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

// ── Métadonnées SEO ─────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL("https://benin.immowestafro.com"),
  title: {
    default: "Immo West Afro Bénin — Immobilier à Cotonou, Calavi, Porto-Novo",
    template: "%s — Immo West Afro Bénin",
  },
  description:
    "Trouvez ou publiez des annonces immobilières au Bénin : appartements, villas, terrains, bureaux à Cotonou, Abomey-Calavi, Porto-Novo et dans tout le Bénin.",
  keywords: [
    "immobilier bénin",
    "appartement cotonou",
    "villa cotonou",
    "terrain calavi",
    "location cotonou",
    "vente maison bénin",
    "immobilier afrique de l'ouest",
    "agence immobilière bénin",
  ],
  authors: [{ name: "Immo West Afro Bénin", url: "https://benin.immowestafro.com" }],
  creator: "Immo West Afro",
  publisher: "Immo West Afro",

  openGraph: {
    type: "website",
    locale: "fr_BJ",
    url: "https://benin.immowestafro.com",
    siteName: "Immo West Afro Bénin",
    title: "Immobilier au Bénin — Trouvez votre bien",
    description:
      "La plateforme immobilière de référence au Bénin. Annonces de vente et location à Cotonou, Calavi, Porto-Novo.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Immo West Afro Bénin",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Immo West Afro Bénin",
    description: "Immobilier au Bénin : vente, location, terrain",
    images: ["/og-image.jpg"],
  },

  manifest: "/manifest.json",

  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },

  alternates: {
    canonical: "https://benin.immowestafro.com",
  },
};

// ── Viewport ─────────────────────────────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  // Pas de user-scalable=no — accessibilité
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
};

// ── Script d'enregistrement Service Worker ──────────────────
const SW_REGISTRATION_SCRIPT = `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function(registration) {
          console.log('[PWA] Service Worker enregistré:', registration.scope);
        })
        .catch(function(error) {
          console.warn('[PWA] Erreur Service Worker:', error);
        });
    });
  }
`;

// ── Layout ──────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={inter.variable}
    >
      <head>
        {/* Préconnexions pour performances */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://huvtgaunkcglyeypdtws.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Service Worker */}
        <script
          dangerouslySetInnerHTML={{ __html: SW_REGISTRATION_SCRIPT }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {/* Google Analytics 4 */}
          <Suspense fallback={null}>
            <GoogleAnalytics
              gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""}
            />
          </Suspense>

          {/* Contenu principal */}
          {children}

          {/* Navigation mobile (pages publiques uniquement) */}
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
