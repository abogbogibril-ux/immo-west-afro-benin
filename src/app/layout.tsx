import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://benin.immowestafro.com'),
  title: {
    default: 'Immo West Afro Bénin — Vente et location immobilière',
    template: '%s | Immo West Afro Bénin',
  },
  description:
    'Trouvez votre bien immobilier au Bénin. Appartements, villas, terrains et bureaux à vendre ou à louer à Cotonou, Abomey-Calavi, Porto-Novo et partout au Bénin.',
  keywords: [
    'immobilier Bénin', 'maison à vendre Cotonou', 'appartement à louer Bénin',
    'terrain Cotonou', 'villa Bénin', 'agence immobilière Bénin',
    'Immo West Afro', 'immobilier Abomey-Calavi', 'immobilier Porto-Novo',
  ],
  authors: [{ name: 'Immo West Afro' }],
  creator: 'Immo West Afro',
  publisher: 'Immo West Afro',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_BJ',
    url: 'https://benin.immowestafro.com',
    siteName: 'Immo West Afro Bénin',
    title: 'Immo West Afro Bénin — Vente et location immobilière',
    description: 'Trouvez votre bien immobilier au Bénin.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Immo West Afro Bénin' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Immo West Afro Bénin',
    description: 'Trouvez votre bien immobilier au Bénin.',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Immo West Afro',
  },
}

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=yes" />
      </head>
      <body className={inter.className}>
        <Navbar />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}