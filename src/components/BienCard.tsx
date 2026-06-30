import Link from 'next/link'
import OptimizedImage from './OptimizedImage'

interface Props {
  bien: {
    id: string
    titre: string
    prix: number
    transaction: string
    type_bien: string
    surface?: number
    nb_chambres?: number
    ville?: string
    localites?: { nom: string; ville: string }
    images_biens?: { url: string; ordre: number }[]
    statut?: string
    created_at?: string
  }
  priority?: boolean
}

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement', maison: 'Maison', terrain: 'Terrain',
  bureau: 'Bureau', villa: 'Villa', studio: 'Studio',
}

export default function BienCard({ bien, priority = false }: Props) {
  const imgs = [...(bien.images_biens ?? [])].sort((a, b) => a.ordre - b.ordre)
  const photo = imgs[0]?.url
  const ville = bien.localites?.ville ?? bien.ville ?? ''
  const quartier = bien.localites?.nom ?? ''
  const prixFormate = new Intl.NumberFormat('fr-FR').format(bien.prix)
  const isNew = bien.created_at
    ? Date.now() - new Date(bien.created_at).getTime() < 7 * 86400000
    : false

  return (
    <Link href={`/bien/${bien.id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">

      {/* Photo */}
      <div className="relative h-52 overflow-hidden bg-gray-100 flex-shrink-0">
        <OptimizedImage
          src={photo}
          alt={bien.titre}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex gap-1.5">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${
            bien.transaction === 'vente'
              ? 'bg-blue-600 text-white'
              : 'bg-green-600 text-white'
          }`}>
            {bien.transaction === 'vente' ? 'Vente' : 'Location'}
          </span>
          {isNew && (
            <span className="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold shadow-sm">
              Nouveau
            </span>
          )}
        </div>

        {/* Type */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="px-2 py-0.5 bg-black/50 text-white rounded-md text-xs font-medium backdrop-blur-sm">
            {TYPE_LABELS[bien.type_bien] ?? bien.type_bien}
          </span>
        </div>
      </div>

      {/* Infos */}
      <div className="p-4 flex flex-col flex-1">
        {/* Prix */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-lg font-bold text-green-600">{prixFormate}</span>
          <span className="text-xs text-gray-400 font-medium">
            FCFA{bien.transaction === 'location' ? '/mois' : ''}
          </span>
        </div>

        {/* Titre */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-green-700 transition-colors flex-1">
          {bien.titre}
        </h3>

        {/* Stats */}
        {(bien.surface || bien.nb_chambres) && (
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2.5">
            {bien.surface && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                </svg>
                {bien.surface} m²
              </span>
            )}
            {bien.nb_chambres && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                {bien.nb_chambres} ch.
              </span>
            )}
          </div>
        )}

        {/* Localisation */}
        {(quartier || ville) && (
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            </svg>
            <span className="truncate">
              {quartier ? `${quartier}, ${ville}` : ville}
            </span>
          </p>
        )}
      </div>
    </Link>
  )
}