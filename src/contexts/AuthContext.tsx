'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: any | null
  role: string | null
  ready: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, ready: false })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setRole(data?.role ?? null)
      }
      setReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        setRole(data?.role ?? null)
      } else {
        setRole(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, ready }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)