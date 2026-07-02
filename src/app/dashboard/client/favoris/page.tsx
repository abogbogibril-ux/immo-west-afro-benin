'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import BienCard from '@/components/BienCard'
import { useFavoris } from '@/hooks/useFavoris'

export default function FavorisPage() {
  const { favoris, clearFavoris } = useFavoris()
  const [biens, setBiens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (favoris.length === 0) {
      setBiens([])
      setLoading(false)
      return
    }
    const loadBiens = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('biens')
        .select('*, images_biens(url, ordre)')
        .in('id', favoris)
        .eq('statut', 'publie')
      setBiens(data || [])
      setLoading(false)
    }
    loadBiens()
  }, [favoris])

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#0f172a] min-h-screen">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Mes favoris</h1>
          <p className="text-slate-400 text-sm mt-0.5">{favoris.length} bien{favoris.length > 1 ? 's' : ''} sauvegarde{favoris.length > 1 ? 's' : ''}</p>
        </div>
        {favoris.length > 0 && (
          <button onClick={clearFavoris}
            className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors">
            Tout supprimer
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => (
            <div key={i} className="bg-[#1e293b] rounded-2xl h-72 animate-pulse border border-[#334155]"/>
          ))}
        </div>
      ) : favoris.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-[#1e293b] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <p className="text-white font-semibold mb-1">Aucun favori sauvegarde</p>
          <p className="text-slate-400 text-sm mb-6">Cliquez sur le coeur sur une annonce pour la sauvegarder</p>
          <Link href="/recherche"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00bcd4] text-white font-semibold text-sm rounded-xl hover:bg-[#0097a7] transition-colors">
            Parcourir les annonces
          </Link>
        </div>
      ) : biens.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-sm">Les annonces sauvegardees ne sont plus disponibles.</p>
          <button onClick={clearFavoris} className="mt-3 text-sm text-red-400 hover:underline">
            Vider les favoris
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {biens.map((bien, i) => (
            <BienCard key={bien.id} bien={bien} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  )
}