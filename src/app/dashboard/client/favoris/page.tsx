'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface BienFavori {
  id: string
  titre: string
  prix: number
  ville: string
  type_bien: string
  transaction: string
  surface?: number
  nb_chambres?: number
  statut: string
  images?: { url: string; is_principale: boolean }[]
}

interface Favori {
  id: string
  bien_id: string
  biens: BienFavori
}

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement', maison: 'Maison', terrain: 'Terrain',
  bureau: 'Bureau', villa: 'Villa', studio: 'Studio',
}

const FILTERS = ['Tous', 'À vendre', 'À louer', 'Villa', 'Terrain', 'Appartement']

export default function FavorisPage() {
  const [favoris, setFavoris] = useState<Favori[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Tous')
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('favoris')
        .select(`
          id, bien_id,
          biens (id, titre, prix, ville, type_bien, transaction, surface, nb_chambres, statut,
            images (url, is_principale))
        `)
        .eq('user_id', user.id)
        .order('id', { ascending: false })

      const valid = (data ?? []).filter((f: any) => f.biens)
      setFavoris(valid as unknown as Favori[])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = favoris.filter(f => {
    if (filter === 'Tous') return true
    if (filter === 'À vendre') return f.biens.transaction === 'vente'
    if (filter === 'À louer') return f.biens.transaction === 'location'
    return f.biens.type_bien?.toLowerCase() === filter.toLowerCase()
  })

  const handleRemove = async (favoriId: string, bienId: string) => {
    setRemoving(bienId)
    await supabase.from('favoris').delete().eq('id', favoriId)
    setFavoris(prev => prev.filter(f => f.id !== favoriId))
    setRemoving(null)
  }

  const getPhoto = (bien: BienFavori) => {
    const imgs = bien.images ?? []
    return imgs.find(i => i.is_principale)?.url ?? imgs[0]?.url
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mes favoris</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {favoris.length} bien{favoris.length > 1 ? 's' : ''} sauvegardé{favoris.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/recherche"
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Parcourir
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"/>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"/>
                <div className="h-3 bg-gray-100 rounded w-1/2"/>
                <div className="h-5 bg-gray-200 rounded w-1/3 mt-3"/>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-5xl mb-4">❤️</p>
          <p className="font-semibold text-gray-700 mb-1">
            {filter === 'Tous' ? 'Aucun favori sauvegardé' : `Aucun bien "${filter}" en favori`}
          </p>
          <p className="text-sm text-gray-400 mb-5">
            Parcourez nos annonces et cliquez sur ❤️ pour sauvegarder un bien
          </p>
          <Link href="/recherche"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
            Parcourir les annonces
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filtered.map(favori => {
            const bien = favori.biens
            const photo = getPhoto(bien)
            const isVendu = bien.statut === 'vendu' || bien.statut === 'loué'

            return (
              <div key={favori.id}
                className={`group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all ${
                  isVendu ? 'opacity-60' : 'hover:shadow-md hover:-translate-y-0.5'
                }`}>

                {/* Photo */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {photo ? (
                    <img src={photo} alt={bien.titre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 text-4xl">🏠</div>
                  )}

                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                      bien.transaction === 'vente' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                    }`}>
                      {bien.transaction === 'vente' ? 'Vente' : 'Location'}
                    </span>
                    {isVendu && (
                      <span className="px-2 py-0.5 bg-red-500 text-white rounded-lg text-xs font-bold">
                        {bien.statut === 'vendu' ? 'Vendu' : 'Loué'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemove(favori.id, bien.id)}
                    disabled={removing === bien.id}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                    title="Retirer des favoris">
                    {removing === bien.id ? (
                      <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Infos */}
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-1">{TYPE_LABELS[bien.type_bien] ?? bien.type_bien}</p>
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{bien.titre}</h3>
                  <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                    <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    </svg>
                    {bien.ville}
                  </p>

                  {(bien.surface || bien.nb_chambres) && (
                    <div className="flex gap-3 text-xs text-gray-400 mb-3">
                      {bien.surface && <span>📐 {bien.surface} m²</span>}
                      {bien.nb_chambres && <span>🛏 {bien.nb_chambres} ch.</span>}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-green-600">
                        {new Intl.NumberFormat('fr-FR').format(bien.prix)} FCFA
                      </p>
                      {bien.transaction === 'location' && (
                        <p className="text-[10px] text-gray-400">/mois</p>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      {isVendu ? (
                        <Link href={`/recherche?type=${bien.type_bien}&ville=${bien.ville}`}
                          className="px-2.5 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                          Voir similaires
                        </Link>
                      ) : (
                        <>
                          <Link href={`/bien/${bien.id}`}
                            className="px-2.5 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors">
                            Voir →
                          </Link>
                          <Link href={`/bien/${bien.id}`}
                            className="px-2.5 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:border-green-300 hover:text-green-600 transition-all">
                            Contacter
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}