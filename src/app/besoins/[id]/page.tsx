import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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

export default async function BesoinDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const { data: besoin } = await supabase
    .from('besoins')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!besoin) notFound()

  const whatsappUrl = besoin.telephone
    ? `https://wa.me/${besoin.telephone.replace(/\D/g, '')}?text=Bonjour, j'ai vu votre besoin immobilier sur Immo West Afro Benin et je pense pouvoir vous aider.`
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <Link href="/besoins" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Tous les besoins
          </Link>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="bg-blue-50 text-blue-700 text-sm font-bold px-3 py-1 rounded-lg">
              {besoin.transaction === 'location' ? 'Cherche a louer' : 'Cherche a acheter'}
            </span>
            <span className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-lg">
              {TYPE_LABELS[besoin.type_besoin] || besoin.type_besoin}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {TYPE_LABELS[besoin.type_besoin] || besoin.type_besoin} a {besoin.transaction === 'location' ? 'louer' : 'acheter'} a {besoin.ville || 'localite non precisee'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Depose le {new Date(besoin.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Criteres */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Criteres recherches</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Ville</p>
              <p className="font-semibold text-gray-900 text-sm">{besoin.ville || '-'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Type</p>
              <p className="font-semibold text-gray-900 text-sm">{TYPE_LABELS[besoin.type_besoin] || besoin.type_besoin}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Transaction</p>
              <p className="font-semibold text-gray-900 text-sm capitalize">{besoin.transaction}</p>
            </div>
            {besoin.budget_min && (
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-green-600 mb-1">Budget min</p>
                <p className="font-semibold text-green-700 text-sm">{new Intl.NumberFormat('fr-FR').format(besoin.budget_min)} FCFA</p>
              </div>
            )}
            {besoin.budget_max && (
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-green-600 mb-1">Budget max</p>
                <p className="font-semibold text-green-700 text-sm">{new Intl.NumberFormat('fr-FR').format(besoin.budget_max)} FCFA</p>
              </div>
            )}
            {besoin.surface_min && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Surface min</p>
                <p className="font-semibold text-gray-900 text-sm">{besoin.surface_min} m²</p>
              </div>
            )}
            {besoin.nb_chambres && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Chambres</p>
                <p className="font-semibold text-gray-900 text-sm">{besoin.nb_chambres} chambre{besoin.nb_chambres > 1 ? 's' : ''}</p>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {besoin.description && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{besoin.description}</p>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Contacter le demandeur</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-700 font-bold text-lg">{(besoin.nom || 'A')[0].toUpperCase()}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{besoin.nom || 'Anonyme'}</p>
              <p className="text-xs text-gray-400">Demandeur</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-bold text-sm py-3 rounded-xl hover:bg-green-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contacter sur WhatsApp
              </a>
            )}
            {besoin.telephone && (
              <a href={`tel:${besoin.telephone}`}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-bold text-sm py-3 rounded-xl hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z"/>
                </svg>
                Appeler
              </a>
            )}
          </div>
        </div>

        {/* CTA deposer */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
          <p className="text-green-800 font-semibold mb-1">Vous aussi, deposez votre besoin</p>
          <p className="text-green-600 text-sm mb-4">Des agents et proprietaires vous contacteront directement</p>
          <Link href="/deposer"
            className="inline-flex items-center gap-2 bg-green-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-green-700 transition-colors">
            Deposer mon besoin gratuitement
          </Link>
        </div>

      </div>
    </div>
  )
}