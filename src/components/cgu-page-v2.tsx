import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CGU — Immo West Afro Benin',
  description: 'Conditions Generales d Utilisation de la plateforme Immo West Afro Benin.',
}

export default function CguPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions Générales d'Utilisation (CGU)</h1>
          <p className="text-gray-500 text-sm mb-8">Dernière mise à jour : 13/07/2026</p>
          <div className="space-y-8 text-gray-600 text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Objet</h2>
              <p>Les présentes Conditions Générales d'Utilisation (« CGU ») ont pour objet de définir les modalités et conditions d'utilisation du site benin.immowestafro.com (« le Site »), plateforme de mise en relation entre particuliers, agents immobiliers et personnes recherchant un bien immobilier au Bénin.</p>
              <p className="mt-2">Toute utilisation du Site implique l'acceptation pleine et entière des présentes CGU.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Accès au Site</h2>
              <p>Le Site est accessible gratuitement à tout utilisateur disposant d'un accès à Internet. Certaines fonctionnalités (publication d'annonces, messagerie, favoris) nécessitent la création d'un compte.</p>
              <p className="mt-2">Immo West Afro Bénin met tout en œuvre pour assurer un accès continu au Site, mais ne peut garantir une disponibilité ininterrompue, notamment en cas de maintenance, de panne technique ou de force majeure.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Inscription et compte utilisateur</h2>
              <p className="font-semibold text-gray-700">Création de compte</p>
              <p>L'inscription est ouverte à toute personne majeure. Deux types de comptes existent : compte client (recherche, contact, favoris) et compte agent/agence (publication et gestion d'annonces).</p>
              <p className="mt-2 font-semibold text-gray-700">Exactitude des informations</p>
              <p>L'utilisateur s'engage à fournir des informations exactes, complètes et à jour lors de son inscription, et à les maintenir à jour.</p>
              <p className="mt-2 font-semibold text-gray-700">Confidentialité des identifiants</p>
              <p>L'utilisateur est seul responsable de la confidentialité de ses identifiants de connexion. Toute activité effectuée depuis son compte est réputée avoir été effectuée par lui, sauf preuve contraire.</p>
              <p className="mt-2 font-semibold text-gray-700">Suspension ou suppression de compte</p>
              <p>Immo West Afro Bénin se réserve le droit de suspendre ou supprimer tout compte en cas de non-respect des présentes CGU, de fourniture d'informations frauduleuses, ou de comportement nuisible envers d'autres utilisateurs.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Publication d'annonces</h2>
              <p className="font-semibold text-gray-700">Contenu autorisé</p>
              <p>Les agents et propriétaires publiant des annonces s'engagent à : ne publier que des biens réellement disponibles ; fournir des informations exactes (prix, localisation, caractéristiques, photos) ; ne pas publier de contenu trompeur, illégal, discriminatoire ou portant atteinte aux droits de tiers ; détenir les droits nécessaires sur les photographies publiées.</p>
              <p className="mt-2 font-semibold text-gray-700">Modération</p>
              <p>Immo West Afro Bénin se réserve le droit de retirer, sans préavis, toute annonce ne respectant pas ces conditions, signalée comme frauduleuse ou inappropriée.</p>
              <p className="mt-2 font-semibold text-gray-700">Signalement</p>
              <p>Tout utilisateur peut signaler une annonce qu'il estime frauduleuse ou non conforme via la fonctionnalité dédiée sur chaque fiche de bien.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Rôle de la Plateforme et responsabilité</h2>
              <p className="font-semibold text-gray-700">Plateforme de mise en relation</p>
              <p>Immo West Afro Bénin agit exclusivement en tant qu'intermédiaire technique de mise en relation. La Plateforme n'est ni agence immobilière, ni partie aux transactions conclues entre utilisateurs.</p>
              <p className="mt-2 font-semibold text-gray-700">Absence de vérification systématique</p>
              <p>Il appartient à chaque utilisateur de faire preuve de vigilance : visiter physiquement le bien avant tout engagement, vérifier les titres de propriété, ne jamais effectuer de paiement avant signature d'un contrat en bonne et due forme.</p>
              <p className="mt-2 font-semibold text-gray-700">Limitation de responsabilité</p>
              <p>Immo West Afro Bénin ne pourra être tenu responsable des litiges entre utilisateurs, des préjudices résultant d'informations inexactes publiées par des tiers, ni de l'indisponibilité temporaire du Site.</p>
            </section>

            <section>
              <h2 id="donnees-personnelles" className="text-lg font-bold text-gray-900 mb-3">6. Données personnelles</h2>
              <p>Le traitement des données personnelles collectées via le Site est décrit en détail dans notre <a href="/confidentialite" className="text-green-600 font-medium hover:underline">Politique de Confidentialité</a>.</p>
              <p className="mt-2">En résumé : les données collectées (nom, contact, annonces, messages) sont utilisées exclusivement pour le fonctionnement du service et ne sont jamais vendues à des tiers.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
