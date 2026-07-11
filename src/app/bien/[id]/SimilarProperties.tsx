import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import OptimizedImage from '@/components/OptimizedImage'

interface Props {
  currentId: string
  typeBien: string
  ville?: string
  transaction: string
  agentId?: string
}

function formatPrice(prix: number, transaction: string) {
  return `${new Intl.NumberFormat('fr-FR').format(prix)} FCFA${transaction === 'location' ? '/mois' : ''}`
}

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement', maison: 'Maison', terrain: 'Terrain',
  bureau: 'Bureau', villa: 'Villa', studio: 'Studio',
}

const SELECT_FIELDS = `
  id, titre, prix, surface, nb_chambres, transaction, type_bien, agent_id,
  localites (ville, arrondissement, quartier),
  images_biens (url, is_principale, ordre)
`

export default async function SimilarProperties({ currentId, typeBien, ville, transaction, agentId }: Props) {

  // 1. Même type + même transaction
  const { data: byTypeTransaction, error: err1 } = await supabase
    .from('biens')
    .select(SELECT_FIELDS)
    .neq('id', currentId)
    .eq('statut', 'publié')
    .eq('transaction', transaction)
    .eq('type_bien', typeBien)
    .limit(6)

  let pool = byTypeTransaction ?? []
  const seenIds = new Set(pool.map((b: any) => b.id))

  // 2. Complément : même agent (autres annonces de cet agent)
  if (agentId && pool.length < 6) {
    const { data: byAgent } = await supabase
      .from('biens')
      .select(SELECT_FIELDS)
      .neq('id', currentId)
      .eq('statut', 'publié')
      .eq('agent_id', agentId)
      .limit(6)

    for (const b of byAgent ?? []) {
      if (!seenIds.has(b.id) && pool.length < 6) {
        pool.push(b)
        seenIds.add(b.id)
      }
    }
  }

  // 3. Complément : même type seulement (toutes villes/transactions)
  if (pool.length < 3) {
    const { data: byType } = await supabase
      .from('biens')
      .select(SELECT_FIELDS)
      .neq('id', currentId)
      .eq('statut', 'publié')
      .eq('type_bien', typeBien)
      .limit(6)

    for (const b of byType ?? []) {
      if (!seenIds.has(b.id) && pool.length < 6) {
        pool.push(b)
        seenIds.add(b.id)
      }
    }
  }

  // 4. Dernier recours : même transaction uniquement
  if (pool.length < 3) {
    const { data: byTx } = await supabase
      .from('biens')
      .select(SELECT_FIELDS)
      .neq('id', currentId)
      .eq('statut', 'publié')
      .eq('transaction', transaction)
      .limit(6)

    for (const b of byTx ?? []) {
      if (!seenIds.has(b.id) && pool.length < 6) {
        pool.push(b)
        seenIds.add(b.id)
      }
    }
  }

  const similaires = pool.slice(0, 6)
  if (similaires.length === 0) {
    return (
      <div style={{ padding: 20, background: '#fee', border: '1px solid red', borderRadius: 8 }}>
        <p><strong>DEBUG</strong> — pool vide. Erreur requête 1: {err1 ? JSON.stringify(err1) : 'aucune'}</p>
      </div>
    )
  }

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
          const sortedImages = [...(bien.images_biens ?? [])].sort((a: any, b: any) => {
            if (a.is_principale) return -1
            if (b.is_principale) return 1
            return (a.ordre ?? 0) - (b.ordre ?? 0)
          })
          const photo = sortedImages[0]?.url

          return (
            <div key={bien.id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-52 bg-gray-100 overflow-hidden flex-shrink-0">
                <OptimizedImage
                  src={photo}
                  alt={bien.titre}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 z-10">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${
                    bien.transaction === 'vente' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                  }`}>
                    {bien.transaction === 'vente' ? 'Vente' : 'Location'}
                  </span>
                </div>
                {bien.agent_id === agentId && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm bg-amber-400 text-amber-900">
                      Même agent
                    </span>
                  </div>
                )}
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
                    <span className="truncate">{bien.localites.ville}</span>
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
