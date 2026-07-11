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
          <p className="text-gray-500 text-sm mb-8">Derniere mise a jour : 11/07/2026</p>
          <div className="space-y-8 text-gray-600 text-sm leading-relaxed">

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. Objet</h2>
              <p>Les presentes Conditions Generales d Utilisation (« CGU ») ont pour objet de definir les modalites et conditions d utilisation du site benin.immowestafro.com (« le Site »), plateforme de mise en relation entre particuliers, agents immobiliers et personnes recherchant un bien immobilier au Benin.</p>
              <p className="mt-2">Toute utilisation du Site implique l acceptation pleine et entiere des presentes CGU.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. Acces au Site</h2>
              <p>Le Site est accessible gratuitement a tout utilisateur disposant d un acces a Internet. Certaines fonctionnalites (publication d annonces, messagerie, favoris) necessitent la creation d un compte.</p>
              <p className="mt-2">Immo West Afro Benin met tout en oeuvre pour assurer un acces continu au Site, mais ne peut garantir une disponibilite ininterrompue, notamment en cas de maintenance, de panne technique ou de force majeure.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. Inscription et compte utilisateur</h2>
              <p className="font-semibold text-gray-700">Creation de compte</p>
              <p>L inscription est ouverte a toute personne majeure. Deux types de comptes existent : compte client (recherche, contact, favoris) et compte agent/agence (publication et gestion d annonces).</p>
              <p className="mt-2 font-semibold text-gray-700">Exactitude des informations</p>
              <p>L utilisateur s engage a fournir des informations exactes, completes et a jour lors de son inscription, et a les maintenir a jour.</p>
              <p className="mt-2 font-semibold text-gray-700">Confidentialite des identifiants</p>
              <p>L utilisateur est seul responsable de la confidentialite de ses identifiants de connexion. Toute activite effectuee depuis son compte est reputee avoir ete effectuee par lui, sauf preuve contraire.</p>
              <p className="mt-2 font-semibold text-gray-700">Suspension ou suppression de compte</p>
              <p>Immo West Afro Benin se reserve le droit de suspendre ou supprimer tout compte en cas de non-respect des presentes CGU, de fourniture d informations frauduleuses, ou de comportement nuisible envers d autres utilisateurs.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. Publication d annonces</h2>
              <p className="font-semibold text-gray-700">Contenu autorise</p>
              <p>Les agents et proprietaires publiant des annonces s engagent a : ne publier que des biens reellement disponibles ; fournir des informations exactes (prix, localisation, caracteristiques, photos) ; ne pas publier de contenu trompeur, illegal, discriminatoire ou portant atteinte aux droits de tiers ; detenir les droits necessaires sur les photographies publiees.</p>
              <p className="mt-2 font-semibold text-gray-700">Moderation</p>
              <p>Immo West Afro Benin se reserve le droit de retirer, sans preavis, toute annonce ne respectant pas ces conditions, signalee comme frauduleuse ou inappropriee.</p>
              <p className="mt-2 font-semibold text-gray-700">Signalement</p>
              <p>Tout utilisateur peut signaler une annonce qu il estime frauduleuse ou non conforme via la fonctionnalite dediee sur chaque fiche de bien.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. Role de la Plateforme et responsabilite</h2>
              <p className="font-semibold text-gray-700">Plateforme de mise en relation</p>
              <p>Immo West Afro Benin agit exclusivement en tant qu intermediaire technique de mise en relation. La Plateforme n est ni agence immobiliere, ni partie aux transactions conclues entre utilisateurs.</p>
              <p className="mt-2 font-semibold text-gray-700">Absence de verification systematique</p>
              <p>Il appartient a chaque utilisateur de faire preuve de vigilance : visiter physiquement le bien avant tout engagement, verifier les titres de propriete, ne jamais effectuer de paiement avant signature d un contrat en bonne et due forme.</p>
              <p className="mt-2 font-semibold text-gray-700">Limitation de responsabilite</p>
              <p>Immo West Afro Benin ne pourra etre tenu responsable des litiges entre utilisateurs, des prejudices resultant d informations inexactes publiees par des tiers, ni de l indisponibilite temporaire du Site.</p>
            </section>

            <section>
              <h2 id="donnees-personnelles" className="text-lg font-bold text-gray-900 mb-3">6. Donnees personnelles</h2>
              <p>Le traitement des donnees personnelles collectees via le Site est decrit en detail dans notre <a href="/confidentialite" className="text-green-600 font-medium hover:underline">Politique de Confidentialite</a>.</p>
              <p className="mt-2">En resume : les donnees collectees (nom, contact, annonces, messages) sont utilisees exclusivement pour le fonctionnement du service et ne sont jamais vendues a des tiers.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. Propriete intellectuelle</h2>
              <p>Le contenu du Site (structure, design, code, textes editoriaux) est protege par le droit de la propriete intellectuelle. Toute reproduction non autorisee est interdite.</p>
              <p className="mt-2">Les photographies et descriptions d annonces restent la propriete de leurs auteurs respectifs (agents, proprietaires).</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. Droit applicable et litiges</h2>
              <p>Les presentes CGU sont soumises au droit beninois. En cas de litige relatif a l utilisation du Site, une solution amiable sera recherchee en priorite. A defaut d accord amiable, les tribunaux competents du Benin seront seuls competents.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. Modification des CGU</h2>
              <p>Immo West Afro Benin se reserve le droit de modifier les presentes CGU a tout moment. La poursuite de l utilisation du Site apres modification vaut acceptation des nouvelles conditions.</p>
            </section>

            <section>
              <h2 id="contact" className="text-lg font-bold text-gray-900 mb-3">10. Contact</h2>
              <p>Pour toute question relative aux presentes CGU :</p>
              <p className="mt-2">calavi_immo@immowestafro.com<br />+229 01 96 13 77 20<br />Abomey-Calavi, Benin</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
