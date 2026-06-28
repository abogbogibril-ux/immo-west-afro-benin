'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const VILLES = ['Cotonou', 'Abomey-Calavi', 'Porto-Novo', 'Parakou', 'Bohicon', 'Ouidah']
const TYPES  = ['Maison', 'Appartement', 'Villa', 'Terrain', 'Bureau', 'Studio']

export default function HeroSearch() {
  const router = useRouter()
  const [transaction, setTransaction] = useState<'vente' | 'location'>('vente')
  const [type, setType] = useState('')
  const [ville, setVille] = useState('')
  const [budgetMax, setBudgetMax] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    params.set('transaction', transaction)
    if (type) params.set('type', type.toLowerCase())
    if (ville) params.set('ville', ville)
    if (budgetMax) params.set('prix_max', budgetMax)
    router.push(`/recherche?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-3xl mx-auto">

      {/* Tabs vente / location */}
      <div className="flex gap-1 mb-4 w-fit">
        {(['vente', 'location'] as const).map(t => (
          <button key={t} onClick={() => setTransaction(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              transaction === t
                ? 'bg-white text-green-700 shadow-md'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}>
            {t === 'vente' ? '🏠 Acheter' : '🔑 Louer'}
          </button>
        ))}
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-2xl shadow-xl p-3 flex flex-col sm:flex-row gap-2">

        {/* Type de bien */}
        <select value={type} onChange={e => setType(e.target.value)}
          className="flex-1 px-4 py-3 text-sm text-gray-600 border-0 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400/30 cursor-pointer">
          <option value="">Type de bien</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Ville */}
        <select value={ville} onChange={e => setVille(e.target.value)}
          className="flex-1 px-4 py-3 text-sm text-gray-600 border-0 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400/30 cursor-pointer">
          <option value="">Toutes les villes</option>
          {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        {/* Budget */}
        <input type="number" placeholder="Budget max (FCFA)"
          value={budgetMax} onChange={e => setBudgetMax(e.target.value)}
          className="flex-1 px-4 py-3 text-sm text-gray-600 border-0 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400/30"
        />

        {/* Bouton */}
        <button onClick={handleSearch}
          className="px-6 py-3 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Rechercher
        </button>
      </div>

      {/* Suggestions rapides */}
      <div className="flex flex-wrap gap-2 mt-3">
        {[
          { label: 'Villas Cotonou', q: '?transaction=vente&type=villa&ville=Cotonou' },
          { label: 'Appartements à louer', q: '?transaction=location&type=appartement' },
          { label: 'Terrains Porto-Novo', q: '?transaction=vente&type=terrain&ville=Porto-Novo' },
          { label: 'Studios Calavi', q: '?transaction=location&type=studio&ville=Abomey-Calavi' },
        ].map(s => (
          <button key={s.label}
            onClick={() => router.push(`/recherche${s.q}`)}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-full transition-all border border-white/30 hover:border-white/50">
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}