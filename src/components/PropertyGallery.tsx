'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'

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
}

const SWIPE_THRESHOLD = 50

export default function PropertyGallery({ images, titre, bienId }: Props) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [lbIndex, setLbIndex] = useState(0)
  const [broken, setBroken] = useState<Record<string, boolean>>({})
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const go = useCallback((n: number) => {
    setCurrent((n + images.length) % images.length)
    setDragOffset(0)
  }, [images.length])

  const openLb = (i: number) => { setLbIndex(i); setLightbox(true) }
  const closeLb = () => setLightbox(false)

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightbox) return
      if (e.key === 'Escape') closeLb()
      if (e.key === 'ArrowLeft') setLbIndex(i => (i - 1 + images.length) % images.length)
      if (e.key === 'ArrowRight') setLbIndex(i => (i + 1) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, images.length])

  // Lock body scroll in lightbox
  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  // Touch swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    setIsDragging(false)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      e.preventDefault()
      setIsDragging(true)
      setDragOffset(dx)
    }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (isDragging) {
      if (dx < -SWIPE_THRESHOLD) go(current + 1)
      else if (dx > SWIPE_THRESHOLD) go(current - 1)
      else setDragOffset(0)
    }
    setIsDragging(false)
    setDragOffset(0)
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
          onClick={() => !isDragging && openLb(current)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Conteneur images swipeable */}
          <div
            className="flex h-full"
            style={{
              width: `${images.length * 100}%`,
              transform: `translateX(calc(-${current * (100 / images.length)}% + ${dragOffset / images.length}px))`,
              transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
            {images.map((ph, i) => (
              <div key={ph.id} className="relative h-full flex-shrink-0" style={{ width: `${100 / images.length}%` }}>
                {!broken[ph.url] ? (
                  <Image
                    src={ph.url}
                    alt={`${titre} — photo ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
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

          {/* Gradient bas */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

          {/* Compteur */}
          <div className="absolute bottom-3 left-4">
            <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-lg">
              📷 {current + 1} / {images.length}
            </span>
          </div>

          {/* Points de navigation mobile */}
          {images.length > 1 && images.length <= 8 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none md:hidden">
              {images.map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-200 ${i === current ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
              ))}
            </div>
          )}

          {/* Boutons précédent/suivant (desktop) */}
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); go(current - 1) }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                aria-label="Précédente"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); go(current + 1) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                aria-label="Suivante"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Barre actions */}
        <div className="flex items-center justify-end gap-2 px-1">
          <button
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-500 text-xs font-medium rounded-lg transition-colors min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            Favori
          </button>
          <button
            onClick={e => { e.stopPropagation(); if (navigator.share) { navigator.share({ title: titre, url: window.location.href }) } else { navigator.clipboard.writeText(window.location.href) } }}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-400 hover:text-blue-500 text-xs font-medium rounded-lg transition-colors min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
            Partager
          </button>
          {bienId && (
            <button
              onClick={e => { e.stopPropagation(); document.getElementById('report-modal-' + bienId)?.click() }}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-500 text-xs font-medium rounded-lg transition-colors min-h-[44px]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/>
              </svg>
              Signaler
            </button>
          )}
        </div>

        {/* Miniatures */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((ph, i) => (
              <button
                key={ph.id}
                onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-[72px] h-[54px] sm:w-20 sm:h-[60px] rounded-xl overflow-hidden border-2 transition-all duration-200 min-w-[44px] min-h-[44px] ${
                  i === current ? 'border-green-500 ring-2 ring-green-200' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                {!broken[ph.url] ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={ph.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                      loading="lazy"
                      onError={() => setBroken(p => ({ ...p, [ph.url]: true }))}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[200] bg-black/96 flex items-center justify-center" onClick={closeLb}>
          <button
            onClick={closeLb}
            className="absolute top-4 right-4 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center z-10"
            aria-label="Fermer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm">{lbIndex + 1} / {images.length}</p>
          <div className="max-w-5xl w-full mx-6 max-h-[82vh] relative" onClick={e => e.stopPropagation()}>
            <div className="relative w-full h-[82vh]">
              <Image
                src={images[lbIndex]?.url}
                alt={`${titre} — ${lbIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setLbIndex(i => (i - 1 + images.length) % images.length) }}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center"
                aria-label="Précédente"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); setLbIndex(i => (i + 1) % images.length) }}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center"
                aria-label="Suivante"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4 overflow-x-auto">
            {images.map((ph, i) => (
              <button
                key={ph.id}
                onClick={e => { e.stopPropagation(); setLbIndex(i) }}
                className={`flex-shrink-0 w-12 h-9 rounded overflow-hidden border-2 transition-all ${
                  i === lbIndex ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
                }`}
              >
                <div className="relative w-full h-full">
                  <Image src={ph.url} alt="" fill className="object-cover" sizes="48px" loading="lazy" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
