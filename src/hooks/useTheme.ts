'use client'

import { useState, useEffect } from 'react'

const DARK_TO_LIGHT: Record<string, string> = {
  'rgb(15, 23, 42)': '#f8fafc',
  'rgb(30, 41, 59)': '#ffffff',
  'rgb(13, 17, 23)': '#f1f5f9',
  'rgb(15, 52, 96)': '#eff6ff',
  'rgb(241, 245, 249)': '#f1f5f9',
}

const LIGHT_TO_DARK: Record<string, string> = {
  'rgb(248, 250, 252)': '#0f172a',
  'rgb(255, 255, 255)': '#1e293b',
  'rgb(241, 245, 249)': '#0f172a',
  'rgb(239, 246, 255)': '#0f3460',
}

const TEXT_DARK_TO_LIGHT: Record<string, string> = {
  'rgb(241, 245, 249)': '#0f172a',
  'rgb(203, 213, 225)': '#334155',
  'rgb(148, 163, 184)': '#64748b',
  'rgb(255, 255, 255)': '#0f172a',
}

const TEXT_LIGHT_TO_DARK: Record<string, string> = {
  'rgb(15, 23, 42)': '#f1f5f9',
  'rgb(51, 65, 85)': '#cbd5e1',
  'rgb(100, 116, 139)': '#94a3b8',
}

function applyToAll(toDark: boolean) {
  const bgMap = toDark ? LIGHT_TO_DARK : DARK_TO_LIGHT
  const textMap = toDark ? TEXT_LIGHT_TO_DARK : TEXT_DARK_TO_LIGHT

  document.querySelectorAll<HTMLElement>('[style]').forEach(el => {
    const bg = el.style.backgroundColor
    if (bg && bgMap[bg]) el.style.backgroundColor = bgMap[bg]

    const col = el.style.color
    if (col && textMap[col]) el.style.color = textMap[col]

    const border = el.style.borderColor
    if (border) {
      if (toDark && border === 'rgb(226, 232, 240)') el.style.borderColor = '#334155'
      if (!toDark && border === 'rgb(51, 65, 85)') el.style.borderColor = '#e2e8f0'
    }
  })

  // Body
  document.body.style.backgroundColor = toDark ? '#0f172a' : '#f8fafc'
  document.body.style.color = toDark ? '#f1f5f9' : '#0f172a'
}

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const stored = (localStorage.getItem('immo_theme') as 'dark' | 'light') || 'dark'
    setTheme(stored)
    document.documentElement.classList.toggle('light-mode', stored === 'light')

    // Appliquer apres rendu complet
    const timer = setTimeout(() => applyToAll(stored === 'dark'), 300)

    // Observer les changements DOM (navigation entre pages)
    const observer = new MutationObserver(() => {
      const current = (localStorage.getItem('immo_theme') as 'dark' | 'light') || 'dark'
      setTimeout(() => applyToAll(current === 'dark'), 100)
    })
    observer.observe(document.body, { childList: true, subtree: true, attributes: false })

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('immo_theme', newTheme)
    document.documentElement.classList.toggle('light-mode', newTheme === 'light')
    applyToAll(newTheme === 'dark')
  }

  return { theme, toggleTheme }
}