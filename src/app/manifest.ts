import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Immo West Afro Bénin',
    short_name: 'Immo West Afro',
    description: 'Trouvez votre bien immobilier au Bénin — Vente et location',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    orientation: 'portrait',
    categories: ['real estate', 'lifestyle'],
    lang: 'fr',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Rechercher un bien',
        url: '/recherche',
        description: 'Parcourir toutes les annonces',
      },
      {
        name: 'Mes favoris',
        url: '/dashboard/client/favoris',
        description: 'Accéder à mes biens sauvegardés',
      },
      {
        name: 'Publier une annonce',
        url: '/publier',
        description: 'Déposer une annonce gratuitement',
      },
    ],
  }
}