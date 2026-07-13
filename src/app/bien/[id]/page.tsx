export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import PropertyGallery from './PropertyGallery'
import AgentContactCard from './AgentContactCard'
import InfoAnnonceTable from './InfoAnnonceTable'
import SimilarProperties from './SimilarProperties'
import { Suspense } from 'react'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: bien } = await supabase
    .from('biens')
    .select('titre, description, prix, type_bien, transaction, images_biens(url, ordre)')
    .eq('id', params.id)
    .single()

  if (!bien) return { title: 'Annonce introuvable | Immo West Afro' }

  const image = bien.images_biens?.find((i: any) => i.ordre === 0)?.url ?? bien.images_biens?.[0]?.url

  return {
    title: `${bien.titre} | Immo West Afro Bénin`,
    description: bien.description?.slice(0, 160) ?? `${bien.type_bien} à louer ou à vendre au Bénin`,
    openGraph: {
      title: bien.titre,
      description: bien.description?.slice(0, 160),
      images: image ? [{ url: image }] : [],
    },
  }
}

export const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement', maison: 'Maison', terrain: 'Terrain',
  bureau: 'Bureau / Commercial', villa: 'Villa', studio: 'Studio', entrepot: 'Entrepôt',
}

export function formatPrice(prix: number, transaction: string) {
  return `${new Intl.NumberFormat('fr-FR').format(prix)} FCFA${transaction === 'location' ? '/mois' : ''}`
}

function getEmbedUrl(url: string): string {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return url
}

export default async function BienDetailPage({ params }: Props) {

  const { data: { session } } = await supabase.auth.getSession()

  const { data: bien, error } = await supabase
    .from('biens')
    .select(`
      *,
      localites (id, ville, arrondissement, quartier),
      profiles (id, nom, prenom, telephone, avatar_url, email, role, whatsapp, nom_agence, ville),
      images_biens (id, url, ordre)
    `)
    .eq('id', params.id)
    .in('statut', ['publié', 'disponible'])
    .single()

  if (error || !bien) notFound()


  let isFavorited = false
  if (session?.user) {
    const { data: fav } = await supabase
      .from('favoris').select('id')
      .eq('user_id', session.user.id).eq('bien_id', params.id).maybeSingle()
    isFavorited = !!fav
  }

  const images = [...(bien.images_biens ?? [])].sort((a: any, b: any) => {
    if (a.is_principale) return -1
    if (b.is_principale) return 1
    return (a.ordre ?? 0) - (b.ordre ?? 0)
  })

  const typeLabel = TYPE_LABELS[bien.type_bien] ?? bien.type_bien
  const ref = `IWA-${String(bien.numero_sequence).padStart(5, "0")}`
  const datePublication = new Date(bien.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[var(--background)]">

      {/* HERO */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-4 flex-wrap">
            <Link href="/" className="hover:text-green-600">Accueil</Link>
            <span>/</span>
            <Link href="/recherche" className="hover:text-green-600">Annonces</Link>
            <span>/</span>
            {bien.localites?.ville && (
              <>
                <Link href={`/recherche?ville=${bien.localites.ville}`} className="hover:text-green-600">
                  {bien.localites.ville}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-600 font-medium truncate max-w-[200px]">{bien.titre}</span>
          </nav>

          {/* TITRE — au-dessus de la photo principale */}
          <div className="mb-5">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                bien.transaction === 'vente' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {bien.transaction === 'vente' ? 'À Vendre' : 'À Louer'}
              </span>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                {typeLabel}
              </span>
            </div>
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight break-words">{bien.titre}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-sm text-gray-500">
              {bien.localites && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  {bien.localites.ville}
                </span>
              )}
              <span className="text-gray-400">Réf. <span className="font-mono text-gray-600">{ref}</span></span>
              <span className="text-gray-400">{datePublication}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-5 lg:gap-6">
            <PropertyGallery images={images} titre={bien.titre} bienId={params.id} userId={session?.user?.id} isFavorited={isFavorited} />
            <AgentContactCard
              prix={bien.prix}
              transaction={bien.transaction}
              surface={bien.surface}
              statut={bien.statut}
              agent={bien.profiles}
              bienId={params.id}
              bienTitre={bien.titre}
              userId={session?.user?.id}
              isFavorited={isFavorited}
            />
          </div>
        </div>
      </section>

      {/* CORPS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-5 lg:gap-6">
          <div className="space-y-5">

          <InfoAnnonceTable
            numero={ref}
            prix={bien.prix}
            datePublication={datePublication}
            vues={bien.vues ?? 0} bienId={params.id}
            typeBien={typeLabel}
            transaction={bien.transaction}
            nbPieces={bien.nb_pieces}
            nbChambres={bien.nb_chambres}
            nbSallesBain={bien.nb_salles_bain}
            surface={bien.surface}
            surfaceTerrain={bien.surface_terrain}
            etage={bien.etage}
            etat={bien.etat_bien}
            cuisine={bien.cuisine}
            parking={bien.parking}
            jardin={bien.jardin}
            balcon={bien.balcon}
            terrasse={bien.terrasse}
            securite={bien.securite}
            eau={bien.eau}
            electricite={bien.electricite}
            disponibleImmediat={bien.disponible_immediat}
            nbEtages={bien.nb_etages}
            pointsRepere={bien.points_repere}
            meuble={bien.meuble}
            caracteristiques={bien.caracteristiques}
          />

          {bien.description && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5 md:px-7 md:py-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                Description du bien
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-[15px]">{bien.description}</p>
            </div>
          )}

          {/* VISITE VIDÉO */}
          {bien.video_url && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5 md:px-7 md:py-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                🎥 Visite vidéo
              </h2>
              <div style={{
                position: 'relative', paddingBottom: '56.25%',
                height: 0, overflow: 'hidden', borderRadius: '12px', backgroundColor: '#000',
              }}>
                <iframe
                  src={getEmbedUrl(bien.video_url)}
                  title="Visite vidéo du bien"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: '100%', border: 'none',
                  }}
                />
              </div>
            </div>
          )}

          </div>

          <div className="hidden lg:block" />
        </div>
      </div>

      <section className="bg-white border-t border-gray-100 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-80" />
              ))}
            </div>
          }>
          <SimilarProperties
            currentId={params.id}
            agentId={bien.agent_id}
            typeBien={bien.type_bien}
            ville={bien.localites?.ville}
            transaction={bien.transaction}
          />
          </Suspense>
        </div>
      </section>

    </div>
  )
}

