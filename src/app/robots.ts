import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/connexion',
          '/inscription',
          '/mot-de-passe-oublie',
          '/publier',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
        ],
      },
    ],
    sitemap: 'https://benin.immowestafro.com/sitemap.xml',
    host: 'https://benin.immowestafro.com',
  }
}