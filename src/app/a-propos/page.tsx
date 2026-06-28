import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'À propos — Immo West Afro Bénin',
  description: 'Découvrez Immo West Afro, la plateforme immobilière de référence au Bénin. Notre mission, nos valeurs et notre équipe.',
}

export default async function AProposPage() {

  const [{ count: totalBiens }, { count: totalAgents }] = await Promise.all([
    supabase.from('biens').select('id', { count: 'exact', head: true }).eq('statut', 'publié'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'agent'),
  ])

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 to-emerald-800 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-white/20">
            🇧🇯 Fondé au Bénin, pour le Bénin
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            La plateforme immobilière<br/>
            <span className="text-green-200">de référence au Bénin</span>
          </h1>
          <p className="text-green-100 text-base md:text-lg max-w-2xl mx-auto">
            Immo West Afro connecte acheteurs, locataires et agents immobiliers
            dans un espace digital moderne, accessible et sécurisé.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: `${totalBiens ?? 0}+`, label: 'Annonces publiées', icon: '🏠' },
              { value: `${totalAgents ?? 0}+`, label: 'Agents certifiés', icon: '👤' },
              { value: '6+', label: 'Villes couvertes', icon: '🗺️' },
              { value: '2024', label: 'Année de création', icon: '📅' },
            ].map(s => (
              <div key={s.label} className="p-4">
                <p className="text-3xl mb-1">{s.icon}</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600 mb-1">{s.value}</p>
                <p className="text-sm text-gray-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Notre mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Immo West Afro est né d'un constat simple : le marché immobilier béninois manquait
                d'une plateforme digitale moderne, accessible depuis un smartphone, et adaptée
                aux réalités locales — connexions mobiles, FCFA, quartiers et villes du Bénin.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Notre mission est de démocratiser l'accès à l'immobilier au Bénin en mettant
                en relation directe acheteurs, locataires et professionnels de l'immobilier,
                sans intermédiaires inutiles et sans frais cachés.
              </p>
              <div className="space-y-3">
                {[
                  'Annonces vérifiées et mises à jour régulièrement',
                  'Contact direct avec l\'agent via message ou WhatsApp',
                  'Interface optimisée pour les connexions mobiles 3G/4G',
                  'Prix affichés en FCFA, transparents et complets',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white text-3xl font-bold shadow-lg">
                  IWA
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-2">Immo West Afro</h3>
                <p className="text-green-600 font-semibold text-sm mb-4">benin.immowestafro.com</p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  "Votre partenaire de confiance pour tous vos projets immobiliers au Bénin."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="bg-gray-50 py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Nos valeurs</h2>
            <p className="text-gray-500 text-sm">Les principes qui guident chacune de nos actions</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🔒', titre: 'Confiance', desc: 'Chaque annonce est vérifiée. Chaque agent est identifié. Vous achetez et louez en toute sérénité.' },
              { icon: '🌍', titre: 'Accessibilité', desc: 'Une interface pensée pour le mobile, optimisée pour les connexions 3G, disponible partout au Bénin.' },
              { icon: '💡', titre: 'Innovation', desc: 'Chat temps réel, galerie photo HD, visite vidéo, PWA installable — nous utilisons les meilleures technologies.' },
              { icon: '🤝', titre: 'Proximité', desc: 'Une équipe béninoise, disponible par WhatsApp, qui comprend les réalités du marché local.' },
              { icon: '📊', titre: 'Transparence', desc: 'Prix en FCFA, pas de frais cachés, informations complètes sur chaque annonce.' },
              { icon: '⚡', titre: 'Réactivité', desc: 'Annonces publiées en quelques minutes, agents contactables instantanément, support rapide.' },
            ].map(v => (
              <div key={v.titre}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-green-200 hover:shadow-md transition-all">
                <span className="text-3xl mb-3 block">{v.icon}</span>
                <h3 className="font-bold text-gray-900 mb-2">{v.titre}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Comment ça marche ?</h2>
            <p className="text-gray-500 text-sm">Trouver ou publier un bien en 3 étapes simples</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Pour les acheteurs */}
            <div>
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-green-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">A</span>
                Pour les acheteurs / locataires
              </h3>
              <div className="space-y-4">
                {[
                  { n: '1', titre: 'Recherchez', desc: 'Filtrez par ville, type, budget et transaction.' },
                  { n: '2', titre: 'Contactez', desc: 'Envoyez un message ou appelez l\'agent directement.' },
                  { n: '3', titre: 'Visitez', desc: 'Planifiez une visite et finalisez votre projet.' },
                ].map(e => (
                  <div key={e.n} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-100 text-green-700 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {e.n}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{e.titre}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{e.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pour les agents */}
            <div>
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#FF6B35] text-white rounded-lg flex items-center justify-center text-xs font-bold">B</span>
                Pour les agents / propriétaires
              </h3>
              <div className="space-y-4">
                {[
                  { n: '1', titre: 'Créez votre compte', desc: 'Inscription gratuite en quelques minutes.' },
                  { n: '2', titre: 'Publiez vos biens', desc: 'Photos, description, prix, localisation — tout en un.' },
                  { n: '3', titre: 'Gérez vos contacts', desc: 'Recevez les demandes et répondez en temps réel.' },
                ].map(e => (
                  <div key={e.n} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {e.n}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{e.titre}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{e.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-700 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Prêt à commencer ?
          </h2>
          <p className="text-green-100 text-sm mb-8">
            Rejoignez des milliers d'utilisateurs qui font confiance à Immo West Afro pour leurs projets immobiliers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/recherche"
              className="px-8 py-3.5 bg-white text-green-700 font-bold text-sm rounded-xl hover:bg-green-50 transition-colors shadow-lg">
              Chercher un bien
            </Link>
            <Link href="/publier"
              className="px-8 py-3.5 bg-white/20 text-white font-bold text-sm rounded-xl hover:bg-white/30 transition-colors border border-white/30">
              Publier une annonce
            </Link>
            <Link href="/contact"
              className="px-8 py-3.5 bg-white/20 text-white font-bold text-sm rounded-xl hover:bg-white/30 transition-colors border border-white/30">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}