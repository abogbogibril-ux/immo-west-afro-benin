import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import HeroSearch from '@/components/HeroSearch'
import BienCard from '@/components/BienCard'
import BesoinCard from '@/components/BesoinCard'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Immo West Afro Benin — Vente et location immobiliere',
  description: 'Trouvez votre bien immobilier au Benin. Appartements, villas, terrains et bureaux a vendre ou a louer a Cotonou, Abomey-Calavi, Porto-Novo et partout au Benin.',
}

function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: (url: RequestInfo | URL, options?: RequestInit) => fetch(url, { ...options, cache: 'no-store' }) } }
  )
}

const supabase = createServerClient()

async function getBesoinsRecents() {
  const client = createServerClient()
  const { data } = await client
    .from('besoins')
    .select('id, type_besoin, transaction, ville, budget_min, budget_max, created_at')
    .order('created_at', { ascending: false })
    .limit(3)
  return data || []
}

const VILLES_POPULAIRES = [
  { nom: 'Cotonou', emoji: '🏙️', description: 'Capitale économique' },
  { nom: 'Abomey-Calavi', emoji: '🌿', description: 'Ville en plein essor' },
  { nom: 'Porto-Novo', emoji: '🏛️', description: 'Capitale politique' },
  { nom: 'Parakou', emoji: '🌄', description: 'Capital du Nord' },
  { nom: 'Bohicon', emoji: '🏘️', description: 'Carrefour du Bénin' },
  { nom: 'Ouidah', emoji: '🌊', description: 'Ville historique' },
]

