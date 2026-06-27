'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ContactPage() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [envoye, setEnvoye] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setEnvoye(true)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* HERO */}
      <section style={{ backgroundColor: '#0f172a', padding: '4rem 2rem', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '800', marginBottom: '1rem' }}>
          Contactez-nous
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
          Une question ? Nous sommes l&agrave; pour vous aider.
        </p>
      </section>

      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>

          {/* INFOS */}
          <div>
            <h2 style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: '700', marginBottom: '2rem' }}>
              Nos coordonn&eacute;es
            </h2>
            {[
              { icon: '📍', titre: 'Adresse', texte: 'Cotonou, Bénin' },
              { icon: '📞', titre: 'Téléphone', texte: '+229 00 00 00 00' },
              { icon: '✉️', titre: 'Email', texte: 'contact@immowestafro.com' },
              { icon: '🕐', titre: 'Horaires', texte: 'Lun - Ven : 8h - 18h' },
            ].map((info) => (
              <div key={info.titre} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '48px', height: '48px', backgroundColor: '#e0f7fa',
                  borderRadius: '12px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0,
                }}>{info.icon}</div>
                <div>
                  <p style={{ color: '#0f172a', fontWeight: '600', marginBottom: '0.25rem' }}>{info.titre}</p>
                  <p style={{ color: '#64748b' }}>{info.texte}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FORMULAIRE */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            {!envoye ? (
              <>
                <h2 style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                  Envoyer un message
                </h2>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Nom complet</label>
                  <input name="nom" type="text" placeholder="Jean Dupont" onChange={handleChange} style={inputStyle} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Email</label>
                  <input name="email" type="email" placeholder="email@exemple.com" onChange={handleChange} style={inputStyle} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Sujet</label>
                  <input name="sujet" type="text" placeholder="Votre sujet" onChange={handleChange} style={inputStyle} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Message</label>
                  <textarea name="message" placeholder="Votre message..." onChange={handleChange}
                    style={{ ...inputStyle, height: '120px', resize: 'vertical' }} />
                </div>
                <button onClick={handleSubmit} disabled={loading} style={{
                  width: '100%', padding: '0.875rem', backgroundColor: loading ? '#94a3b8' : '#00bcd4',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                  {loading ? 'Envoi...' : 'Envoyer le message'}
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ color: '#0f172a', fontWeight: '700', marginBottom: '0.5rem' }}>Message envoy&eacute; !</h3>
                <p style={{ color: '#64748b' }}>Nous vous r&eacute;pondrons dans les plus brefs d&eacute;lais.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#374151',
  fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.4rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem',
  backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
  borderRadius: '8px', color: '#0f172a', fontSize: '0.95rem',
  outline: 'none', boxSizing: 'border-box',
}