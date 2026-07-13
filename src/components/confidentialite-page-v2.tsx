import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — Immo West Afro Benin',
  description: 'Politique de confidentialité et protection des données personnelles de la plateforme Immo West Afro Benin.',
}

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de Confidentialité</h1>
          <p className="text-gray-500 text-sm mb-8">Dernière mise à jour : 13/07/2026</p>
          <div className="space-y-8 text-gray-600 text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Introduction</h2>
              <p>Immo West Afro Bénin attache une grande importance à la protection de vos données personnelles. Cette politique explique quelles données nous collectons, pourquoi, comment elles sont utilisées, et quels sont vos droits.</p>
              <p className="mt-2">En utilisant le Site, vous acceptez les pratiques décrites dans cette politique.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Données collectées</h2>
              <p className="font-semibold text-gray-700">Données fournies directement par vous</p>
              <p>Nom, prénom, email, téléphone, ville (inscription) ; nom d'agence, biographie, photo, WhatsApp (agents) ; titre, description, prix, localisation, photos (annonces) ; contenu des messages (messagerie).</p>
              <p className="mt-2 font-semibold text-gray-700">Données collectées automatiquement</p>
              <p>Pages visitées, durée de visite, type d'appareil (Google Analytics 4) ; cookies techniques (thème, session) ; adresse IP (sécurité).</p>
              <p className="mt-2 font-semibold text-gray-700">Notifications push</p>
              <p>Un identifiant technique d'abonnement est collecté si vous activez les notifications, sans donnée personnelle supplémentaire.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Finalités du traitement</h2>
              <p>Vos données sont utilisées pour : la création et gestion de votre compte ; la publication et l'affichage des annonces ; la mise en relation entre utilisateurs ; l'envoi de notifications ; l'amélioration du Site ; la sécurité et la prévention de la fraude.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Partage des données</h2>
              <p>Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec nos prestataires techniques : Supabase (base de données), Vercel (hébergement), Google Analytics (statistiques anonymisées), Resend (emails transactionnels).</p>
              <p className="mt-2">Ces prestataires n'ont accès qu'aux données strictement nécessaires et sont tenus à des obligations de confidentialité.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Durée de conservation</h2>
              <p>Compte actif : les données sont conservées tant que le compte existe.</p>
              <p className="mt-2">Compte supprimé : les données sont supprimées ou anonymisées sous 30 jours, sauf obligation légale contraire.</p>
              <p className="mt-2">Messages : conservés tant que la conversation n'est pas supprimée par les deux parties.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Vos droits</h2>
              <p>Vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition et de portabilité de vos données.</p>
              <p className="mt-2">Pour exercer ces droits, contactez-nous à calavi_immo@immowestafro.com. Nous nous engageons à répondre sous 30 jours maximum.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Cookies</h2>
              <p>Le Site utilise des cookies pour mémoriser vos préférences (thème sombre/clair), maintenir votre session de connexion, et mesurer l'audience via Google Analytics (données anonymisées).</p>
              <p className="mt-2">Vous pouvez désactiver les cookies non essentiels via les paramètres de votre navigateur.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Sécurité</h2>
              <p>Nous mettons en œuvre des mesures techniques appropriées (chiffrement des mots de passe, connexions HTTPS, contrôle d'accès) pour protéger vos données contre tout accès non autorisé, perte ou divulgation.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. Modifications de cette politique</h2>
              <p>Cette politique peut être mise à jour périodiquement. Nous vous encourageons à la consulter régulièrement.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">10. Contact</h2>
              <p>calavi_immo@immowestafro.com<br />+229 01 96 13 77 20<br />Abomey-Calavi, Bénin</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
