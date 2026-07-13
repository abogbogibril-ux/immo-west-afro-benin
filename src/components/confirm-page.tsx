'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    // Applique le rôle choisi avant une éventuelle inscription via Google,
    // et redirige vers le bon espace selon le rôle final.
    const applyPendingRoleAndRedirect = async (userId: string) => {
      const pendingRole = localStorage.getItem('pending_role')

      let finalRole: string | null = null

      if (pendingRole === 'agent' || pendingRole === 'client') {
        await supabase.from('profiles').update({ role: pendingRole }).eq('id', userId)
        localStorage.removeItem('pending_role')
        finalRole = pendingRole
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single()
        finalRole = profile?.role ?? null
      }

      if (finalRole === 'admin') {
        router.push('/admin')
      } else if (finalRole === 'agent') {
        router.push('/dashboard/agent')
      } else {
        router.push('/dashboard/client')
      }
    }

    // Ecouter le changement d'etat auth - Supabase detecte automatiquement le hash dans l'URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await applyPendingRoleAndRedirect(session.user.id)
      } else if (event === 'PASSWORD_RECOVERY') {
        router.push('/connexion?reset=true')
      }
    })

    // Verifier si session deja active
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await applyPendingRoleAndRedirect(session.user.id)
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
