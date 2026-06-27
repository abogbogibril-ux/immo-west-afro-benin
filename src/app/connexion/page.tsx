'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ConnexionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ email: '', mot_de_passe: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.mot_de_passe,
    })
    if (error) {
      setLoading(false)
      setMessage('Erreur : ' + error.message)
      return
    }
    // Vérifier le rôle
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    setLoading(false)
    if (profile?.role === 'admin') router.push('/admin')
    else if (profile?.role === 'agent') router.push('/dashboard')
    else router.push('/')
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        backgroundColor: '#1e293b', borderRadius: '16px',
        padding: '2.5rem', width: '100%', maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        {/* ICÔNE */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '64px', height: '64px', backgroundColor: '#00bcd4',
            borderRadius: '16px', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
          }}>🔐</div>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginTop: '0.75rem' }}>
            Connexion
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Pas de compte ?{' '}
            <Link href="/inscription" style={{ color: '#00bcd4', textDecoration: 'none' }}>
              S&apos;inscrire
            </Link>
          </p>
        </div>

        {/* EMAIL */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Email</label>
          <input name="email" type="email" placeholder="email@exemple.com"
            onChange={handleChange} style={inputStyle} />
        </div>

        {/* MOT DE PASSE */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={labelStyle}>Mot de passe</label>
          <input name="mot_de_passe" type="password" placeholder="••••••••"
            onChange={handleChange} style={inputStyle} />
        </div>

        {/* MOT DE PASSE OUBLIÉ */}
        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
          <Link href="/mot-de-passe-oublie" style={{
            color: '#00bcd4', fontSize: '0.85rem', textDecoration: 'none',
          }}>
            Mot de passe oubli&eacute; ?
          </Link>
        </div>

        {/* MESSAGE */}
        {message && (
          <div style={{
            padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem',
            backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '0.85rem',
          }}>{message}</div>
        )}

        {/* BOUTON */}
        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: '0.875rem',
          backgroundColor: loading ? '#475569' : '#00bcd4',
          color: '#fff', border: 'none', borderRadius: '8px',
          fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#cbd5e1',
  fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.4rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem',
  backgroundColor: '#0f172a', border: '1px solid #334155',
  borderRadius: '8px', color: '#fff', fontSize: '0.95rem',
  outline: 'none', boxSizing: 'border-box',
}