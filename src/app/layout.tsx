import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/ThemeProvider'
import Footer from '@/components/Footer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import MobileActionBar from '@/components/MobileActionBar'
import { AuthProvider } from '@/contexts/AuthContext'

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
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: {
    canonical: 'https://benin.immowestafro.com',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'fr_BJ',
    url: 'https://benin.immowestafro.com',
    siteName: 'Immo West Afro Bénin',
    title: 'Immo West Afro Bénin — Vente et location immobilière',
    description: 'Trouvez votre bien immobilier au Bénin.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Trouvez votre bien immobilier idéal au Bénin' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Immo West Afro Bénin — Vente et location immobilière',
    description: 'Trouvez votre bien immobilier au Bénin.',
    images: ['/og-image.jpg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Immo West Afro',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#0097a7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
        <ServiceWorkerRegister />
        <ThemeProvider>
          <AuthProvider>
          <Navbar />
          <main className="pt-16">
          <MobileActionBar />
            {children}
          </main>
          <Footer />
                  </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}