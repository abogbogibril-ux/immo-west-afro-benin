'use client'

import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('immo_theme') as 'dark' | 'light'
    if (stored) {
      setTheme(stored)
      document.documentElement.classList.toggle('light-mode', stored === 'light')
    } else {
      document.documentElement.classList.remove('light-mode')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('immo_theme', newTheme)
    document.documentElement.classList.toggle('light-mode', newTheme === 'light')
  }

  return { theme, toggleTheme }
}