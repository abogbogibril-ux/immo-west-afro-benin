'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      } else {
        // Attendre que Supabase traite le hash
        setTimeout(async () => {
          const { data: { session: s } } = await supabase.auth.getSession()
          if (s) {
            router.push('/')
          } else {
            router.push('/connexion?error=lien_invalide')
          }
        }, 2000)
      }
    }
    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Confirmation de votre email en cours...</p>
        <p className="text-gray-400 text-sm mt-2">Vous allez etre redirige automatiquement</p>
      </div>
    </div>
  )
}