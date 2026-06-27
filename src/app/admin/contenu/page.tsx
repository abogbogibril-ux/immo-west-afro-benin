'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const VILLES_BENIN = ['Cotonou','Abomey-Calavi','Porto-Novo','Sèmè-Kpodji','Parakou','Bohicon','Ouidah','Lokossa','Abomey','Djougou','Comè','Azovè','Klouékanmey','Agbangnizoun','Natitingou']

export default function ContenuAdmin() {
  const [onglet, setOnglet] = useState<'villes' | 'categories'>('villes')
  const [nouvelleVille, setNouvelleVille] = useState('')
  const [villes, setVilles] = useState(VILLES_BENIN)

  const ajouterVille = () => {
    if (!nouvelleVille.trim()) return
    setVilles([...villes, nouvelleVille.trim()])
    setNouvelleVille('')
  }

  const supprimerVille = (ville: string) => {
    if (!confirm(`Supprimer "${ville}" ?`)) return
    setVilles(villes.filter(v => v !== ville))
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Gestion du contenu</h1>
        <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Villes, quartiers, catégories et pages institutionnelles</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[{ key: 'villes', label: '🗺️ Villes' }, { key: 'categories', label: '🏷️ Catégories' }].map(o => (
          <button key={o.key} onClick={() => setOnglet(o.key as any)} style={{
            padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
            backgroundColor: onglet === o.key ? '#00bcd4' : '#fff',
            color: onglet === o.key ? '#fff' : '#64748b',
            fontWeight: '600', fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>{o.label}</button>
        ))}
      </div>

      {onglet === 'villes' && (
        <div style={cardStyle}>
          <h2 style={sectionTitle}>🗺️ Gestion des villes du Bénin</h2>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input value={nouvelleVille} onChange={e => setNouvelleVille(e.target.value)}
              placeholder="Nouvelle ville..." style={{ ...inputStyle, flex: 1 }} />
            <button onClick={ajouterVille} style={{
              padding: '0.6rem 1.25rem', backgroundColor: '#00bcd4', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
            }}>+ Ajouter</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {villes.map(ville => (
              <div key={ville} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#374151', fontSize: '0.875rem', fontWeight: '500' }}>📍 {ville}</span>
                <button onClick={() => supprimerVille(ville)} style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {onglet === 'categories' && (
        <div style={cardStyle}>
          <h2 style={sectionTitle}>🏷️ Types de biens</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {['Maison', 'Appartement', 'Villa', 'Terrain', 'Bureau', 'Studio', 'Chambre', 'Duplex', 'Entrepôt'].map(cat => (
              <div key={cat} style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', color: '#374151', fontSize: '0.875rem', fontWeight: '500' }}>
                🏠 {cat}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const cardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
const sectionTitle: React.CSSProperties = { color: '#0f172a', fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f1f5f9' }
const inputStyle: React.CSSProperties = { padding: '0.6rem 0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const }