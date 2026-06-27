interface Localite {
  nom?: string
  ville?: string
  departement?: string
}

interface Props {
  adresse?: string
  localite?: Localite
  pointsRepere?: string[] | string
  latitude?: number
  longitude?: number
}

const DEFAULT_REPERES = [
  { icon: '🏫', label: 'Écoles & universités' },
  { icon: '🏥', label: 'Hôpitaux & cliniques' },
  { icon: '🛒', label: 'Marchés & commerces' },
  { icon: '🚌', label: 'Transports en commun' },
]

export default function LocationBlock({ adresse, localite, pointsRepere, latitude, longitude }: Props) {
  let reperes: string[] = []
  if (Array.isArray(pointsRepere)) reperes = pointsRepere
  else if (typeof pointsRepere === 'string' && pointsRepere.trim()) {
    reperes = pointsRepere.split(/[,\n;]+/).map(s => s.trim()).filter(Boolean)
  }

  const hasCoords = latitude && longitude
  const googleMapsSearch = localite?.nom
    ? `https://maps.google.com/?q=${encodeURIComponent([adresse, localite.nom, localite.ville, 'Bénin'].filter(Boolean).join(', '))}`
    : null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5 md:px-7 md:py-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2.5">
        <span className="w-1 h-6 bg-green-500 rounded-full"></span>
        Localisation
      </h2>

      {/* Carte */}
      <div className="rounded-xl overflow-hidden mb-5 border border-gray-100">
        {hasCoords ? (
          <iframe
            title="Localisation du bien"
            width="100%" height="280" style={{ border: 0 }}
            loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
            className="w-full"
          />
        ) : (
          <div className="h-56 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col items-center justify-center text-gray-400 relative overflow-hidden">
            <svg className="w-12 h-12 mb-3 text-green-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-sm font-semibold text-green-500 relative z-10">
              {localite?.nom ? `${localite.nom}, ${localite.ville}` : 'Carte non disponible'}
            </p>
            {googleMapsSearch && (
              <a href={googleMapsSearch} target="_blank" rel="noopener noreferrer"
                className="mt-3 text-xs text-green-600 underline hover:text-green-700 relative z-10">
                Voir sur Google Maps →
              </a>
            )}
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {adresse && (
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1">Adresse</p>
            <p className="text-sm font-semibold text-gray-800">{adresse}</p>
          </div>
        )}
        {localite?.nom && (
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1">Quartier</p>
            <p className="text-sm font-semibold text-gray-800">{localite.nom}</p>
          </div>
        )}
        {localite?.ville && (
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1">Ville</p>
            <p className="text-sm font-semibold text-gray-800">{localite.ville}</p>
          </div>
        )}
        {localite?.departement && (
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1">Département</p>
            <p className="text-sm font-semibold text-gray-800">{localite.departement}</p>
          </div>
        )}
      </div>

      {/* Points de repère */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">📍 À proximité</p>
        {reperes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {reperes.map((r, i) => (
              <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                📍 {r}
              </span>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {DEFAULT_REPERES.map(r => (
              <div key={r.label} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg text-sm text-gray-500">
                <span>{r.icon}</span><span>{r.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {googleMapsSearch && (
        <a href={googleMapsSearch} target="_blank" rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-green-300 hover:text-green-700 transition-all font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Ouvrir dans Google Maps
        </a>
      )}
    </div>
  )
}