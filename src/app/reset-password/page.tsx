'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase injecte automatiquement la session depuis le lien email
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (password !== confirm) {
      setErrorMsg('Les mots de passe ne correspondent pas.')
      return
    }

    setStatus('loading')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setStatus('error')
      setErrorMsg('Erreur lors de la mise à jour. Le lien a peut-être expiré.')
      return
    }

    setStatus('success')
    setTimeout(() => router.push('/connexion'), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <img src="/logo.png" alt="Immo West Afro" className="w-14 h-14 object-contain"/>
            <div>
              <p className="font-bold text-gray-900">Immo West Afro</p>
              <p className="text-xs text-blue-600 font-medium">Bénin</p>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Nouveau mot de passe</h1>
          <p className="text-gray-500 text-sm">Choisissez un nouveau mot de passe sécurisé</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">

          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Mot de passe modifié !</h3>
              <p className="text-gray-500 text-sm mb-2">
                Vous allez être redirigé vers la page de connexion...
              </p>
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mt-4"/>
            </div>
          ) : !ready ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
              <p className="text-gray-500 text-sm">Vérification du lien en cours...</p>
              <p className="text-xs text-gray-400 mt-2">
                Si rien ne se passe, le lien a peut-être expiré.{' '}
                <Link href="/mot-de-passe-oublie" className="text-blue-600 hover:underline">
                  Demander un nouveau lien
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Nouveau mot de passe *
                </label>
                <input type="password" required placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-gray-50"/>
                <p className="text-xs text-gray-400 mt-1">Minimum 6 caractères</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Confirmer le mot de passe *
                </label>
                <input type="password" required placeholder="••••••••"
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  className="w-full px-3.5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-gray-50"/>
              </div>

              {/* Force du mot de passe */}
              {password.length > 0 && (
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                        password.length >= i * 3
                          ? i <= 1 ? 'bg-red-400'
                          : i <= 2 ? 'bg-amber-400'
                          : i <= 3 ? 'bg-blue-400'
                          : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}/>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {password.length < 6 ? 'Trop court'
                      : password.length < 9 ? 'Faible'
                      : password.length < 12 ? 'Moyen'
                      : 'Fort'}
                  </p>
                </div>
              )}

              {(status === 'error' || errorMsg) && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="text-sm text-red-600">{errorMsg}</p>
                </div>
              )}

              <button type="submit" disabled={status === 'loading'}
                className="w-full py-3.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {status === 'loading' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                    </svg>
                    Enregistrer le mot de passe
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/connexion" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}