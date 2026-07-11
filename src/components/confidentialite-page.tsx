import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialite — Immo West Afro Benin',
  description: 'Politique de confidentialite et protection des donnees personnelles de la plateforme Immo West Afro Benin.',
}

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de Confidentialite</h1>
          <p className="text-gray-500 text-sm mb-8">Derniere mise a jour : 11/07/2026</p>
          <div className="space-y-8 text-gray-600 text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Introduction</h2>
              <p>Immo West Afro Benin attache une grande importance a la protection de vos donnees personnelles. Cette politique explique quelles donnees nous collectons, pourquoi, comment elles sont utilisees, et quels sont vos droits.</p>
              <p className="mt-2">En utilisant le Site, vous acceptez les pratiques decrites dans cette politique.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Donnees collectees</h2>
              <p className="font-semibold text-gray-700">Donnees fournies directement par vous</p>
              <p>Nom, prenom, email, telephone, ville (inscription) ; nom d agence, biographie, photo, WhatsApp (agents) ; titre, description, prix, localisation, photos (annonces) ; contenu des messages (messagerie).</p>
              <p className="mt-2 font-semibold text-gray-700">Donnees collectees automatiquement</p>
              <p>Pages visitees, duree de visite, type d appareil (Google Analytics 4) ; cookies techniques (theme, session) ; adresse IP (securite).</p>
              <p className="mt-2 font-semibold text-gray-700">Notifications push</p>
              <p>Un identifiant technique d abonnement est collecte si vous activez les notifications, sans donnee personnelle supplementaire.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Finalites du traitement</h2>
              <p>Vos donnees sont utilisees pour : la creation et gestion de votre compte ; la publication et l affichage des annonces ; la mise en relation entre utilisateurs ; l envoi de notifications ; l amelioration du Site ; la securite et la prevention de la fraude.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Partage des donnees</h2>
              <p>Vos donnees ne sont jamais vendues a des tiers. Elles peuvent etre partagees avec nos prestataires techniques : Supabase (base de donnees), Vercel (hebergement), Google Analytics (statistiques anonymisees), Resend (emails transactionnels).</p>
              <p className="mt-2">Ces prestataires n ont acces qu aux donnees strictement necessaires et sont tenus a des obligations de confidentialite.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Duree de conservation</h2>
              <p>Compte actif : donnees conservees tant que le compte existe. Compte supprime : donnees supprimees ou anonymisees sous 30 jours, sauf obligation legale contraire. Messages : conserves tant que la conversation n est pas supprimee par les deux parties.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Vos droits</h2>
              <p>Vous disposez d un droit d acces, de rectification, d effacement, d opposition et de portabilite de vos donnees.</p>
              <p className="mt-2">Pour exercer ces droits, contactez-nous a calavi_immo@immowestafro.com. Nous nous engageons a repondre sous 30 jours maximum.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Cookies</h2>
              <p>Le Site utilise des cookies pour memoriser vos preferences (theme sombre/clair), maintenir votre session de connexion, et mesurer l audience via Google Analytics (donnees anonymisees).</p>
              <p className="mt-2">Vous pouvez desactiver les cookies non essentiels via les parametres de votre navigateur.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Securite</h2>
              <p>Nous mettons en oeuvre des mesures techniques appropriees (chiffrement des mots de passe, connexions HTTPS, controle d acces) pour proteger vos donnees contre tout acces non autorise, perte ou divulgation.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. Modifications de cette politique</h2>
              <p>Cette politique peut etre mise a jour periodiquement. Nous vous encourageons a la consulter regulierement.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">10. Contact</h2>
              <p>calavi_immo@immowestafro.com<br />+229 01 96 13 77 20<br />Abomey-Calavi, Benin</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
