interface Props {
  numero: string
  prix: number
  datePublication: string
  vues?: number
  typeBien?: string
  transaction: string
  nbPieces?: number
  nbChambres?: number
  nbSallesBain?: number
  surface?: number
  surfaceTerrain?: number
  etage?: number
  etat?: string
  cuisine?: string | boolean
  parking?: boolean | number
  jardin?: boolean
  balcon?: boolean
  terrasse?: boolean
  securite?: string | boolean
  meuble?: boolean
  caracteristiques?: Record<string, any>
}

const ETAT_LABELS: Record<string, string> = {
  neuf: 'Neuf', tres_bon: 'Très bon état', bon: 'Bon état',
  a_renover: 'À rénover', a_restaurer: 'À restaurer',
}

interface Row { label: string; value: string }

export default function InfoAnnonceTable({
  numero, prix, datePublication, vues, typeBien, transaction,
  nbPieces, nbChambres, nbSallesBain, surface, surfaceTerrain,
  etage, etat, cuisine, parking, jardin, balcon, terrasse,
  securite, meuble, caracteristiques
}: Props) {

  const prixFormate = `${new Intl.NumberFormat('fr-FR').format(prix)} FCFA${transaction === 'location' ? '/mois' : ''}`

  const rows: Row[] = [
    { label: 'Numéro', value: numero },
    { label: 'Prix', value: prixFormate },
    { label: 'Date', value: datePublication },
    { label: 'Vues', value: String(vues ?? 0) },
    typeBien ? { label: 'Type de bien', value: typeBien } : null,
    { label: 'Transaction', value: transaction === 'vente' ? 'Vente' : 'Location' },
    nbPieces ? { label: 'Pièces', value: `${nbPieces} pièce${nbPieces > 1 ? 's' : ''}` } : null,
    nbChambres ? { label: 'Chambres', value: `${nbChambres} chambre${nbChambres > 1 ? 's' : ''}` } : null,
    nbSallesBain ? { label: 'Salles de bain', value: String(nbSallesBain) } : null,
    surface ? { label: 'Surface habitable', value: `${surface} m²` } : null,
    surfaceTerrain ? { label: 'Surface terrain', value: `${surfaceTerrain} m²` } : null,
    etage != null ? { label: 'Étage', value: etage === 0 ? 'Rez-de-chaussée' : `${etage}ᵉ étage` } : null,
    etat ? { label: 'État du bien', value: ETAT_LABELS[etat] ?? etat } : null,
  ].filter(Boolean) as Row[]

  // ── Construction des chips "Spécifications" ──
  const chips: string[] = []

  if (cuisine != null) chips.push(typeof cuisine === 'string' ? cuisine : cuisine ? 'Cuisine équipée' : '')
  if (parking != null) chips.push(typeof parking === 'number' ? `Parking (${parking})` : parking ? 'Parking' : '')
  if (jardin) chips.push('Jardin')
  if (balcon) chips.push('Balcon')
  if (terrasse) chips.push('Terrasse')
  if (securite != null) chips.push(typeof securite === 'string' ? securite : securite ? 'Sécurité' : '')
  if (meuble) chips.push('Meublé')

  if (caracteristiques) {
    Object.entries(caracteristiques).forEach(([k, v]) => {
      if (!v) return
      const label = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      if (typeof v === 'boolean') {
        chips.push(label)
      } else {
        chips.push(`${label} : ${v}`)
      }
    })
  }

  const finalChips = chips.filter(Boolean)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <h2 className="text-base font-bold text-gray-900 px-5 py-4 flex items-center gap-2.5 border-b border-gray-100">
        <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Informations de l'annonce
      </h2>

      <div className="divide-y divide-gray-50">
        {rows.map((row, i) => (
          <div key={`${row.label}-${i}`}
            className="flex items-center gap-4 px-5 py-3 text-sm">
            <span className="text-gray-500 w-40 flex-shrink-0">{row.label}</span>
            <span className="font-medium text-gray-800 text-left">{row.value}</span>
          </div>
        ))}

        {finalChips.length > 0 && (
          <div className="flex items-start justify-between px-5 py-3 text-sm gap-4">
            <span className="text-gray-500 w-40 flex-shrink-0 pt-1">Spécifications</span>
            <div className="flex flex-wrap justify-start gap-1.5 flex-1">
              {finalChips.map((chip, i) => (
                <span key={i}
                  className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full whitespace-nowrap">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
