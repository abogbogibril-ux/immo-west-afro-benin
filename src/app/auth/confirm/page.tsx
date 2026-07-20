'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const applyRoleAndRedirect = async (userId: string) => {
      const pendingRole = localStorage.getItem('pending_role')
      let finalRole: string | null = null
      if (pendingRole === 'agent' || pendingRole === 'client') {
        await supabase.from('profiles').update({ role: pendingRole }).eq('id', userId)
        localStorage.removeItem('pending_role')
        finalRole = pendingRole
      } else {
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', userId).single()
        finalRole = profile?.role ?? null
      }
      if (finalRole === 'admin') router.push('/admin')
      else if (finalRole === 'agent') router.push('/dashboard/agent')
      else router.push('/dashboard/client')
    }

    const handleConfirm = async () => {
      // Flux PKCE — token_hash dans les params URL
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type') as 'signup' | 'email' | null

      if (tokenHash && type) {
        const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (!error && data.session) {
          await applyRoleAndRedirect(data.session.user.id)
          return
        }
      }

      // Flux implicite — hash dans l'URL (#access_token=...)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await applyRoleAndRedirect(session.user.id)
        } else if (event === 'PASSWORD_RECOVERY') {
          router.push('/connexion?reset=true')
        }
      })

      // Verifier si session deja active
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await applyRoleAndRedirect(session.user.id)
        return
      }

      // Timeout de securite — si rien ne se passe apres 8 secondes
      setTimeout(() => {
        router.push('/connexion?message=email-confirme')
      }, 15000)

      return () => subscription.unsubscribe()
    }

    handleConfirm()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-600 font-medium">Confirmation de votre email en cours...</p>
        <p className="text-gray-400 text-sm mt-2">Vous allez etre redirige vers votre espace...</p>
      </div>
    </div>
  )
}