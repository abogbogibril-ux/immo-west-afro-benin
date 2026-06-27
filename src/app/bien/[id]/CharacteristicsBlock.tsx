interface Props {
  typeBien?: string
  surface?: number
  surfaceTerrain?: number
  nbPieces?: number
  nbChambres?: number
  nbSallesBain?: number
  cuisine?: string | boolean
  parking?: boolean | number
  jardin?: boolean
  balcon?: boolean
  terrasse?: boolean
  securite?: string | boolean
  etat?: string
  meuble?: boolean
  etage?: number
  caracteristiques?: Record<string, any>
}

const ETAT_LABELS: Record<string, string> = {
  neuf: 'Neuf', tres_bon: 'Très bon état', bon: 'Bon état',
  a_renover: 'À rénover', a_restaurer: 'À restaurer',
}

interface Row { label: string; value: string | null; icon: string }

export default function CharacteristicsBlock({
  typeBien, surface, surfaceTerrain, nbPieces, nbChambres,
  nbSallesBain, cuisine, parking, jardin, balcon, terrasse,
  securite, etat, meuble, etage, caracteristiques
}: Props) {

  const rows: Row[] = [
    typeBien         ? { label: 'Type de bien',      value: typeBien,                                                    icon: '🏡' } : null,
    surface          ? { label: 'Surface habitable', value: `${surface} m²`,                                             icon: '📐' } : null,
    surfaceTerrain   ? { label: 'Surface terrain',   value: `${surfaceTerrain} m²`,                                      icon: '🌿' } : null,
    nbPieces         ? { label: 'Nombre de pièces',  value: `${nbPieces} pièce${nbPieces > 1 ? 's' : ''}`,              icon: '🏠' } : null,
    nbChambres       ? { label: 'Chambres',          value: `${nbChambres} chambre${nbChambres > 1 ? 's' : ''}`,        icon: '🛏' } : null,
    nbSallesBain     ? { label: 'Salles de bain',    value: `${nbSallesBain}`,                                           icon: '🚿' } : null,
    cuisine != null  ? { label: 'Cuisine',           value: typeof cuisine === 'string' ? cuisine : cuisine ? 'Équipée' : 'Non équipée', icon: '🍳' } : null,
    parking != null  ? { label: 'Parking',           value: typeof parking === 'number' ? `${parking} place${parking > 1 ? 's' : ''}` : parking ? 'Oui' : 'Non', icon: '🚗' } : null,
    etage != null    ? { label: 'Étage',             value: etage === 0 ? 'Rez-de-chaussée' : `${etage}ᵉ étage`,       icon: '🏢' } : null,
    jardin != null   ? { label: 'Jardin',            value: jardin ? 'Oui' : 'Non',                                     icon: '🌳' } : null,
    balcon != null   ? { label: 'Balcon',            value: balcon ? 'Oui' : 'Non',                                     icon: '🌅' } : null,
    terrasse != null ? { label: 'Terrasse',          value: terrasse ? 'Oui' : 'Non',                                   icon: '☀️' } : null,
    securite != null ? { label: 'Sécurité',          value: typeof securite === 'string' ? securite : securite ? 'Oui' : 'Non', icon: '🔒' } : null,
    meuble != null   ? { label: 'Meublé',            value: meuble ? 'Oui' : 'Non',                                     icon: '🛋' } : null,
    etat             ? { label: 'État du bien',      value: ETAT_LABELS[etat] ?? etat,                                  icon: '✅' } : null,
  ].filter(Boolean) as Row[]

  if (caracteristiques) {
    Object.entries(caracteristiques).forEach(([k, v]) => {
      rows.push({ label: k.replace(/_/g, ' '), value: String(v), icon: '•' })
    })
  }

  if (rows.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5 md:px-7 md:py-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2.5">
        <span className="w-1 h-6 bg-green-500 rounded-full"></span>
        Caractéristiques
      </h2>
      <div className="divide-y divide-gray-50">
        {rows.map((row, i) => (
          <div key={`${row.label}-${i}`}
            className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors">
            <span className="flex items-center gap-2.5 text-sm text-gray-500">
              <span className="text-base w-5 text-center flex-shrink-0">{row.icon}</span>
              {row.label}
            </span>
            <span className="text-sm font-semibold text-gray-800 text-right capitalize">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}