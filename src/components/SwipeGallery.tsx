"use client";

/**
 * SwipeGallery — Galerie photos avec swipe tactile
 * Immo West Afro Bénin
 *
 * Usage :
 *   <SwipeGallery images={bien.photos} title={bien.titre} />
 *
 * Fonctionnalités :
 *   - Swipe gauche/droite natif (touch + mouse)
 *   - Navigation par points
 *   - Affichage fullscreen sur tap
 *   - Lazy loading avec Next/Image
 *   - Fallback image immobilier Bénin
 */

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface SwipeGalleryProps {
  images: string[];
  title?: string;
  className?: string;
  aspectRatio?: "16/9" | "4/3" | "square";
  showThumbnails?: boolean;
}

const SWIPE_THRESHOLD = 50;   // px minimum pour valider un swipe
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80";

// ── Icônes ──────────────────────────────────────────────────
const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
    <polyline points="15,18 9,12 15,6" />
  </svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
    <polyline points="9,18 15,12 9,6" />
  </svg>
);
const ExpandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <polyline points="15,3 21,3 21,9" />
    <polyline points="9,21 3,21 3,15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Composant principal ─────────────────────────────────────

export default function SwipeGallery({
  images,
  title = "Photo du bien",
  className = "",
  aspectRatio = "16/9",
  showThumbnails = true,
}: SwipeGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const mouseStartX = useRef<number>(0);
  const isMouseDown = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const safeImages = images?.length > 0 ? images : [FALLBACK_IMAGE];
  const total = safeImages.length;

  // ── Navigation ─────────────────────────────────────────────
  const goTo = useCallback((index: number) => {
    setCurrentIndex(((index % total) + total) % total);
    setDragOffset(0);
  }, [total]);

  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  // ── Keyboard navigation ────────────────────────────────────
  useEffect(() => {
    if (!fullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fullscreen, prev, next]);

  // ── Lock body scroll en fullscreen ────────────────────────
  useEffect(() => {
    document.body.style.overflow = fullscreen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [fullscreen]);

  // ── Touch handlers ─────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Swipe horizontal uniquement
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      e.preventDefault();
      setIsDragging(true);
      setDragOffset(dx);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (isDragging) {
      if (dx < -SWIPE_THRESHOLD) next();
      else if (dx > SWIPE_THRESHOLD) prev();
      else setDragOffset(0);
    }
    setIsDragging(false);
    setDragOffset(0);
  };

  // ── Mouse drag handlers (desktop) ─────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    isMouseDown.current = true;
    mouseStartX.current = e.clientX;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current) return;
    const dx = e.clientX - mouseStartX.current;
    if (Math.abs(dx) > 10) {
      setIsDragging(true);
      setDragOffset(dx);
    }
  };
  const onMouseUp = (e: React.MouseEvent) => {
    if (isMouseDown.current) {
      const dx = e.clientX - mouseStartX.current;
      if (isDragging) {
        if (dx < -SWIPE_THRESHOLD) next();
        else if (dx > SWIPE_THRESHOLD) prev();
        else setDragOffset(0);
      }
    }
    isMouseDown.current = false;
    setIsDragging(false);
    setDragOffset(0);
  };

  const aspectClass = {
    "16/9": "aspect-video",
    "4/3": "aspect-[4/3]",
    "square": "aspect-square",
  }[aspectRatio];

  // ── Rendu galerie ──────────────────────────────────────────
  const GalleryContent = ({ inFullscreen = false }: { inFullscreen?: boolean }) => (
    <div
      ref={inFullscreen ? undefined : containerRef}
      className={`relative overflow-hidden ${inFullscreen ? "w-full h-full" : `${aspectClass} rounded-xl`} select-none touch-pan-y`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Images */}
      <div
        className="flex h-full transition-transform"
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
          transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          width: `${total * 100}%`,
        }}
      >
        {safeImages.map((src, i) => (
          <div
            key={i}
            className="relative flex-shrink-0 h-full"
            style={{ width: `${100 / total}%` }}
          >
            <Image
              src={imgErrors.has(i) ? FALLBACK_IMAGE : src}
              alt={`${title} — photo ${i + 1}`}
              fill
              className={`object-cover ${inFullscreen ? "object-contain" : "object-cover"}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              onError={() => setImgErrors(prev => new Set(prev).add(i))}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Overlay gradient bas */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      {/* Compteur */}
      <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
        {currentIndex + 1} / {total}
      </div>

      {/* Bouton fullscreen (sauf si déjà en fullscreen) */}
      {!inFullscreen && total > 1 && (
        <button
          onClick={() => setFullscreen(true)}
          className="absolute top-3 left-3 bg-black/60 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/80 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Plein écran"
        >
          <ExpandIcon />
        </button>
      )}

      {/* Boutons précédent/suivant (seulement si > 1 image) */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm rounded-full p-2 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center shadow-lg"
            aria-label="Photo précédente"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm rounded-full p-2 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center shadow-lg"
            aria-label="Photo suivante"
          >
            <ChevronRight />
          </button>
        </>
      )}

      {/* Points de navigation */}
      {total > 1 && total <= 10 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
          {safeImages.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? "w-4 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className={className}>
        <GalleryContent />

        {/* Miniatures */}
        {showThumbnails && total > 1 && total <= 8 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
            {safeImages.map((src, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all min-w-[44px] min-h-[44px] ${
                  i === currentIndex
                    ? "ring-2 ring-emerald-500 ring-offset-1"
                    : "opacity-60 hover:opacity-90"
                }`}
                aria-label={`Voir photo ${i + 1}`}
              >
                <Image
                  src={imgErrors.has(i) ? FALLBACK_IMAGE : src}
                  alt={`Miniature ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                  loading="lazy"
                  onError={() => setImgErrors(prev => new Set(prev).add(i))}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[200] bg-black flex flex-col"
          onClick={() => setFullscreen(false)}
        >
          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
            <GalleryContent inFullscreen />
          </div>

          {/* Bouton fermer */}
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center z-10"
            aria-label="Fermer la galerie"
          >
            <CloseIcon />
          </button>

          {/* Titre en bas */}
          <div className="px-4 py-3 text-white/70 text-sm text-center safe-bottom">
            {title} — {currentIndex + 1} / {total}
          </div>
        </div>
      )}
    </>
  );
}
