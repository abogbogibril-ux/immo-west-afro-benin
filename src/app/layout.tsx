import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/ThemeProvider'
import Footer from '@/components/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://benin.immowestafro.com'),
  title: {
    default: 'Immo West Afro B�nin � Vente et location immobili�re',
    template: '%s | Immo West Afro B�nin',
  },
  description:
    'Trouvez votre bien immobilier au B�nin. Appartements, villas, terrains et bureaux � vendre ou � louer � Cotonou, Abomey-Calavi, Porto-Novo et partout au B�nin.',
  keywords: [
    'immobilier B�nin', 'maison � vendre Cotonou', 'appartement � louer B�nin',
    'terrain Cotonou', 'villa B�nin', 'agence immobili�re B�nin',
    'Immo West Afro', 'immobilier Abomey-Calavi', 'immobilier Porto-Novo',
  ],
  authors: [{ name: 'Immo West Afro' }],
  creator: 'Immo West Afro',
  publisher: 'Immo West Afro',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  manifest: '/manifest.json',
  icons: {
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_BJ',
    url: 'https://benin.immowestafro.com',
    siteName: 'Immo West Afro B�nin',
    title: 'Immo West Afro B�nin � Vente et location immobili�re',
    description: 'Trouvez votre bien immobilier au B�nin.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Trouvez votre bien immobilier id�al au B�nin' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Immo West Afro B�nin',
    description: 'Trouvez votre bien immobilier au B�nin.',
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
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=yes" />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
        <ServiceWorkerRegister />
        <ThemeProvider>
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
