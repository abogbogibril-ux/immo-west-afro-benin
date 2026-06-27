'use client'

import { useState } from 'react'

export default function ParametresAdmin() {
  const [form, setForm] = useState({
    nom_site: 'Immo West Afro Bénin',
    email_contact: 'contact@immowestafro.com',
    telephone: '+229 00 00 00 00',
    adresse: 'Cotonou, Bénin',
    facebook: '', instagram: '', twitter: '', whatsapp: '',
    mentions_legales: '', politique_confidentialite: '',
  })
  const [sauvegarde, setSauvegarde] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    setSauvegarde(true)
    setTimeout(() => setSauvegarde(false), 3000)
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Paramètres du site</h1>
        <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Configuration générale, contact et réseaux sociaux</p>
      </div>

      {sauvegarde && (
        <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '600' }}>
          ✅ Paramètres sauvegardés avec succès !
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* IDENTITÉ */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>🏠 Identité du site</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Nom du site</label>
            <input name="nom_site" value={form.nom_site} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Logo (URL)</label>
            <input name="logo_url" placeholder="https://..." onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        {/* CONTACT */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>📞 Informations de contact</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Email de contact</label>
            <input name="email_contact" value={form.email_contact} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Téléphone</label>
            <input name="telephone" value={form.telephone} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Adresse</label>
            <input name="adresse" value={form.adresse} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        {/* RÉSEAUX SOCIAUX */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>📱 Réseaux sociaux</h2>
          {[
            { name: 'facebook', label: '📘 Facebook', placeholder: 'https://facebook.com/...' },
            { name: 'instagram', label: '📸 Instagram', placeholder: 'https://instagram.com/...' },
            { name: 'twitter', label: '🐦 Twitter/X', placeholder: 'https://twitter.com/...' },
            { name: 'whatsapp', label: '💬 WhatsApp', placeholder: '+229...' },
          ].map(r => (
            <div key={r.name} style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>{r.label}</label>
              <input name={r.name} placeholder={r.placeholder} onChange={handleChange} style={inputStyle} />
            </div>
          ))}
        </div>

        {/* PAGES LÉGALES */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>📄 Pages légales</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Mentions légales</label>
            <textarea name="mentions_legales" placeholder="Contenu des mentions légales..."
              onChange={handleChange} style={{ ...inputStyle, height: '100px', resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Politique de confidentialité</label>
            <textarea name="politique_confidentialite" placeholder="Politique de confidentialité..."
              onChange={handleChange} style={{ ...inputStyle, height: '100px', resize: 'vertical' }} />
          </div>
        </div>
      </div>

      <button onClick={handleSubmit} style={{
        marginTop: '1.5rem', padding: '1rem 2rem', backgroundColor: '#00bcd4',
        color: '#fff', border: 'none', borderRadius: '8px',
        fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
      }}>
        💾 Sauvegarder les paramètres
      </button>
    </div>
  )
}

const cardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
const sectionTitle: React.CSSProperties = { color: '#0f172a', fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f1f5f9' }
const labelStyle: React.CSSProperties = { display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.4rem' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }