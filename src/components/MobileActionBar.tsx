'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function MobileActionBar() {
  const [user, setUser] = useState<any>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!ready || user) return null

  return (
    <div className="lg:hidden bg-white border-b border-gray-100 shadow-sm px-4 py-2 flex gap-2">
      <Link href="/connexion"
        className="flex-1 flex items-center justify-center min-h-[44px] rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:border-gray-300 transition-colors">
        Se connecter
      </Link>
      <Link href="/inscription"
        className="flex-1 flex items-center justify-center min-h-[44px] rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors">
        S inscrire
      </Link>
      <Link href="/deposer"
        className="flex-1 flex items-center justify-center min-h-[44px] rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
        Deposer un besoin
      </Link>
    </div>
  )
}