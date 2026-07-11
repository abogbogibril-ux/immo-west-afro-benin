'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ReportButton from './ReportButton'

interface Photo {
  id: string
  url: string
  ordre?: number
  is_principale?: boolean
}
interface Props {
  images: Photo[]
  titre: string
  bienId?: string
  userId?: string
  isFavorited?: boolean
}

const SWIPE_THRESHOLD = 50

export default function PropertyGallery({ images, titre, bienId, userId, isFavorited = false }: Props) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [lbIndex, setLbIndex] = useState(0)
  const [broken, setBroken] = useState<Record<string, boolean>>({})
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const dragRef = useRef(false)
  const router = useRouter()

  // ── Favori ──
  const [favorited, setFavorited] = useState(isFavorited)
  const [favLoading, setFavLoading] = useState(false)

  // ── Partager (feedback visuel) ──
  const [shareCopied, setShareCopied] = useState(false)

  const go = useCallback((n: number) => {
    setCurrent((n + images.length) % images.length)
    setDragOffset(0)
    dragRef.current = false
  }, [images.length])

  const openLb = (i: number) => { setLbIndex(i); setLightbox(true) }
  const closeLb = useCallback(() => setLightbox(false), [])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLb()
      if (e.key === 'ArrowLeft') setLbIndex(i => (i - 1 + images.length) % images.length)
      if (e.key === 'ArrowRight') setLbIndex(i => (i + 1) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, images.length, closeLb])

  useEffect(() => {
    if (lightbox) {
      document.documentElement.style.overflow = 'hidden'
      return () => { document.documentElement.style.overflow = '' }
    }
  }, [lightbox])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    dragRef.current = false
    setIsDragging(false)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      e.preventDefault()
      dragRef.current = true
      setIsDragging(true)
      setDragOffset(dx)
    }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dragRef.current) {
      if (dx < -SWIPE_THRESHOLD) go(current + 1)
      else if (dx > SWIPE_THRESHOLD) go(current - 1)
      else setDragOffset(0)
    }
    setIsDragging(false)
    setDragOffset(0)
    dragRef.current = false
  }

  // ── Toggle favori ──
  const toggleFavori = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!userId) {
      router.push(`/connexion?redirect=/bien/${bienId}`)
      return
    }
    if (!bienId || favLoading) return
    setFavLoading(true)
    const nextState = !favorited
    setFavorited(nextState)
    try {
      if (nextState) {
        const { error } = await supabase.from('favoris').insert({ user_id: userId, bien_id: bienId })
        if (error) throw error
      } else {
        const { error } = await supabase.from('favoris').delete().eq('user_id', userId).eq('bien_id', bienId)
        if (error) throw error
      }
    } catch {
      setFavorited(!nextState)
    } finally {
      setFavLoading(false)
    }
  }

  // ── Partager avec feedback visuel ──
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const shareData = { title: titre, url: window.location.href }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }
    } catch {
      // annulé ou non supporté — on tente le presse-papiers
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  if (!images.length) return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 h-[260px] sm:h-[360px] lg:h-[440px] flex items-center justify-center">
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  )

  const img = images[current]

  return (
    <>
      <div className="flex flex-col gap-2.5">
        {/* Image principale */}
        <div
          className="relative rounded-2xl overflow-hidden bg-gray-900 h-[260px] sm:h-[360px] lg:h-[440px] cursor-zoom-in group select-none touch-pan-y"
          onClick={() => { if (!dragRef.current) openLb(current) }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex h-full"
            style={{
              width: `${images.length * 100}%`,
              transform: `translateX(calc(-${current * (100 / images.length)}% + ${dragOffset / images.length}px))`,
              transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
          >
            {images.map((ph, i) => (
              <div key={ph.id} className="relative h-full flex-shrink-0" style={{ width: `${100 / images.length}%` }}>
                {!broken[ph.url] ? (
                  <Image
                    src={ph.url}
                    alt={`${titre} — photo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
                    priority={i === 0}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    onError={() => setBroken(p => ({ ...p, [ph.url]: true }))}
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <svg className="w-14 h-14 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

          <div className="absolute bottom-3 left-4">
            <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-lg">
              📷 {current + 1} / {images.length}
            </span>
          </div>

          {images.length > 1 && images.length <= 8 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none md:hidden">
              {images.map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-200 ${i === current ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
              ))}
            </div>
          )}

          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); go(current - 1) }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                aria-label="Précédente">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={e => { e.stopPropagation(); go(current + 1) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                aria-label="Suivante">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
        </div>

        {/* Barre actions — Favori / Partager / Signaler — FONCTIONNELS */}
        <div className="flex items-center justify-end gap-2 px-1">
          <button onClick={toggleFavori} disabled={favLoading}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors min-h-[44px] ${
              favorited
                ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-500'
            } ${favLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <svg className="w-4 h-4" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            {favorited ? 'Sauvegardé' : 'Favori'}
          </button>

          <div className="relative">
            <button onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-400 hover:text-blue-500 text-xs font-medium rounded-lg transition-colors min-h-[44px]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
              Partager
            </button>
            {shareCopied && (
              <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg z-10">
                Lien copié !
              </span>
            )}
          </div>

          {bienId && <ReportButton bienId={bienId} />}
        </div>

        {/* Miniatures */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((ph, i) => (
              <button key={ph.id} onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-[72px] h-[54px] sm:w-20 sm:h-[60px] rounded-xl overflow-hidden border-2 transition-all duration-200 min-w-[44px] ${
                  i === current ? 'border-green-500 ring-2 ring-green-200' : 'border-transparent opacity-70 hover:opacity-100'
                }`}>
                <div className="relative w-full h-full">
                  <Image
                    src={!broken[ph.url] ? ph.url : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="60"%3E%3Crect width="80" height="60" fill="%23e5e7eb"/%3E%3C/svg%3E'}
                    alt="" fill className="object-cover" sizes="80px" loading="lazy"
                    onError={() => setBroken(p => ({ ...p, [ph.url]: true }))} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox plein écran */}
      {lightbox && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{lbIndex + 1} / {images.length}</span>
          </div>

          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                height: '100%',
                width: `${images.length * 100}%`,
                transform: `translateX(calc(-${lbIndex * (100 / images.length)}% + ${dragOffset / images.length}px))`,
                transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
              }}
            >
              {images.map((ph, i) => (
                <div key={ph.id} style={{ position: 'relative', height: '100%', flexShrink: 0, width: `${100 / images.length}%` }}>
                  {!broken[ph.url] && (
                    <Image
                      src={ph.url}
                      alt={`${titre} — ${i + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority={i === lbIndex}
                      loading={i === lbIndex ? 'eager' : 'lazy'}
                      onError={() => setBroken(p => ({ ...p, [ph.url]: true }))}
                      draggable={false}
                    />
                  )}
                </div>
              ))}
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setLbIndex(i => (i - 1 + images.length) % images.length)}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                  aria-label="Précédente">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={() => setLbIndex(i => (i + 1) % images.length)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                  aria-label="Suivante">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}
          </div>

          <div style={{ padding: '12px 16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {images.map((ph, i) => (
                <button key={ph.id} onClick={() => setLbIndex(i)}
                  style={{ flexShrink: 0, width: 48, height: 36, borderRadius: 6, overflow: 'hidden', border: i === lbIndex ? '2px solid #fff' : '2px solid transparent', opacity: i === lbIndex ? 1 : 0.4, position: 'relative', cursor: 'pointer', background: 'transparent', padding: 0 }}>
                  <Image src={ph.url} alt="" fill className="object-cover" sizes="48px" loading="lazy" />
                </button>
              ))}
            </div>

            <button
              onClick={closeLb}
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}
              aria-label="Fermer">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  )
}
