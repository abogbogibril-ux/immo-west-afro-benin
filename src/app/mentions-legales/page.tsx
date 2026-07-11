import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions Legales — Immo West Afro Benin',
  description: 'Mentions legales de la plateforme Immo West Afro Benin.',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentions Legales</h1>
          <p className="text-gray-500 text-sm mb-8">Derniere mise a jour : 11/07/2026</p>
          <div className="space-y-8 text-gray-600 text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Edition du site</h2>
              <p>Le site <strong>benin.immowestafro.com</strong> (ci-apres « le Site ») est edite par : <strong>Immo West Afro-Benin</strong></p>
              <div className="mt-4 divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                <div className="flex justify-between px-4 py-2.5"><span className="text-gray-500">Numero RCCM</span><span className="font-medium text-gray-800"></span></div>
                <div className="flex justify-between px-4 py-2.5"><span className="text-gray-500">Numero IFU</span><span className="font-medium text-gray-800"></span></div>
                <div className="flex justify-between px-4 py-2.5"><span className="text-gray-500">Siege social</span><span className="font-medium text-gray-800">Abomey-Calavi, Benin</span></div>
                <div className="flex justify-between px-4 py-2.5"><span className="text-gray-500">Email</span><span className="font-medium text-gray-800">calavi_immo@immowestafro.com</span></div>
                <div className="flex justify-between px-4 py-2.5"><span className="text-gray-500">Telephone</span><span className="font-medium text-gray-800">+229 01 96 13 77 20</span></div>
                <div className="flex justify-between px-4 py-2.5"><span className="text-gray-500">Directeur de la publication</span><span className="font-medium text-gray-800">ABOGBO Gibril</span></div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Hebergement du site</h2>
              <p>Hebergeur : Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, Etats-Unis — vercel.com</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Propriete intellectuelle</h2>
              <p>L ensemble des elements constituant le Site (structure, textes, logos, graphismes, icones, mise en page) est la propriete exclusive d Immo West Afro Benin, sauf mention contraire.</p>
              <p className="mt-2">Toute reproduction, representation, modification ou adaptation de tout ou partie des elements du Site est interdite sans autorisation ecrite prealable de l editeur.</p>
              <p className="mt-2">Les photographies et descriptions des biens immobiliers publiees par les agents et proprietaires restent la propriete de leurs auteurs respectifs.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Nature du service</h2>
              <p>Immo West Afro Benin est une plateforme de mise en relation entre des agents immobiliers, promoteurs et particuliers souhaitant publier des annonces, et des internautes a la recherche d un bien immobilier au Benin.</p>
              <p className="mt-2"><strong>Immo West Afro Benin n est ni agence immobiliere, ni intermediaire dans les transactions.</strong> La plateforme ne percoit aucune commission sur les transactions conclues entre utilisateurs et n intervient pas dans la negociation, la signature de contrats, ni le paiement entre les parties.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Limitation de responsabilite</h2>
              <p>Immo West Afro Benin s efforce d assurer l exactitude des informations diffusees sur le Site, sans toutefois garantir l exhaustivite ou l actualite de ces informations, notamment celles publiees par les utilisateurs.</p>
              <p className="mt-2">Il appartient a chaque utilisateur de verifier par lui-meme les informations avant toute decision d achat, de location ou de visite.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. Contact</h2>
              <p>calavi_immo@immowestafro.com<br />+229 01 96 13 77 20<br />Abomey-Calavi, Benin</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
