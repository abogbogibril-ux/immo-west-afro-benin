import Link from 'next/link'

interface Props {
  annonceurNom?: string
}

export default function BienDisclaimer({ annonceurNom }: Props) {
  return (
    <div className="mt-6 border-t border-gray-100 pt-5">
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Cette page est une publicité.</span>{' '}
            Tout contenu, service ou produit affiché est la propriété de{' '}
            {annonceurNom ? (
              <span className="font-medium">{annonceurNom}</span>
            ) : (
              "l'annonceur"
            )}.{' '}
            <span className="font-semibold">Immo West Afro</span> est une plateforme de mise en
            relation et n'intervient pas dans les transactions entre particuliers ou professionnels.
            Nous ne vérifions pas l'exactitude des informations publiées et déclinons toute
            responsabilité en cas de litige. Veuillez rester vigilant et ne jamais effectuer de
            paiement avant d'avoir visité le bien et signé un contrat.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5">
            <Link href="/cgu"
              className="text-xs text-amber-700 font-semibold hover:underline flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Conditions Générales d'Utilisation
            </Link>
            <Link href="/signaler"
              className="text-xs text-amber-600 hover:underline flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Signaler cette annonce
            </Link>
            <Link href="/contact"
              className="text-xs text-amber-600 hover:underline flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Aide & Support
            </Link>
          </div>
        </div>
      </div>
      <p className="text-center text-[11px] text-gray-400 mt-3">
        © {new Date().getFullYear()} Immo West Afro — Tous droits réservés ·{' '}
        <Link href="/cgu" className="hover:underline">CGU</Link>
        {' · '}
        <Link href="/confidentialite" className="hover:underline">Confidentialité</Link>
      </p>
    </div>
  )
}