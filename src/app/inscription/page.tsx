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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>
  )
}

const ROLES = [
  {
    val: 'agent',
    label: 'Agent immobilier',
    desc: 'Agence ou professionnel de l immobilier',
    icon: '🏢',
  },
  {
    val: 'proprietaire',
    label: 'Proprietaire particulier',
    desc: 'Je veux publier mon bien en direct',
    icon: '🏠',
  },
]

export default function InscriptionPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    password: '', confirmPassword: '', role: '',
    nom_agence: '', cgu: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setForm(p => ({
      ...p,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!form.role) { setErrorMsg('Choisissez votre profil.'); return }
    if (form.password !== form.confirmPassword) { setErrorMsg('Les mots de passe ne correspondent pas.'); return }
    if (form.password.length < 6) { setErrorMsg('Minimum 6 caracteres.'); return }
    if (!form.cgu) { setErrorMsg('Acceptez les CGU pour continuer.'); return }

    setStatus('loading')

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: 'https://benin.immowestafro.com/auth/confirm',
        data: {
          prenom: form.prenom,
          nom: form.nom,
          telephone: form.telephone,
          role: form.role,
          nom_agence: form.nom_agence,
        },
      },
    })

    if (error) {
      setStatus('error')
      setErrorMsg(
        error.message.includes('already registered')
          ? 'Cet email est deja utilise.'
          : `Erreur: ${error.message}`
      )
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: form.email,
        nom: form.nom,
        prenom: form.prenom,
        nom_complet: (form.prenom + ' ' + form.nom).trim(),
        telephone: form.telephone,
        role: form.role,
        nom_agence: form.nom_agence,
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verifiez votre email !</h2>
          <p className="text-gray-600 text-sm mb-2">
            Un email de confirmation a ete envoye a <span className="font-semibold text-gray-900">{form.email}</span>
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Cliquez sur le lien dans l email pour activer votre compte. Verifiez aussi vos spams.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-blue-700 font-semibold mb-1">Apres confirmation :</p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>Connectez-vous avec votre email et mot de passe</li>
              <li>Publiez vos premieres annonces</li>
              <li>Gerez vos biens depuis votre dashboard</li>
            </ul>
          </div>
          <Link href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors">
            Retour a l accueil
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
              <p className="text-xs text-blue-600 font-medium">Benin 2026</p>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Espace professionnel</h1>
          <p className="text-gray-500 text-sm">Creez votre compte pour publier vos biens</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">

          {/* Etape 1 - Choix du profil */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 mb-4 text-center">Vous etes ?</h2>
              <div className="space-y-3">
                {ROLES.map(r => (
                  <button key={r.val} type="button"
                    onClick={() => { setForm(p => ({ ...p, role: r.val })); setStep(2) }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all text-left">
                    <span className="text-3xl">{r.icon}</span>
                    <div>
                      <p className="font-bold text-gray-900">{r.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                ))}
              </div>
              <div className="pt-4 text-center">
                <p className="text-xs text-gray-400">
                  Vous cherchez un bien ?{' '}
                  <Link href="/recherche" className="text-green-600 font-semibold hover:underline">
                    Parcourir les annonces
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Etape 2 - Formulaire */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Retour */}
              <button type="button" onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
                {ROLES.find(r => r.val === form.role)?.icon}{' '}
                {ROLES.find(r => r.val === form.role)?.label}
              </button>

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

              {form.role === 'agent' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nom de l agence *</label>
                  <input name="nom_agence" type="text" required placeholder="Nom de votre agence"
                    value={form.nom_agence} onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-400/30"/>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email *</label>
                <input name="email" type="email" required placeholder="votre@email.com"
                  value={form.email} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-400/30"/>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Telephone WhatsApp *</label>
                <input name="telephone" type="tel" required placeholder="+229 XX XX XX XX XX"
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
                ) : 'Creer mon compte professionnel'}
              </button>
            </form>
          )}

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

