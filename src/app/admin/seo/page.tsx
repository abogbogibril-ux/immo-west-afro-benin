'use client'

import { useState } from 'react'

export default function SeoAdmin() {
  const [form, setForm] = useState({
    titre: 'Immo West Afro Bénin | Location Immobilière au Bénin',
    description: 'Trouvez votre bien immobilier idéal au Bénin. Maisons, appartements, villas à louer à Cotonou, Abomey-Calavi, Porto-Novo.',
    keywords: 'immobilier Bénin, location maison Cotonou, appartement à louer Bénin',
    og_image: '',
  })
  const [sauvegarde, setSauvegarde] = useState(false)

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>SEO & Référencement</h1>
        <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Optimisation pour les moteurs de recherche</p>
      </div>

      {sauvegarde && <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '600' }}>✅ SEO mis à jour !</div>}

      <div style={{ display: 'grid', gap: '1.5rem' }}>

        <div style={cardStyle}>
          <h2 style={sectionTitle}>🔍 Métadonnées principales</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Titre du site (60 caractères max)</label>
            <input value={form.titre} onChange={e => setForm({...form, titre: e.target.value})} style={inputStyle} />
            <p style={{ color: form.titre.length > 60 ? '#ef4444' : '#94a3b8', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{form.titre.length}/60 caractères</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Description (160 caractères max)</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
            <p style={{ color: form.description.length > 160 ? '#ef4444' : '#94a3b8', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{form.description.length}/160 caractères</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Mots-clés (séparés par des virgules)</label>
            <input value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Image Open Graph (URL)</label>
            <input value={form.og_image} placeholder="https://..." onChange={e => setForm({...form, og_image: e.target.value})} style={inputStyle} />
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitle}>🗺️ Sitemap & Indexation</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: '✅ Sitemap XML', desc: 'Généré automatiquement', url: '/sitemap.xml', color: '#dcfce7', textColor: '#16a34a' },
              { label: '✅ Robots.txt', desc: 'Configuré', url: '/robots.txt', color: '#dcfce7', textColor: '#16a34a' },
              { label: '✅ Google Search Console', desc: 'Propriété vérifiée', url: '#', color: '#dcfce7', textColor: '#16a34a' },
              { label: '🔄 Données structurées', desc: 'Schema.org — À implémenter', url: '#', color: '#fef3c7', textColor: '#d97706' },
            ].map(item => (
              <div key={item.label} style={{ backgroundColor: item.color, borderRadius: '10px', padding: '1rem' }}>
                <p style={{ color: item.textColor, fontWeight: '700', margin: 0, fontSize: '0.9rem' }}>{item.label}</p>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={() => { setSauvegarde(true); setTimeout(() => setSauvegarde(false), 3000) }} style={{
        marginTop: '1.5rem', padding: '1rem 2rem', backgroundColor: '#00bcd4',
        color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
      }}>
        💾 Sauvegarder le SEO
      </button>
    </div>
  )
}

const cardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
const sectionTitle: React.CSSProperties = { color: '#0f172a', fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f1f5f9' }
const labelStyle: React.CSSProperties = { display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.4rem' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }