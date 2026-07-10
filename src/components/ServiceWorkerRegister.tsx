'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('[PWA] Service Worker enregistré:', registration.scope)
          })
          .catch((error) => {
            console.warn('[PWA] Erreur Service Worker:', error)
          })
      })
    }
  }, [])

  return null
}
