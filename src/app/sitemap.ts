import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE = 'https://benin.immowestafro.com'

function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/recherche`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/besoins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/deposer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/a-propos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/cgu`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/inscription`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/connexion`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  let bienPages: MetadataRoute.Sitemap = []
  try {
    const supabase = createServerClient()
    const { data: biens } = await supabase
      .from('biens')
      .select('id, updated_at')
      .eq('statut', 'publie')
      .order('created_at', { ascending: false })
      .limit(1000)
    bienPages = (biens ?? []).map(bien => ({
      url: `${BASE}/bien/${bien.id}`,
      lastModified: new Date(bien.updated_at ?? new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  } catch {
    // Supabase indisponible
  }

  let bienPages2: MetadataRoute.Sitemap = []
  try {
    const supabase = createServerClient()
    const { data: biens2 } = await supabase
      .from('biens')
      .select('id, updated_at')
      .eq('statut', 'publie')
      .order('created_at', { ascending: false })
      .limit(1000)
    bienPages2 = (biens2 ?? []).map(bien => ({
      url: `${BASE}/bien/${bien.id}`,
      lastModified: new Date(bien.updated_at ?? new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  } catch {}

  return [...staticPages, ...bienPages]
}