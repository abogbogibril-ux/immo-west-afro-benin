import Link from 'next/link'

interface Props {
  besoin: {
    id: string
    type_besoin: string
    transaction: string
    ville?: string
    budget_min?: number
    budget_max?: number
    surface_min?: number
    nb_chambres?: number
    description?: string
    created_at?: string
  }
}

const TYPE_LABELS: Record<string, string> = {
  appartement: 'appartement', maison: 'maison', terrain: 'terrain',
  bureau: 'bureau/local commercial', villa: 'villa', studio: 'studio',
}

export default function BesoinCard({ besoin }: Props) {
  const typeLabel = TYPE_LABELS[besoin.type_besoin] || besoin.type_besoin
  const transactionLabel = besoin.transaction === 'location' ? 'louer' : 'acheter'
  const ville = besoin.ville || 'toute localite'
  const prixFormate = besoin.budget_min && besoin.budget_max
    ? `${new Intl.NumberFormat('fr-FR').format(besoin.budget_min)} - ${new Intl.NumberFormat('fr-FR').format(besoin.budget_max)} FCFA`
    : besoin.budget_max
    ? `Max ${new Intl.NumberFormat('fr-FR').format(besoin.budget_max)} FCFA`
    : besoin.budget_min
    ? `Min ${new Intl.NumberFormat('fr-FR').format(besoin.budget_min)} FCFA`
    : null

  const texteUrgent = `Besoin urgent ${besoin.transaction === 'location' ? "d'un" : "d'un"} ${typeLabel} a ${transactionLabel} a ${ville}, immediatement disponible.`

  return (
    <Link href={`/besoins/${besoin.id}`}
      className="group bg-white rounded-2xl border-2 border-blue-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">

      {/* Zone texte urgent - meme hauteur que les photos */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center p-5 flex-shrink-0">
        {/* Badge Besoin */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm bg-amber-400 text-amber-900">
            🔍 Recherche
          </span>
        </div>
        {/* Icone recherche haut droite */}
        <div className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        {/* Texte urgent */}
        <p className="text-white text-base font-bold text-center leading-snug line-clamp-4 px-2">
          {texteUrgent}
        </p>
      </div>

      {/* Infos */}
      <div className="p-4 flex flex-col flex-1">
        {/* Budget */}
        {prixFormate && (
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-lg font-bold text-blue-600">{prixFormate}</span>
          </div>
        )}

        {/* Type + transaction */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors flex-1 capitalize">
          {typeLabel} a {transactionLabel}
        </h3>

        {/* Stats */}
        {(besoin.surface_min || besoin.nb_chambres) && (
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2.5">
            {besoin.surface_min && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                </svg>
                {besoin.surface_min} m² min
              </span>
            )}
            {besoin.nb_chambres && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                {besoin.nb_chambres} ch. min
              </span>
            )}
          </div>
        )}

        {/* Localisation */}
        {besoin.ville && (
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            </svg>
            <span className="truncate">{besoin.ville}</span>
          </p>
        )}
      </div>
    </Link>
  )
}