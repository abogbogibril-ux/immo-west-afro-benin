'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BienCard from '@/components/BienCard'
import BesoinCard from '@/components/BesoinCard'
import Link from 'next/link'

const TYPES   = ['Maison', 'Appartement', 'Villa', 'Terrain', 'Bureau', 'Studio']
const VILLES  = ['Cotonou', 'Abomey-Calavi', 'Porto-Novo', 'Parakou', 'Bohicon', 'Ouidah']
const TRIS    = [
  { val: 'recent',     label: 'Plus récent' },
  { val: 'prix_asc',   label: 'Prix croissant' },
  { val: 'prix_desc',  label: 'Prix décroissant' },
  { val: 'vues',       label: 'Plus vus' },
]
const PAGE_SIZE = 12

export default function RecherchePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [transaction, setTransaction] = useState(searchParams.get('transaction') ?? 'tous')
  const [type,        setType]        = useState(searchParams.get('type') ?? '')
  const [ville,       setVille]       = useState(searchParams.get('ville') ?? '')
  const [prixMin,     setPrixMin]     = useState(searchParams.get('prix_min') ?? '')
  const [prixMax,     setPrixMax]     = useState(searchParams.get('prix_max') ?? '')
  const [tri,         setTri]         = useState('recent')
  const [besoins,     setBesoins]     = useState<any[]>([])
  const [drawerOpen,  setDrawerOpen]  = useState(false)

  const [biens,      setBiens]      = useState<any[]>([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [loadingMore,setLoadingMore]= useState(false)
  const [hasMore,    setHasMore]    = useState(true)

  const sentinelRef = useRef<HTMLDivElement>(null)
  const isFirstLoad = useRef(true)

  useEffect(() => {
    supabase.from('besoins')
      .select('id, type_besoin, transaction, ville, budget_min, budget_max, surface_min, nb_chambres, created_at')
      .order('created_at', { ascending: false }).limit(4)
      .then(({ data }) => setBesoins(data || []))
  }, [])

  const fetchBiens = useCallback(async (pageNum: number, reset: boolean) => {
    if (reset) setLoading(true)
    else setLoadingMore(true)

    let query = supabase
      .from('biens')
      .select(`
        id, titre, prix, transaction, type_bien, surface, nb_chambres, created_at, vues,
        localites (ville, arrondissement, quartier),
        images_biens (url, ordre)
      `, { count: 'exact' })
      .eq('statut', 'publié')

    if (transaction !== 'tous') query = query.eq('transaction', transaction)
    if (type)    query = query.ilike('type_bien', `%${type}%`)
    if (ville)   query = query.ilike('ville', `%${ville}%`)
    if (prixMin) query = query.gte('prix', parseInt(prixMin))
    if (prixMax) query = query.lte('prix', parseInt(prixMax))

    if (tri === 'recent')    query = query.order('created_at', { ascending: false })
    if (tri === 'prix_asc')  query = query.order('prix', { ascending: true })
    if (tri === 'prix_desc') query = query.order('prix', { ascending: false })
    if (tri === 'vues')      query = query.order('vues', { ascending: false })

    query = query.range((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE - 1)

    const { data, count } = await query

    if (reset) {
      setBiens(data ?? [])
    } else {
      setBiens(prev => [...prev, ...(data ?? [])])
    }
    setTotal(count ?? 0)
    setHasMore((data ?? []).length === PAGE_SIZE)
    setLoading(false)
    setLoadingMore(false)
  }, [transaction, type, ville, prixMin, prixMax, tri])

  // Chargement initial et reset quand filtres changent
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      fetchBiens(1, true)
      return
    }
    setPage(1)
    setHasMore(true)
    fetchBiens(1, true)

    const p = new URLSearchParams()
    if (transaction !== 'tous') p.set('transaction', transaction)
    if (type)    p.set('type', type)
    if (ville)   p.set('ville', ville)
    if (prixMin) p.set('prix_min', prixMin)
    if (prixMax) p.set('prix_max', prixMax)
    router.replace(`/recherche?${p.toString()}`, { scroll: false })
  }, [transaction, type, ville, prixMin, prixMax, tri])

  // Charger page suivante quand sentinel visible
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
        const nextPage = page + 1
        setPage(nextPage)
        fetchBiens(nextPage, false)
      }
    }, { threshold: 0.1 })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, loadingMore, page, fetchBiens])

  const hasFilters = transaction !== 'tous' || type || ville || prixMin || prixMax

  const resetFilters = () => {
    setTransaction('tous')
    setType('')
    setVille('')
    setPrixMin('')
    setPrixMax('')
  }

  const FiltersPanel = () => (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Type de transaction</p>
        <div className="flex gap-2">
          {[['tous', 'Tous'], ['vente', 'Vente'], ['location', 'Location']].map(([val, label]) => (
            <button key={val} onClick={() => setTransaction(val)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                transaction === val ? 'bg-green-600 border-green-600 text-white' : 'border-gray-200 text-gray-500 hover:border-green-300'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Type de bien</p>
        <div className="grid grid-cols-2 gap-1.5">
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(type === t.toLowerCase() ? '' : t.toLowerCase())}
              className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                type === t.toLowerCase() ? 'bg-green-600 border-green-600 text-white' : 'border-gray-200 text-gray-500 hover:border-green-300'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Ville</p>
        <select value={ville} onChange={e => setVille(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50">
          <option value="">Toutes les villes</option>
          {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Budget (FCFA)</p>
        <div className="flex flex-col gap-2">
          <input type="number" placeholder="Min" value={prixMin}
            onChange={e => setPrixMin(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"/>
          <input type="number" placeholder="Max" value={prixMax}
            onChange={e => setPrixMax(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"/>
        </div>
      </div>
      {hasFilters && (
        <button onClick={resetFilters}
          className="w-full py-2.5 border border-red-200 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors">
          Réinitialiser les filtres
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setDrawerOpen(false)}/>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 p-5 max-h-[85vh] overflow-y-auto lg:hidden"
            onTouchStart={(e) => { (e.currentTarget as any)._touchY = e.touches[0].clientY }}
            onTouchEnd={(e) => {
              const start = (e.currentTarget as any)._touchY
              const end = e.changedTouches[0].clientY
              if (end - start > 80) setDrawerOpen(false)
            }}>
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full"/>
            </div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Filtres</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <FiltersPanel />
            <button onClick={() => setDrawerOpen(false)}
              className="w-full mt-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors">
              Voir {total} résultat{total > 1 ? 's' : ''}
            </button>
          </div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900">Filtres</h2>
                {hasFilters && (
                  <button onClick={resetFilters} className="text-xs text-red-500 hover:underline font-medium">
                    Réinitialiser
                  </button>
                )}
              </div>
              <FiltersPanel />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {loading ? '...' : `${total} bien${total > 1 ? 's' : ''} trouvé${total > 1 ? 's' : ''}`}
                </h1>
                {hasFilters && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {transaction !== 'tous' && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">{transaction}</span>}
                    {type && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">{type}</span>}
                    {ville && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{ville}</span>}
                    {(prixMin || prixMax) && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        {prixMin ? `${new Intl.NumberFormat('fr-FR').format(parseInt(prixMin))}` : '0'}
                        {' — '}
                        {prixMax ? `${new Intl.NumberFormat('fr-FR').format(parseInt(prixMax))} FCFA` : '∞'}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <select value={tri} onChange={e => setTri(e.target.value)}
                  className="hidden sm:block px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none bg-white">
                  {TRIS.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
                </select>
                <button onClick={() => setDrawerOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white hover:border-green-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
                  </svg>
                  Filtres
                  {hasFilters && <span className="w-2 h-2 bg-green-500 rounded-full"/>}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-52 bg-gray-200"/>
                    <div className="p-4 space-y-2.5">
                      <div className="h-5 bg-gray-200 rounded w-1/3"/>
                      <div className="h-4 bg-gray-100 rounded w-3/4"/>
                      <div className="h-3 bg-gray-100 rounded w-1/2"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : biens.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <p className="text-5xl mb-4">🔍</p>
                <p className="font-bold text-gray-700 text-lg mb-2">Aucun résultat</p>
                <p className="text-gray-400 text-sm mb-6">Aucun bien ne correspond à vos critères. Essayez d'élargir votre recherche.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={resetFilters} className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
                    Voir toutes les annonces
                  </button>
                  <Link href="/publier" className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:border-green-300 hover:text-green-600 transition-all">
                    Publier une annonce
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {biens.map((bien, i) => (
                    <BienCard key={bien.id} bien={bien} priority={i < 3} />
                  ))}
                  {besoins.map((b: any) => (
                    <BesoinCard key={b.id} besoin={b} />
                  ))}
                </div>

                {/* Sentinelle infinite scroll */}
                <div ref={sentinelRef} className="h-10 mt-4"/>

                {/* Indicateur chargement */}
                {loadingMore && (
                  <div className="flex justify-center items-center gap-3 py-6 text-gray-400 text-sm">
                    <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"/>
                    Chargement...
                  </div>
                )}

                {/* Fin des résultats */}
                {!hasMore && biens.length > 0 && (
                  <p className="text-center text-xs text-gray-400 mt-4">
                    {total} résultat{total > 1 ? 's' : ''} — tout affiché
                  </p>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}