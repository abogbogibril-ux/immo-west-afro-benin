import type { Metadata } from 'next'
import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'Immo West Afro - Bénin | Achat, Vente et Location Immobilière',
    template: '%s | Immo West Afro Bénin',
  },
  description:
    "La plateforme de référence pour l'immobilier au Bénin. Trouvez maisons, appartements, terrains et villas à Cotonou, Porto-Novo, Parakou et partout au Bénin.",
  keywords: [
    'immobilier Bénin',
    'maison à vendre Cotonou',
    'appartement Bénin',
    'terrain à vendre Bénin',
    'villa Porto-Novo',
    'location immobilier Bénin',
  ],
  openGraph: {
    title: 'Immo West Afro - Bénin',
    description: 'Trouvez votre bien immobilier idéal au Bénin',
    url: 'https://benin.immowestafro.com',
    siteName: 'Immo West Afro Bénin',
    locale: 'fr_BJ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Immo West Afro - Bénin',
    description: 'La plateforme immobilière de référence au Bénin',
  },
  metadataBase: new URL('https://benin.immowestafro.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}