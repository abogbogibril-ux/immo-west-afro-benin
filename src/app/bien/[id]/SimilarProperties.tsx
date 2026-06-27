import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Props {
  currentId: string
  typeBien: string
  ville?: string
  transaction: string
}

function formatPrice(prix: number, transaction: string) {
  return `${new Intl.NumberFormat('fr-FR').format(prix)} FCFA${transaction === 'location' ? '/mois' : ''}`
}

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement', maison: 'Maison', terrain: 'Terrain',
  bureau: 'Bureau', villa: 'Villa', studio: 'Studio',
}

export default async function SimilarProperties({ currentId, typeBien, ville, transaction }: Props) {

  const { data: byTypeVille } = await supabase
    .from('biens')
    .select(`
      id, titre, prix, surface, nb_chambres, transaction, type_bien,
      localites (nom, ville),
      images (url, is_principale, ordre)
    `)
    .neq('id', currentId)
    .eq('statut', 'publié')
    .eq('transaction', transaction)
    .eq('type_bien', typeBien)
    .limit(6)

  let pool = byTypeVille ?? []

  if (pool.length < 3) {
    const { data: byType } = await supabase
      .from('biens')
      .select(`
        id, titre, prix, surface, nb_chambres, transaction, type_bien,
        localites (nom, ville),
        images (url, is_principale, ordre)
      `)
      .neq('id', currentId)
      .eq('statut', 'publié')
      .eq('type_bien', typeBien)
      .limit(6)
    pool = byType ?? pool
  }

  if (pool.length < 3) {
    const { data: byTx } = await supabase
      .from('biens')
      .select(`
        id, titre, prix, surface, nb_chambres, transaction, type_bien,
        localites (nom, ville),
        images (url, is_principale, ordre)
      `)
      .neq('id', currentId)
      .eq('statut', 'publié')
      .eq('transaction', transaction)
      .limit(6)
    pool = byTx ?? pool
  }

  const similaires = pool.slice(0, 3)
  if (similaires.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Biens similaires</h2>
          <p className="text-sm text-gray-500 mt-1">
            {TYPE_LABELS[typeBien] ?? typeBien}s {transaction === 'vente' ? 'à vendre' : 'à louer'}
            {ville && ` à ${ville}`}
          </p>
        </div>
        <Link href={`/recherche?type=${typeBien}&transaction=${transaction}${ville ? `&ville=${ville}` : ''}`}
          className="flex items-center gap-1.5 text-sm text-green-600 font-semibold hover:text-green-700">
          Voir tout
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {similaires.map((bien: any) => {
          const sortedImages = [...(bien.images ?? [])].sort((a: any, b: any) => {
            if (a.is_principale) return -1
            if (b.is_principale) return 1
            return (a.ordre ?? 0) - (b.ordre ?? 0)
          })
          const photo = sortedImages[0]?.url

          return (
            <div key={bien.id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">

              <div className="relative h-52 bg-gray-100 overflow-hidden flex-shrink-0">
                {photo ? (
                  <img src={photo} alt={bien.titre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${
                    bien.transaction === 'vente' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                  }`}>
                    {bien.transaction === 'vente' ? 'Vente' : 'Location'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="text-lg font-bold text-green-600 mb-2">
                  {formatPrice(bien.prix, bien.transaction)}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-green-700 transition-colors flex-1">
                  {bien.titre}
                </h3>
                {(bien.surface || bien.nb_chambres) && (
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-2.5">
                    {bien.surface && <span>📐 {bien.surface} m²</span>}
                    {bien.nb_chambres && <span>🛏 {bien.nb_chambres} ch.</span>}
                  </div>
                )}
                {bien.localites && (
                  <p className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    </svg>
                    <span className="truncate">{bien.localites.nom}, {bien.localites.ville}</span>
                  </p>
                )}
                <Link href={`/bien/${bien.id}`}
                  className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors">
                  Voir le bien
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}