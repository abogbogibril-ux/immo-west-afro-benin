'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'immo_favoris'

export function useFavoris() {
  const [favoris, setFavoris] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setFavoris(JSON.parse(stored))
    } catch {}
  }, [])

  const toggleFavori = useCallback((id: string) => {
    setFavoris(prev => {
      const newFavoris = prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev, id]
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavoris))
      } catch {}
      return newFavoris
    })
  }, [])

  const isFavori = useCallback((id: string) => favoris.includes(id), [favoris])

  const clearFavoris = useCallback(() => {
    setFavoris([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return { favoris, toggleFavori, isFavori, clearFavoris }
}