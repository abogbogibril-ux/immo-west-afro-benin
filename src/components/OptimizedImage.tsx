'use client'

import Image from 'next/image'
import { useState } from 'react'

interface Props {
  src?: string | null
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  objectFit?: 'cover' | 'contain'
}

const PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7wn4qAPC90ZXh0Pjwvc3ZnPg=='

/**
 * Composant image optimisé pour Immo West Afro
 * - Conversion WebP automatique via Next.js
 * - Lazy loading par défaut
 * - Placeholder pendant le chargement
 * - Fallback si image cassée
 * - Cache 7 jours
 */
export default function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  objectFit = 'cover',
}: Props) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Fallback si pas d'image ou image cassée
  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={!fill ? { width, height } : undefined}>
        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  const sharedProps = {
    src,
    alt,
    onError: () => setError(true),
    onLoad: () => setLoaded(true),
    priority,
    placeholder: 'blur' as const,
    blurDataURL: PLACEHOLDER,
    className: `transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${objectFit === 'cover' ? 'object-cover' : 'object-contain'} ${className}`,
  }

  if (fill) {
    return (
      <Image
        {...sharedProps}
        fill
        sizes={sizes}
      />
    )
  }

  return (
    <Image
      {...sharedProps}
      width={width ?? 400}
      height={height ?? 300}
      sizes={sizes}
    />
  )
}