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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions Generales d Utilisation</h1>
          <p className="text-gray-500 text-sm mb-8">Derniere mise a jour : Juin 2026</p>
          <div className="space-y-8 text-gray-600 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Objet</h2>
              <p>Les presentes CGU regissent l utilisation de la plateforme Immo West Afro Benin accessible a benin.immowestafro.com.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Acces</h2>
              <p>La plateforme est accessible gratuitement a tout visiteur. Les professionnels souhaitant publier des annonces doivent creer un compte.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Inscription</h2>
              <p>L inscription est reservee aux professionnels de l immobilier. L utilisateur s engage a fournir des informations exactes.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Publications</h2>
              <p>Les annonces publiees doivent correspondre a des biens reels. Toute annonce frauduleuse sera supprimee.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Responsabilite</h2>
              <p>Immo West Afro agit en intermediaire. La plateforme ne peut etre tenue responsable des transactions entre les parties.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Donnees personnelles</h2>
              <p>Les donnees collectees sont utilisees uniquement pour le fonctionnement de la plateforme et ne sont pas cedees a des tiers.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Droit applicable</h2>
              <p>Les presentes CGU sont soumises au droit beninois. Tout litige sera soumis aux tribunaux de Cotonou.</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Contact</h2>
              <p>Pour toute question : contact@immowestafro.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