const TYPES_BIENS = [
  { type: 'villa', label: 'Villas', icon: '🏡', color: 'bg-green-50 text-green-700 border-green-100' },
  { type: 'appartement', label: 'Appartements', icon: '🏢', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { type: 'terrain', label: 'Terrains', icon: '🌍', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { type: 'maison', label: 'Maisons', icon: '🏠', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  { type: 'bureau', label: 'Bureaux', icon: '🏗️', color: 'bg-red-50 text-red-700 border-red-100' },
  { type: 'studio', label: 'Studios', icon: '🛋️', color: 'bg-teal-50 text-teal-700 border-teal-100' },
]

export default async function HomePage() {

  const besoinsRecents = await getBesoinsRecents()

  const { data: bienVedettes } = await supabase
    .from('biens')
    .select(`
      id, titre, prix, transaction, type_bien, surface, nb_chambres, created_at,
      localites (ville, arrondissement, quartier),
      images_biens (url, ordre)
    `)
    .eq('statut', 'publié')
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: biensLocation } = await supabase
    .from('biens')
    .select(`
      id, titre, prix, transaction, type_bien, surface, nb_chambres, created_at,
      localites (ville, arrondissement, quartier),
      images_biens (url, ordre)
    `)
    .eq('statut', 'publié')
    .eq('transaction', 'location')
    .order('created_at', { ascending: false })
    .limit(3)

  const [{ count: totalBiens }, { count: totalAgents }] = await Promise.all([
    supabase.from('biens').select('id', { count: 'exact', head: true }).eq('statut', 'publié'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'agent'),
  ])

  const villesAvecCount = await Promise.all(
    VILLES_POPULAIRES.map(async v => {
      const { count } = await supabase
        .from('biens')
        .select('id', { count: 'exact', head: true })
        .eq('statut', 'publié')
        .ilike('ville', `%${v.nom}%`)
      return { ...v, count: count ?? 0 }
    })
  )

  return (
    <div className="min-h-screen">

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[500px] md:min-h-[600px]">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1920&q=80&auto=format&fit=crop" alt="Immobilier Benin" className="w-full h-full object-cover object-center scale-105" style={{ filter: "brightness(0.85) saturate(1.0)" }} />
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)' }} />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(0,170,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,200,100,0.2) 0%, transparent 50%)' }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-white/20">
              🇧🇯 La référence immobilière au Bénin
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Trouvez votre bien<br/>
              <span className="text-blue-200">immobilier au Bénin</span>
            </h1>
            <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto mb-8">
              Villas, appartements, terrains et bureaux à vendre ou à louer à Cotonou, Porto-Novo, Abomey-Calavi et partout au Bénin.
            </p>
            <HeroSearch />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-10">
            {[
              { value: totalBiens ?? 0, label: 'Annonces actives' },
              { value: totalAgents ?? 0, label: 'Agents certifiés' },
              { value: 6, label: 'Villes couvertes' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{s.value > 0 ? `${s.value}+` : '—'}</p>
                <p className="text-blue-200 text-xs md:text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TYPES DE BIENS */}
      <section className="bg-white py-12 md:py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {TYPES_BIENS.map(t => (
              <Link key={t.type} href={`/recherche?type=${t.type}`}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 ${t.color} hover:scale-105 transition-all duration-200 cursor-pointer`}>
                <span className="text-2xl">{t.icon}</span>
                <span className="text-xs font-semibold text-center leading-tight">{t.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BIENS VEDETTES */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Annonces récentes</h2>
              <p className="text-gray-500 mt-1 text-sm">Les derniers biens disponibles sur la plateforme</p>
            </div>
            <Link href="/recherche" className="hidden sm:flex items-center gap-1.5 text-green-600 font-semibold text-sm hover:text-green-700">
              Voir toutes les annonces
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {bienVedettes && bienVedettes.slice(0, 4).map((bien, i) => (
                <BienCard key={bien.id} bien={bien as any} priority={i < 3} />
              ))}
              {besoinsRecents.slice(0, 2).map((b: any) => (
                <BesoinCard key={b.id} besoin={b} />
              ))}
              {(!bienVedettes || bienVedettes.length === 0) && besoinsRecents.length === 0 && (
                <div className="col-span-3 text-center py-16 text-gray-400">
                  <p className="text-4xl mb-3">🏠</p>
                  <p className="font-medium">Aucune annonce disponible pour le moment</p>
                  <Link href="/publier" className="mt-4 inline-block text-green-600 font-semibold hover:underline">Publier la première annonce →</Link>
                </div>
              )}
            </div>
          <div className="text-center mt-8 sm:hidden">
            <Link href="/recherche" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold text-sm rounded-xl hover:bg-green-700 transition-colors">
              Voir toutes les annonces
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* BIENS A LOUER */}
      {biensLocation && biensLocation.length > 0 && (
        <section className="bg-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">A louer</h2>
                <p className="text-gray-500 mt-1 text-sm">Appartements, villas et studios disponibles a la location</p>
              </div>
              <Link href="/recherche?transaction=location" className="hidden sm:flex items-center gap-1.5 text-green-600 font-semibold text-sm hover:text-green-700">
                Voir tout
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {biensLocation.map(bien => (
                <BienCard key={bien.id} bien={bien as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VILLES POPULAIRES */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Chercher par ville</h2>
            <p className="text-gray-500 text-sm">Trouvez le bien idéal dans votre ville</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {villesAvecCount.map(v => (
              <Link key={v.nom} href={`/recherche?ville=${v.nom}`}
                className="group bg-white rounded-2xl border border-gray-100 p-4 text-center hover:border-green-200 hover:shadow-md transition-all">
                <span className="text-3xl mb-2 block">{v.emoji}</span>
                <p className="font-bold text-gray-900 text-sm group-hover:text-green-600 transition-colors">{v.nom}</p>
                <p className="text-xs text-gray-400 mt-0.5">{v.description}</p>
                <p className="text-xs font-semibold text-green-600 mt-2">
                  {v.count > 0 ? `${v.count} annonce${v.count > 1 ? 's' : ''}` : 'Bientôt'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BESOINS RECENTS */}
      {besoinsRecents.length > 0 && (
        <section className="py-10 md:py-14 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Besoins immobiliers</h2>
                <p className="text-gray-500 text-sm mt-1">Des acheteurs et locataires recherchent activement</p>
              </div>
              <a href="/besoins" className="text-green-600 font-semibold text-sm hover:underline flex items-center gap-1">
                Voir tous
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {besoinsRecents.map((b: any) => (
                <a key={b.id} href={`/besoins/${b.id}`}
                  className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg capitalize">
                      {b.transaction === 'location' ? 'Cherche a louer' : 'Cherche a acheter'}
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg capitalize">{b.type_besoin}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                    <span className="font-semibold text-sm">{b.ville || 'Ville non precisee'}</span>
                  </div>
                  {(b.budget_min || b.budget_max) && (
                    <p className="text-green-600 font-semibold text-sm">
                      {b.budget_min && b.budget_max
                        ? `${new Intl.NumberFormat('fr-FR').format(b.budget_min)} - ${new Intl.NumberFormat('fr-FR').format(b.budget_max)} FCFA`
                        : b.budget_max ? `Max ${new Intl.NumberFormat('fr-FR').format(b.budget_max)} FCFA`
                        : `Min ${new Intl.NumberFormat('fr-FR').format(b.budget_min)} FCFA`
                      }
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
                    <span className="text-xs text-gray-400">{new Date(b.created_at).toLocaleDateString('fr-FR')}</span>
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      Voir details
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </span>
                  </div>
                </a>
              ))}
            </div>
            <div className="text-center mt-8">
              <a href="/deposer" className="inline-flex items-center gap-2 bg-green-600 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-green-700 transition-colors">
                Deposer mon besoin gratuitement
              </a>
            </div>
          </div>
        </section>
      )}

      {/* POURQUOI NOUS */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Pourquoi Immo West Afro ?</h2>
            <p className="text-gray-500 text-sm">La plateforme immobilière pensée pour le Bénin</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🔒', titre: 'Annonces vérifiées', desc: 'Chaque annonce est contrôlée par notre équipe avant publication.' },
              { icon: '💬', titre: 'Contact direct', desc: "Échangez directement avec l'agent via message ou WhatsApp." },
              { icon: '🗺️', titre: 'Couverture nationale', desc: 'Cotonou, Porto-Novo, Calavi et toutes les villes du Bénin.' },
              { icon: '📱', titre: 'Disponible partout', desc: 'Accessible sur mobile, tablette et ordinateur, même en 3G.' },
            ].map(f => (
              <div key={f.titre} className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all">
                <span className="text-4xl mb-4 block">{f.icon}</span>
                <h3 className="font-bold text-gray-900 mb-2">{f.titre}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA PUBLIER */}
      <section className="bg-gradient-to-br from-blue-800 to-green-700 py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Vous avez un bien a vendre ou a louer ?</h2>
          <p className="text-blue-100 text-sm md:text-base mb-8 max-w-xl mx-auto">
            Publiez votre annonce gratuitement et touchez des milliers d'acheteurs et locataires potentiels au Bénin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/publier" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              Publier une annonce
            </Link>
            <Link href="/recherche" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 text-white font-bold text-sm rounded-xl hover:bg-white/30 transition-colors border border-white/30">
              Parcourir les annonces
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}