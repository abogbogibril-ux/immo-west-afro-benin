'use client'

import { useState } from 'react'

export default function SeoAdmin() {
  const [form, setForm] = useState({
    titre: 'Immo West Afro Benin | Location Immobiliere au Benin',
    description: 'Trouvez votre bien immobilier ideal au Benin. Maisons, appartements, villas a louer a Cotonou, Abomey-Calavi, Porto-Novo.',
    keywords: 'immobilier Benin, location maison Cotonou, appartement a louer Benin',
    og_image: '',
  })
  const [toast, setToast] = useState(false)

  const sauvegarder = () => {
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 50, backgroundColor: '#16a34a', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          SEO sauvegarde avec succes !
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>SEO et Referencement</h1>
        <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Optimisation pour les moteurs de recherche</p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>

        <div style={cardStyle}>
          <h2 style={sectionTitle}>Metadonnees principales</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Titre du site (60 caracteres max)</label>
            <input value={form.titre} onChange={e => setForm({...form, titre: e.target.value})} style={inputStyle} />
            <p style={{ color: form.titre.length > 60 ? '#ef4444' : '#94a3b8', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{form.titre.length}/60 caracteres</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Description (160 caracteres max)</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
            <p style={{ color: form.description.length > 160 ? '#ef4444' : '#94a3b8', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{form.description.length}/160 caracteres</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Mots-cles (separes par des virgules)</label>
            <input value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Image Open Graph (URL)</label>
            <input value={form.og_image} placeholder="https://..." onChange={e => setForm({...form, og_image: e.target.value})} style={inputStyle} />
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitle}>Sitemap et Indexation</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Sitemap XML', desc: 'Genere automatiquement', url: '/sitemap.xml', ok: true },
              { label: 'Robots.txt', desc: 'Configure', url: '/robots.txt', ok: true },
              { label: 'Google Search Console', desc: 'Propriete verifiee', url: '#', ok: true },
              { label: 'Donnees structurees', desc: 'Schema.org JSON-LD implemente', url: '#', ok: true },
            ].map(item => (
              <div key={item.label} style={{ backgroundColor: '#dcfce7', borderRadius: '10px', padding: '1rem' }}>
                <p style={{ color: '#16a34a', fontWeight: '700', margin: 0, fontSize: '0.9rem' }}>✅ {item.label}</p>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={sauvegarder} style={{
        marginTop: '1.5rem', padding: '1rem 2rem', backgroundColor: '#00bcd4',
        color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
      }}>
        Sauvegarder le SEO
      </button>
    </div>
  )
}

const cardStyle: React.CSSProperties = { backgroundColor: '#1e293b', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }
const sectionTitle: React.CSSProperties = { color: '#fff', fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #334155' }
const labelStyle: React.CSSProperties = { display: 'block', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.4rem' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }