'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Props {
  bienId: string
  userId?: string
  initialFavorited: boolean
}

export default function FavoriteButton({ bienId, userId, initialFavorited }: Props) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    if (!userId) {
      router.push('/connexion?redirect=/bien/' + bienId)
      return
    }
    setLoading(true)
    setFavorited(prev => !prev)
    try {
      if (favorited) {
        const { error } = await supabase
          .from('favoris').delete()
          .eq('user_id', userId).eq('bien_id', bienId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('favoris').insert({ user_id: userId, bien_id: bienId })
        if (error) throw error
      }
    } catch {
      setFavorited(prev => !prev)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl border-2 font-medium text-sm transition-all duration-200 ${
        favorited
          ? 'bg-red-50 border-red-300 text-red-500 hover:bg-red-100'
          : 'bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400'
      } ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-sm active:scale-95'}`}
    >
      <svg
        className={`w-5 h-5 flex-shrink-0 transition-all duration-200 ${loading ? 'animate-pulse' : ''}`}
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span className="hidden sm:inline">
        {favorited ? 'Sauvegarde' : 'Sauvegarder'}
      </span>
    </button>
  )
}