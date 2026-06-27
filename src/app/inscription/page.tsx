'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function InscriptionPage() {
  const [typeCompte, setTypeCompte] = useState<'client' | 'agent'>('client')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    nom_complet: '', email: '', telephone: '',
    mot_de_passe: '', nom_agence: '', biographie: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.mot_de_passe,
      options: {
        data: {
          nom_complet: form.nom_complet,
          telephone: form.telephone,
          role: typeCompte,
          nom_agence: form.nom_agence,
          biographie: form.biographie,
        }
      }
    })
    setLoading(false)
    if (error) setMessage('Erreur : ' + error.message)
    else setMessage('Compte créé ! Vérifiez votre email pour confirmer.')
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        backgroundColor: '#1e293b', borderRadius: '16px',
        padding: '2.5rem', width: '100%', maxWidth: '480px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        {/* ICÔNE */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '64px', height: '64px', backgroundColor: '#00bcd4',
            borderRadius: '16px', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
          }}>👤</div>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginTop: '0.75rem' }}>
            Cr&eacute;er un compte
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            D&eacute;j&agrave; un compte ?{' '}
            <Link href="/connexion" style={{ color: '#00bcd4', textDecoration: 'none' }}>Connexion</Link>
          </p>
        </div>

        {/* TYPE DE COMPTE */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Type de compte</label>
          <select
            value={typeCompte}
            onChange={(e) => setTypeCompte(e.target.value as 'client' | 'agent')}
            style={inputStyle}
          >
            <option value="client">Client</option>
            <option value="agent">Agent immobilier</option>
          </select>
        </div>

        {/* CHAMPS COMMUNS */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Nom complet</label>
          <input name="nom_complet" type="text" placeholder="Jean Dupont"
            onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Email</label>
          <input name="email" type="email" placeholder="email@exemple.com"
            onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>T&eacute;l&eacute;phone</label>
          <input name="telephone" type="tel" placeholder="+229 00 00 00 00"
            onChange={handleChange} style={inputStyle} />
        </div>

        {/* CHAMPS AGENT UNIQUEMENT */}
        {typeCompte === 'agent' && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Nom de l&apos;agence</label>
              <input name="nom_agence" type="text" placeholder="Agence Immobilière XYZ"
                onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Biographie</label>
              <textarea name="biographie" placeholder="Décrivez votre expérience..."
                onChange={handleChange}
                style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
            </div>
          </>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Mot de passe</label>
          <input name="mot_de_passe" type="password" placeholder="••••••••"
            onChange={handleChange} style={inputStyle} />
        </div>

        {/* MESSAGE */}
        {message && (
          <div style={{
            padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem',
            backgroundColor: message.includes('Erreur') ? '#fee2e2' : '#dcfce7',
            color: message.includes('Erreur') ? '#dc2626' : '#16a34a',
            fontSize: '0.85rem',
          }}>{message}</div>
        )}

        {/* BOUTON */}
        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: '0.875rem',
          backgroundColor: loading ? '#475569' : '#00bcd4',
          color: '#fff', border: 'none', borderRadius: '8px',
          fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          {loading ? 'Création...' : 'Créer mon compte'}
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