import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const BASE = 'https://benin.immowestafro.com'

const VILLES = ['cotonou', 'abomey-calavi', 'porto-novo', 'parakou', 'bohicon', 'ouidah']
const TYPES  = ['maison', 'appartement', 'villa', 'terrain', 'bureau', 'studio']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  // ── Pages statiques ───────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                     lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/recherche`,      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/a-propos`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/cgu`,            lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ]

  // ── Pages par type de bien ────────────────────────────────────────────────
  const typePages: MetadataRoute.Sitemap = TYPES.map(type => ({
    url: `${BASE}/recherche?type=${type}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // ── Pages par ville ───────────────────────────────────────────────────────
  const villePages: MetadataRoute.Sitemap = VILLES.map(ville => ({
    url: `${BASE}/recherche?ville=${ville}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // ── Pages combinées ville + type ──────────────────────────────────────────
  const comboPages: MetadataRoute.Sitemap = VILLES.flatMap(ville =>
    ['maison', 'appartement', 'villa', 'terrain'].map(type => ({
      url: `${BASE}/recherche?ville=${ville}&type=${type}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  )

  // ── Pages dynamiques des biens ────────────────────────────────────────────
  let bienPages: MetadataRoute.Sitemap = []
  try {
    const { data: biens } = await supabase
      .from('biens')
      .select('id, updated_at')
      .eq('statut', 'publié')
      .order('created_at', { ascending: false })
      .limit(1000)

    bienPages = (biens ?? []).map(bien => ({
      url: `${BASE}/bien/${bien.id}`,
      lastModified: new Date(bien.updated_at ?? new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  } catch {
    // Supabase indisponible — sitemap sans biens dynamiques
  }

  return [
    ...staticPages,
    ...typePages,
    ...villePages,
    ...comboPages,
    ...bienPages,
  ]
}