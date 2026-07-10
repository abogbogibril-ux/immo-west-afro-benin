'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const VILLES = ['Cotonou', 'Abomey-Calavi', 'Porto-Novo', 'Parakou', 'Bohicon', 'Ouidah']
const TYPES  = ['Maison', 'Appartement', 'Villa', 'Terrain', 'Bureau', 'Studio']

export default function HeroSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [transaction, setTransaction] = useState<'vente' | 'location'>('vente')
  const [type, setType] = useState('')
  const [ville, setVille] = useState('')
  const [budgetMax, setBudgetMax] = useState('')

  // Bloque le scroll du body quand le panneau est ouvert (mobile)
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  // Fermer avec Échap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    params.set('transaction', transaction)
    if (type) params.set('type', type.toLowerCase())
    if (ville) params.set('ville', ville)
    if (budgetMax) params.set('prix_max', budgetMax)
    setOpen(false)
    router.push(`/recherche?${params.toString()}`)
  }

  const suggestions = [
    { label: 'Villas Cotonou', q: '?transaction=vente&type=villa&ville=Cotonou' },
    { label: 'Appartements à louer', q: '?transaction=location&type=appartement' },
    { label: 'Terrains Porto-Novo', q: '?transaction=vente&type=terrain&ville=Porto-Novo' },
    { label: 'Studios Calavi', q: '?transaction=location&type=studio&ville=Abomey-Calavi' },
  ]

  return (
    <>
      {/* ── Onglet vertical fixe (bord gauche) ── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Ouvrir la recherche"
        className={`
          fixed left-0 top-1/2 -translate-y-1/2 z-40
          bg-green-600 hover:bg-green-700 text-white
          rounded-r-2xl shadow-lg
          flex flex-col items-center gap-2
          py-5 px-2.5
          transition-all duration-300
          ${open ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}
        `}
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <span
          className="text-xs font-bold tracking-wide"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Rechercher
        </span>
      </button>

      {/* ── Overlay (mobile + desktop) ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Panneau coulissant latéral gauche ── */}
      <div
        className={`
          fixed top-0 left-0 h-full z-50
          w-[85vw] max-w-[360px]
          bg-white shadow-2xl
          transform transition-transform duration-300 ease-out
          overflow-y-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* En-tête panneau */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-gray-900 text-base">Rechercher un bien</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Tabs vente / location */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(['vente', 'location'] as const).map(t => (
              <button key={t} onClick={() => setTransaction(t)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all min-h-[44px] ${
                  transaction === t
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t === 'vente' ? '🏠 Acheter' : '🔑 Louer'}
              </button>
            ))}
          </div>

          {/* Type de bien */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Type de bien
            </label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full px-4 py-3 text-sm text-gray-700 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400/30 cursor-pointer min-h-[44px]">
              <option value="">Tous les types</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Ville */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Ville
            </label>
            <select value={ville} onChange={e => setVille(e.target.value)}
              className="w-full px-4 py-3 text-sm text-gray-700 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400/30 cursor-pointer min-h-[44px]">
              <option value="">Toutes les villes</option>
              {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Budget max (FCFA)
            </label>
            <input type="number" placeholder="Ex : 500 000"
              value={budgetMax} onChange={e => setBudgetMax(e.target.value)}
              className="w-full px-4 py-3 text-sm text-gray-700 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400/30 min-h-[44px]"
            />
          </div>

          {/* Bouton recherche */}
          <button onClick={handleSearch}
            className="w-full px-6 py-3.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 min-h-[44px]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Rechercher
          </button>

          {/* Suggestions rapides */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Recherches populaires
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button key={s.label}
                  onClick={() => { setOpen(false); router.push(`/recherche${s.q}`) }}
                  className="px-3 py-2 bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-700 text-xs font-medium rounded-full transition-all border border-gray-200 hover:border-green-200 min-h-[36px]">
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
