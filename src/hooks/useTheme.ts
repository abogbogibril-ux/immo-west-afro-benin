'use client'

import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('immo_theme') as 'dark' | 'light'
    const initial = stored || 'dark'
    setTheme(initial)
    applyTheme(initial)
  }, [])

  const applyTheme = (t: 'dark' | 'light') => {
    const root = document.documentElement
    if (t === 'light') {
      root.style.setProperty('--bg-page', '#f8fafc')
      root.style.setProperty('--bg-card', '#ffffff')
      root.style.setProperty('--bg-card2', '#f1f5f9')
      root.style.setProperty('--text-primary', '#0f172a')
      root.style.setProperty('--text-secondary', '#475569')
      root.style.setProperty('--text-muted', '#64748b')
      root.style.setProperty('--border', '#e2e8f0')
      root.classList.add('light-mode')
      root.classList.remove('dark-mode')
    } else {
      root.style.setProperty('--bg-page', '#0f172a')
      root.style.setProperty('--bg-card', '#1e293b')
      root.style.setProperty('--bg-card2', '#0f172a')
      root.style.setProperty('--text-primary', '#f1f5f9')
      root.style.setProperty('--text-secondary', '#cbd5e1')
      root.style.setProperty('--text-muted', '#94a3b8')
      root.style.setProperty('--border', '#334155')
      root.classList.add('dark-mode')
      root.classList.remove('light-mode')
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('immo_theme', newTheme)
    applyTheme(newTheme)
  }

  return { theme, toggleTheme }
}