interface Props {
  surface?: number
  nbChambres?: number
  nbSallesBain?: number
  parking?: boolean | number
  terrain?: number
  etage?: number
  typeBien?: string
  nbPieces?: number
}

interface Stat {
  icon: string
  label: string
  value: string
}

export default function QuickStats({
  surface, nbChambres, nbSallesBain, parking, terrain, etage, typeBien, nbPieces
}: Props) {
  const stats: Stat[] = []

  if (surface)      stats.push({ icon: '📐', label: 'Surface',       value: `${surface} m²` })
  if (nbPieces)     stats.push({ icon: '🏠', label: 'Pièces',        value: `${nbPieces}` })
  if (nbChambres)   stats.push({ icon: '🛏', label: 'Chambres',      value: `${nbChambres}` })
  if (nbSallesBain) stats.push({ icon: '🚿', label: 'Salle de bain', value: `${nbSallesBain}` })
  if (terrain)      stats.push({ icon: '🌿', label: 'Terrain',       value: `${terrain} m²` })
  if (etage !== undefined && etage !== null)
    stats.push({ icon: '🏢', label: 'Étage', value: etage === 0 ? 'RDC' : `${etage}ᵉ` })
  if (parking !== undefined && parking !== null)
    stats.push({ icon: '🚗', label: 'Parking', value: typeof parking === 'number' ? `${parking} place${parking > 1 ? 's' : ''}` : parking ? 'Oui' : 'Non' })
  if (typeBien)     stats.push({ icon: '🏡', label: 'Type',          value: typeBien })

  if (stats.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5 md:px-7 md:py-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2.5">
        <span className="w-1 h-6 bg-green-500 rounded-full"></span>
        En un coup d'œil
      </h2>
      <div className={`grid gap-3 ${
        stats.length <= 3 ? 'grid-cols-3' :
        stats.length === 4 ? 'grid-cols-2 sm:grid-cols-4' :
        stats.length <= 6 ? 'grid-cols-2 sm:grid-cols-3' :
        'grid-cols-2 sm:grid-cols-4'
      }`}>
        {stats.map(stat => (
          <div key={stat.label}
            className="flex flex-col items-center justify-center text-center py-4 px-3 bg-gray-50 hover:bg-green-50 rounded-xl transition-colors group border border-transparent hover:border-green-100">
            <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform inline-block">
              {stat.icon}
            </span>
            <span className="text-base md:text-lg font-bold text-gray-900">{stat.value}</span>
            <span className="text-[11px] text-gray-400 mt-0.5 font-medium uppercase tracking-wide">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}