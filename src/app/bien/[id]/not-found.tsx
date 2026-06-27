import Link from 'next/link'

export default function BienNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Annonce introuvable</h1>
        <p className="text-gray-500 mb-8">
          Cette annonce n'existe pas ou a été supprimée par son propriétaire.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/recherche"
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
            Voir toutes les annonces
          </Link>
          <Link href="/"
            className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}