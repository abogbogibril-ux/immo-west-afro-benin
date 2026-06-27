'use client'

import { useState, useCallback, useEffect } from 'react'

interface Photo {
  id: string
  url: string
  ordre?: number
  is_principale?: boolean
}

interface Props {
  images: Photo[]
  titre: string
}

export default function PropertyGallery({ images, titre }: Props) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [lbIndex, setLbIndex] = useState(0)
  const [broken, setBroken] = useState<Record<string, boolean>>({})

  const hasImages = images.length > 0
  const go = useCallback((idx: number) => setCurrent((idx + images.length) % images.length), [images.length])

  const openLb = (idx: number) => {
    setLbIndex(idx)
    setLightbox(true)
    document.body.style.overflow = 'hidden'
  }
  const closeLb = () => {
    setLightbox(false)
    document.body.style.overflow = ''
  }

  useEffect(() => {
    if (!lightbox) return
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setLbIndex(i => (i + 1) % images.length)
      if (e.key === 'ArrowLeft')  setLbIndex(i => (i - 1 + images.length) % images.length)
      if (e.key === 'Escape')     closeLb()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [lightbox, images.length])

  if (!hasImages) {
    return (
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 h-[320px] sm:h-[400px] lg:h-[480px] flex flex-col items-center justify-center text-gray-400">
        <svg className="w-16 h-16 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-medium">Aucune photo disponible</p>
      </div>
    )
  }

  const img = images[current]

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <div
          className="relative rounded-2xl overflow-hidden bg-gray-900 h-[260px] sm:h-[360px] lg:h-[440px] cursor-zoom-in group"
          onClick={() => openLb(current)}
        >
          {!broken[img.url] ? (
            <img
              src={img.url}
              alt={`${titre} — photo ${current + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              onError={() => setBroken(p => ({ ...p, [img.url]: true }))}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg className="w-14 h-14 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
              </svg>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-4">
            <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-lg">
              📷 {current + 1} / {images.length}
            </span>
          </div>
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); go(current - 1) }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                aria-label="Précédente">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={e => { e.stopPropagation(); go(current + 1) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                aria-label="Suivante">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((ph, i) => (
              <button key={ph.id} onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-[72px] h-[54px] sm:w-20 sm:h-[60px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  i === current ? 'border-green-500 ring-2 ring-green-200' : 'border-transparent opacity-70 hover:opacity-100'
                }`}>
                {!broken[ph.url] ? (
                  <img src={ph.url} alt="" className="w-full h-full object-cover"
                    onError={() => setBroken(p => ({ ...p, [ph.url]: true }))} />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
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

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/96 flex items-center justify-center" onClick={closeLb}>
          <button onClick={closeLb}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center z-10"
            aria-label="Fermer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm">{lbIndex + 1} / {images.length}</p>
          <div className="max-w-5xl w-full mx-6 max-h-[82vh]" onClick={e => e.stopPropagation()}>
            <img src={images[lbIndex]?.url} alt={`${titre} — ${lbIndex + 1}`}
              className="w-full h-full object-contain max-h-[82vh] rounded-xl" />
          </div>
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setLbIndex(i => (i - 1 + images.length) % images.length) }}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center"
                aria-label="Précédente">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={e => { e.stopPropagation(); setLbIndex(i => (i + 1) % images.length) }}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center"
                aria-label="Suivante">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4 overflow-x-auto">
            {images.map((ph, i) => (
              <button key={ph.id} onClick={e => { e.stopPropagation(); setLbIndex(i) }}
                className={`flex-shrink-0 w-12 h-9 rounded overflow-hidden border-2 transition-all ${
                  i === lbIndex ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
                }`}>
                <img src={ph.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}