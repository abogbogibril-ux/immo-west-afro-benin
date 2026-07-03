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
    const body = document.body

    if (t === 'light') {
      root.classList.add('light-mode')
      root.classList.remove('dark-mode')
      body.setAttribute('data-theme', 'light')
      body.style.backgroundColor = '#f8fafc'
      body.style.color = '#0f172a'

      // Surcharger tous les elements avec fond sombre
      document.querySelectorAll<HTMLElement>('[style*="background-color: rgb(15, 23, 42)"], [style*="backgroundColor"]').forEach(el => {
        const bg = el.style.backgroundColor
        if (bg === 'rgb(15, 23, 42)' || bg === '#0f172a') el.style.backgroundColor = '#f8fafc'
        if (bg === 'rgb(30, 41, 59)' || bg === '#1e293b') el.style.backgroundColor = '#ffffff'
        if (bg === 'rgb(13, 17, 23)' || bg === '#0D1117') el.style.backgroundColor = '#f1f5f9'
      })
    } else {
      root.classList.add('dark-mode')
      root.classList.remove('light-mode')
      body.setAttribute('data-theme', 'dark')
      body.style.backgroundColor = '#0f172a'
      body.style.color = '#f1f5f9'

      document.querySelectorAll<HTMLElement>('[style*="background-color"]').forEach(el => {
        const bg = el.style.backgroundColor
        if (bg === 'rgb(248, 250, 252)' || bg === '#f8fafc') el.style.backgroundColor = '#0f172a'
        if (bg === 'rgb(255, 255, 255)' || bg === '#ffffff') el.style.backgroundColor = '#1e293b'
        if (bg === 'rgb(241, 245, 249)' || bg === '#f1f5f9') el.style.backgroundColor = '#0f172a'
      })
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