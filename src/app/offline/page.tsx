'use client'

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-gray-50 dark:bg-[#0d1117]">
      <p className="text-5xl mb-6">📡</p>
      <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
        Vous êtes hors ligne
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
        Vérifiez votre connexion internet pour accéder aux annonces immobilières du Bénin.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
      >
        Réessayer
      </button>
    </div>
  )
}
