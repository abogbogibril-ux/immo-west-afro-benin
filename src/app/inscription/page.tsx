'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function InscriptionPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    password: '', confirmPassword: '', role: 'client', cgu: false,
  })
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
          ? 'Cet email est déjà utilisé. Connectez-vous.'
          : error.message
      )
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        prenom: form.prenom,
        nom: form.nom,
        telephone: form.telephone,
        role: form.role,
        email: form.email,
      })
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Compte créé !</h2>
          <p className="text-gray-500 text-sm mb-6">
            Un email de confirmation vous a été envoyé à <strong>{form.email}</strong>.
            Cliquez sur le lien pour activer votre compte.
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

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900">Immo West Afro</p>
              <p className="text-xs text-green-600 font-medium">Bénin</p>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Créer un compte</h1>
          <p className="text-gray-500 text-sm">Rejoignez Immo West Afro gratuitement</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Type de compte */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Je suis
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'client', label: '👤 Acheteur / Locataire' },
                  { val: 'agent', label: '🏢 Agent immobilier' },
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

            {/* Nom / Prénom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Prénom *
                </label>
                <input name="prenom" type="text" required placeholder="Prénom"
                  value={form.prenom} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Nom *
                </label>
                <input name="nom" type="text" required placeholder="Nom"
                  value={form.nom} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"/>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Email *
              </label>
              <input name="email" type="email" required placeholder="votre@email.com"
                value={form.email} onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"/>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Téléphone
              </label>
              <input name="telephone" type="tel" placeholder="+229 XX XX XX XX"
                value={form.telephone} onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"/>
            </div>

            {/* Mot de passe */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Mot de passe *
                </label>
                <input name="password" type="password" required placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Confirmer *
                </label>
                <input name="confirmPassword" type="password" required placeholder="••••••••"
                  value={form.confirmPassword} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"/>
              </div>
            </div>

            {/* CGU */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input name="cgu" type="checkbox" checked={form.cgu} onChange={handleChange}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0"/>
              <span className="text-xs text-gray-500 leading-relaxed">
                J'accepte les{' '}
                <Link href="/cgu" className="text-green-600 hover:underline font-medium" target="_blank">
                  Conditions Générales d'Utilisation
                </Link>
                {' '}d'Immo West Afro *
              </span>
            </label>

            {/* Erreur */}
            {(status === 'error' || errorMsg) && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-sm text-red-600">{errorMsg}</p>
              </div>
            )}

            <button type="submit"
              disabled={status === 'loading' || !form.cgu}
              className="w-full py-3.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              {status === 'loading' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Création du compte...
                </>
              ) : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Déjà un compte ?{' '}
              <Link href="/connexion" className="text-green-600 font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}