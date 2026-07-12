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

  // Swipe — galerie principale
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const dragRef = useRef(false)

  // Swipe — lightbox plein écran (états séparés)
  const [lbDragOffset, setLbDragOffset] = useState(0)
  const [lbIsDragging, setLbIsDragging] = useState(false)
  const lbTouchStartX = useRef(0)
  const lbTouchStartY = useRef(0)
  const lbDragRef = useRef(false)

  const router = useRouter()

  const [favorited, setFavorited] = useState(isFavorited)
  const [favLoading, setFavLoading] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [shareMenuOpen, setShareMenuOpen] = useState(false)

  const go = useCallback((n: number) => {
    setCurrent((n + images.length) % images.length)
    setDragOffset(0)
    dragRef.current = false
  }, [images.length])

  const lbGo = useCallback((n: number) => {
    setLbIndex((n + images.length) % images.length)
    setLbDragOffset(0)
    lbDragRef.current = false
  }, [images.length])

  const openLb = (i: number) => { setLbIndex(i); setLightbox(true) }
  const closeLb = useCallback(() => setLightbox(false), [])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLb()
      if (e.key === 'ArrowLeft') lbGo(lbIndex - 1)
      if (e.key === 'ArrowRight') lbGo(lbIndex + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, lbIndex, lbGo, closeLb])

  useEffect(() => {
    if (lightbox) {
      document.documentElement.style.overflow = 'hidden'
      return () => { document.documentElement.style.overflow = '' }
    }
  }, [lightbox])

  // ── Swipe galerie principale ──
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

  // ── Swipe lightbox (dédié) ──
  const onLbTouchStart = (e: React.TouchEvent) => {
    lbTouchStartX.current = e.touches[0].clientX
    lbTouchStartY.current = e.touches[0].clientY
    lbDragRef.current = false
    setLbIsDragging(false)
  }
  const onLbTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - lbTouchStartX.current
    const dy = e.touches[0].clientY - lbTouchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      e.preventDefault()
      lbDragRef.current = true
      setLbIsDragging(true)
      setLbDragOffset(dx)
    }
  }
  const onLbTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - lbTouchStartX.current
    if (lbDragRef.current) {
      if (dx < -SWIPE_THRESHOLD) lbGo(lbIndex + 1)
      else if (dx > SWIPE_THRESHOLD) lbGo(lbIndex - 1)
      else setLbDragOffset(0)
    }
    setLbIsDragging(false)
    setLbDragOffset(0)
    lbDragRef.current = false
  }

  const toggleFavori = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!userId) { router.push(`/connexion?redirect=/bien/${bienId}`); return }
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

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = encodeURIComponent(`Découvrez : ${titre}`)

  const shareOptions = [
    { label: 'WhatsApp', icon: 'whatsapp', action: () => window.open(`https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`, '_blank') },
    { label: 'Email', icon: 'email', action: () => { window.location.href = `mailto:?subject=${shareText}&body=${encodeURIComponent(shareUrl)}` } },
    { label: 'Facebook', icon: 'facebook', action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400') },
    { label: 'Copier le lien', icon: 'copy', action: async () => {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
      } catch { /* ignore */ }
    } },
  ]

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShareMenuOpen(prev => !prev)
  }

  if (!images.length) return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 h-[260px] sm:h-[360px] lg:h-[440px] flex items-center justify-center">
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  )

  return (
    <>
      <div className="flex flex-col gap-2.5">
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

        <div className="flex items-center justify-end gap-2 px-1">
          <button onClick={toggleFavori} disabled={favLoading}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors min-h-[44px] ${
              favorited
                ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/50 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
            } ${favLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <svg className="w-4 h-4" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            {favorited ? 'Sauvegardé' : 'Favori'}
          </button>

          <div className="relative">
            <button onClick={handleShareClick}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/50 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 text-xs font-medium rounded-lg transition-colors min-h-[44px]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
              Partager
            </button>
            {shareMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShareMenuOpen(false)} />
                <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 min-w-[180px] z-30">
                  {shareOptions.map(opt => (
                    <button key={opt.label}
                      onClick={(e) => { e.stopPropagation(); opt.action(); setShareMenuOpen(false) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]">
                      {opt.icon === 'whatsapp' && (<svg className="w-4 h-4 text-[#25D366] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>)}
                      {opt.icon === 'email' && (<svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>)}
                      {opt.icon === 'facebook' && (<svg className="w-4 h-4 text-[#1877F2] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.759 0 2.068.15 2.605.298v3.325c-.283-.03-.774-.045-1.386-.045-1.967 0-2.727.745-2.727 2.686v1.294h3.925l-.674 3.667h-3.25v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647z"/></svg>)}
                      {opt.icon === 'copy' && (<svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>)}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {shareCopied && (
              <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg z-40">
                Lien copié !
              </span>
            )}
          </div>

          {bienId && <ReportButton bienId={bienId} />}
        </div>

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

      {lightbox && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column' }}
          onTouchStart={onLbTouchStart}
          onTouchMove={onLbTouchMove}
          onTouchEnd={onLbTouchEnd}
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
                transform: `translateX(calc(-${lbIndex * (100 / images.length)}% + ${lbDragOffset / images.length}px))`,
                transition: lbIsDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
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
                  onClick={() => lbGo(lbIndex - 1)}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                  aria-label="Précédente">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={() => lbGo(lbIndex + 1)}
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
