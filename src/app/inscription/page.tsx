'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>
  )
}

export default function InscriptionPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    password: '', confirmPassword: '', role: 'client', cgu: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm(p => ({
      ...p,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (form.password !== form.confirmPassword) {
      setErrorMsg('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (!form.cgu) {
      setErrorMsg('Vous devez accepter les CGU pour continuer.')
      return
    }

    setStatus('loading')

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          prenom: form.prenom,
          nom: form.nom,
          telephone: form.telephone,
          role: form.role,
          cgu_accepted_at: new Date().toISOString(),
        },
      },
    })

    if (error) {
      setStatus('error')
      setErrorMsg(
        error.message.includes('already registered')
          ? 'Cet email est deja utilise. Connectez-vous.'
          : error.message.includes('Password')
          ? 'Mot de passe trop faible. Minimum 6 caracteres.'
          : `Erreur: ${error.message}`
      )
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        prenom: form.prenom,
        nom: form.nom,
        telephone: form.telephone,
        role: form.role,
        email: form.email,
      })
      if (profileError) console.error('Profile error:', profileError)
    }

    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Compte cree !</h2>
          <p className="text-gray-500 text-sm mb-6">
            Bienvenue sur Immo West Afro. Votre compte est actif.
          </p>
          <Link href="/connexion"
            className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <img src="/logo.png" alt="Immo West Afro" className="w-14 h-14 object-contain"/>
            <div>
              <p className="font-bold text-gray-900">Immo West Afro</p>
              <p className="text-xs text-blue-600 font-medium">Benin</p>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Creer un compte</h1>
          <p className="text-gray-500 text-sm">Rejoignez Immo West Afro gratuitement</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Je suis</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'client', label: 'Acheteur / Locataire' },
                  { val: 'agent', label: 'Agent immobilier' },
                ].map(r => (
                  <button key={r.val} type="button"
                    onClick={() => setForm(p => ({ ...p, role: r.val }))}
                    className={`py-2.5 text-xs font-semibold rounded-xl border-2 transition-all ${
                      form.role === r.val
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-200 text-gray-500 hover:border-green-300'
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Prenom *</label>
                <input name="prenom" type="text" required placeholder="Prenom"
                  value={form.prenom} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-400/30"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nom *</label>
                <input name="nom" type="text" required placeholder="Nom"
                  value={form.nom} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-400/30"/>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email *</label>
              <input name="email" type="email" required placeholder="votre@email.com"
                value={form.email} onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-400/30"/>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Telephone</label>
              <input name="telephone" type="tel" placeholder="+229 XX XX XX XX"
                value={form.telephone} onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-400/30"/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mot de passe *</label>
                <div className="relative">
                  <input name="password" type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                    value={form.password} onChange={handleChange}
                    className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-400/30"/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Confirmer *</label>
                <div className="relative">
                  <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} required placeholder="••••••••"
                    value={form.confirmPassword} onChange={handleChange}
                    className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-400/30"/>
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <EyeIcon visible={showConfirm} />
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input name="cgu" type="checkbox" checked={form.cgu} onChange={handleChange}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 flex-shrink-0"/>
              <span className="text-xs text-gray-500 leading-relaxed">
                J accepte les{' '}
                <Link href="/cgu" className="text-green-600 hover:underline font-medium" target="_blank">
                  Conditions Generales d Utilisation
                </Link>
                {' '}d Immo West Afro *
              </span>
            </label>

            {(status === 'error' || errorMsg) && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-sm text-red-600">{errorMsg}</p>
              </div>
            )}

            <button type="submit" disabled={status === 'loading' || !form.cgu}
              className="w-full py-3.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {status === 'loading' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creation du compte...
                </>
              ) : 'Creer mon compte'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Deja un compte ?{' '}
              <Link href="/connexion" className="text-green-600 font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Retour a l accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
