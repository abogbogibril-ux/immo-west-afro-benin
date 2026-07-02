'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    // Ecouter le changement d etat auth - Supabase detecte automatiquement le hash dans l URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Session etablie - verifier le role et rediriger
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (profile?.role === 'admin') {
          router.push('/admin')
        } else if (profile?.role === 'agent') {
          router.push('/dashboard/agent')
        } else {
          router.push('/dashboard/client')
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        router.push('/connexion?reset=true')
      }
    })

    // Verifier si session deja active
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (profile?.role === 'admin') {
          router.push('/admin')
        } else if (profile?.role === 'agent') {
          router.push('/dashboard/agent')
        } else {
          router.push('/dashboard/client')
        }
      }
    }

    checkSession()

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Confirmation de votre email en cours...</p>
        <p className="text-gray-400 text-sm mt-2">Vous allez etre redirige vers votre espace...</p>
      </div>
    </div>
  )
}