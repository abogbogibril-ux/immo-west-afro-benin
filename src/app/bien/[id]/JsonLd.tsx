interface Props {
  bien: {
    id: string
    titre: string
    description?: string
    prix: number
    transaction: string
    type_bien: string
    surface?: number
    nb_chambres?: number
    adresse?: string
    created_at: string
    localites?: { nom: string; ville: string; departement?: string }
    profiles?: { prenom: string; nom: string; telephone?: string; email?: string }
    images?: { url: string; is_principale: boolean }[]
  }
}

export default function JsonLd({ bien }: Props) {
  const baseUrl = 'https://benin.immowestafro.com'
  const url = `${baseUrl}/bien/${bien.id}`

  const images = (bien.images ?? [])
    .sort((a, b) => (b.is_principale ? 1 : 0) - (a.is_principale ? 1 : 0))
    .map(i => i.url)
    .slice(0, 5)

  const ville = bien.localites?.ville ?? 'Cotonou'
  const quartier = bien.localites?.nom ?? ''
  const adresseComplete = [bien.adresse, quartier, ville, 'Bénin'].filter(Boolean).join(', ')

  // Schema RealEstateListing
  const listingSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': url,
    name: bien.titre,
    description: bien.description ?? `${bien.type_bien} à ${bien.transaction === 'vente' ? 'vendre' : 'louer'} à ${ville}, Bénin.`,
    url,
    image: images,
    datePosted: bien.created_at,
    price: bien.prix,
    priceCurrency: 'XOF',
    priceValidUntil: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],

    // Localisation
    locationCreated: {
      '@type': 'Place',
      name: adresseComplete,
      address: {
        '@type': 'PostalAddress',
        streetAddress: bien.adresse ?? quartier,
        addressLocality: ville,
        addressCountry: 'BJ',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 6.3703,
        longitude: 2.3912,
      },
    },

    // Caractéristiques
    ...(bien.surface && { floorSize: { '@type': 'QuantitativeValue', value: bien.surface, unitCode: 'MTK' } }),
    ...(bien.nb_chambres && { numberOfRooms: bien.nb_chambres }),

    // Vendeur / Agent
    seller: bien.profiles ? {
      '@type': 'RealEstateAgent',
      name: `${bien.profiles.prenom} ${bien.profiles.nom}`,
      telephone: bien.profiles.telephone ?? '',
      url: baseUrl,
    } : {
      '@type': 'Organization',
      name: 'Immo West Afro',
      url: baseUrl,
    },

    // Offre
    offers: {
      '@type': 'Offer',
      price: bien.prix,
      priceCurrency: 'XOF',
      availability: 'https://schema.org/InStock',
      url,
      seller: {
        '@type': 'Organization',
        name: 'Immo West Afro Bénin',
        url: baseUrl,
      },
    },
  }

  // Schema BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Annonces', item: `${baseUrl}/recherche` },
      { '@type': 'ListItem', position: 3, name: ville, item: `${baseUrl}/recherche?ville=${ville.toLowerCase()}` },
      { '@type': 'ListItem', position: 4, name: bien.titre, item: url },
    ],
  }

  // Schema Organization
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Immo West Afro Bénin',
    url: baseUrl,
    logo: `${baseUrl}/favicon.ico`,
    telephone: '+229 XX XX XX XX XX',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Cotonou',
      addressCountry: 'BJ',
    },
    sameAs: [
      'https://www.facebook.com/immowestafro',
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema).replace(/</g, '\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema).replace(/</g, '\u003c') }}
      />
    </>
  )
}