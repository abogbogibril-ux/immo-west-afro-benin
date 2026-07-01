import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: (url: RequestInfo | URL, options?: RequestInit) => fetch(url, { ...options, cache: 'no-store' }) } }
  )
}

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement', maison: 'Maison', terrain: 'Terrain',
  bureau: 'Bureau', villa: 'Villa', studio: 'Studio',
}

const TRANSACTION_LABELS: Record<string, string> = {
  location: 'Location', vente: 'Achat',
}

export default async function BesoinsPage() {
  const supabase = createServerClient()
  const { data: besoins } = await supabase
    .from('besoins')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔍</span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Besoins immobiliers</h1>
          </div>
          <p className="text-gray-500 text-sm md:text-base">
            Des particuliers et professionnels recherchent activement des biens. Vous avez ce qu'il faut ? Contactez-les directement.
          </p>
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
              {besoins?.length || 0} besoin{(besoins?.length || 0) > 1 ? 's' : ''} actif{(besoins?.length || 0) > 1 ? 's' : ''}
            </span>
            <Link href="/deposer"
              className="bg-green-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-green-700 transition-colors">
              + Deposer mon besoin
            </Link>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {!besoins || besoins.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">Aucun besoin depose pour le moment</p>
            <Link href="/deposer" className="mt-4 inline-block text-green-600 font-semibold hover:underline">
              Etre le premier a deposer un besoin
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {besoins.map((b) => (
              <Link key={b.id} href={`/besoins/${b.id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3">

                {/* Badge type + transaction */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                    {TRANSACTION_LABELS[b.transaction] || b.transaction}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                    {TYPE_LABELS[b.type_besoin] || b.type_besoin}
                  </span>
                </div>

                {/* Localisation */}
                <div className="flex items-center gap-1.5 text-gray-600">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  <span className="font-semibold text-sm">{b.ville || 'Ville non precisee'}</span>
                </div>

                {/* Budget */}
                {(b.budget_min || b.budget_max) && (
                  <div className="flex items-center gap-1.5 text-green-600">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span className="font-semibold text-sm">
                      {b.budget_min && b.budget_max
                        ? `${new Intl.NumberFormat('fr-FR').format(b.budget_min)} - ${new Intl.NumberFormat('fr-FR').format(b.budget_max)} FCFA`
                        : b.budget_max
                        ? `Max ${new Intl.NumberFormat('fr-FR').format(b.budget_max)} FCFA`
                        : `Min ${new Intl.NumberFormat('fr-FR').format(b.budget_min)} FCFA`
                      }
                    </span>
                  </div>
                )}

                {/* Details */}
                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                  {b.surface_min && (
                    <span>{b.surface_min} m² min</span>
                  )}
                  {b.nb_chambres && (
                    <span>{b.nb_chambres} chambre{b.nb_chambres > 1 ? 's' : ''}</span>
                  )}
                </div>

                {/* Description courte */}
                {b.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">{b.description}</p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
                  <span className="text-xs text-gray-400">
                    {new Date(b.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    Voir les details
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}