'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [envoye, setEnvoye] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://benin.immowestafro.com/nouveau-mot-de-passe',
    })
    setLoading(false)
    if (error) setMessage('Erreur : ' + error.message)
    else {
      setEnvoye(true)
      setMessage('Email envoyé ! Vérifiez votre boîte mail.')
    }
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
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '64px', height: '64px', backgroundColor: '#f59e0b',
            borderRadius: '16px', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
          }}>🔑</div>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginTop: '0.75rem' }}>
            Mot de passe oubli&eacute; ?
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Entrez votre email pour recevoir un lien de r&eacute;initialisation.
          </p>
        </div>

        {!envoye ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Adresse email</label>
              <input
                type="email"
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>

            {message && (
              <div style={{
                padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem',
                backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '0.85rem',
              }}>{message}</div>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{
              width: '100%', padding: '0.875rem',
              backgroundColor: loading ? '#475569' : '#f59e0b',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </button>
          </>
        ) : (
          <div style={{
            textAlign: 'center', padding: '1.5rem',
            backgroundColor: '#052e16', borderRadius: '12px',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📧</div>
            <p style={{ color: '#86efac', fontWeight: '600', marginBottom: '0.5rem' }}>
              Email envoy&eacute; !
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              V&eacute;rifiez votre boîte mail et cliquez sur le lien re&ccedil;u.
            </p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/connexion" style={{ color: '#00bcd4', fontSize: '0.9rem', textDecoration: 'none' }}>
            ← Retour &agrave; la connexion
          </Link>
        </div>
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