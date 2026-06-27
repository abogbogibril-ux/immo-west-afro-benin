'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const VILLES = ['Cotonou','Abomey-Calavi','Porto-Novo','Sèmè-Kpodji','Parakou','Bohicon','Ouidah','Lokossa','Abomey','Djougou','Comè','Azovè','Natitingou']
const TYPES = ['Maison','Appartement','Villa','Terrain','Bureau','Studio','Chambre']

export default function PublierPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [form, setForm] = useState({
    titre: '', description: '', type_bien: '', prix: '',
    ville: '', arrondissement: '', quartier: '', surface: '',
    nb_pieces: '', nb_chambres: '', nb_salles_bain: '',
    meuble: false, parking: false, terrasse: false,
    securite: false, eau: false, electricite: false, disponible_immediat: true,
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/connexion'); return }
      setUserId(user.id)
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    const value = target.type === 'checkbox' ? target.checked : target.value
    setForm({ ...form, [target.name]: value })
  }

  const handleSubmit = async () => {
    if (!userId) return
    if (!form.titre || !form.prix || !form.ville || !form.type_bien) {
      setMessage('Veuillez remplir les champs obligatoires (titre, type, ville, prix).')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('biens').insert({
      agent_id: userId,
      titre: form.titre,
      description: form.description,
      type_bien: form.type_bien,
      prix: parseInt(form.prix),
      ville: form.ville,
      arrondissement: form.arrondissement,
      quartier: form.quartier,
      surface: form.surface ? parseFloat(form.surface) : null,
      nb_pieces: form.nb_pieces ? parseInt(form.nb_pieces) : null,
      nb_chambres: form.nb_chambres ? parseInt(form.nb_chambres) : null,
      nb_salles_bain: form.nb_salles_bain ? parseInt(form.nb_salles_bain) : null,
      meuble: form.meuble,
      parking: form.parking,
      terrasse: form.terrasse,
      securite: form.securite,
      eau: form.eau,
      electricite: form.electricite,
      disponible_immediat: form.disponible_immediat,
    })
    setLoading(false)
    if (error) setMessage('Erreur : ' + error.message)
    else { setMessage('Bien publié avec succès !'); setTimeout(() => router.push('/dashboard'), 2000) }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ color: '#0f172a', fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>
          Publier un bien
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Remplissez les informations de votre bien immobilier.</p>

        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

          {/* INFOS PRINCIPALES */}
          <h2 style={sectionTitle}>📋 Informations principales</h2>
          <div style={gridTwo}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Titre du bien *</label>
              <input name="titre" type="text" placeholder="Ex: Belle villa 4 chambres à Cotonou"
                onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Type de bien *</label>
              <select name="type_bien" onChange={handleChange} style={inputStyle}>
                <option value="">Sélectionner...</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Prix mensuel (FCFA) *</label>
              <input name="prix" type="number" placeholder="150000"
                onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" placeholder="Décrivez votre bien en détail..."
                onChange={handleChange} style={{ ...inputStyle, height: '100px', resize: 'vertical' }} />
            </div>
          </div>

          {/* LOCALISATION */}
          <h2 style={sectionTitle}>📍 Localisation</h2>
          <div style={gridTwo}>
            <div>
              <label style={labelStyle}>Ville *</label>
              <select name="ville" onChange={handleChange} style={inputStyle}>
                <option value="">Sélectionner...</option>
                {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Arrondissement</label>
              <input name="arrondissement" type="text" placeholder="Ex: Akpakpa"
                onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Quartier</label>
              <input name="quartier" type="text" placeholder="Ex: Cadjehoun"
                onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Surface (m²)</label>
              <input name="surface" type="number" placeholder="120"
                onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* CARACTÉRISTIQUES */}
          <h2 style={sectionTitle}>🏠 Caractéristiques</h2>
          <div style={gridTwo}>
            <div>
              <label style={labelStyle}>Nb. pièces</label>
              <input name="nb_pieces" type="number" placeholder="5"
                onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nb. chambres</label>
              <input name="nb_chambres" type="number" placeholder="3"
                onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nb. salles de bain</label>
              <input name="nb_salles_bain" type="number" placeholder="2"
                onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* ÉQUIPEMENTS */}
          <h2 style={sectionTitle}>✅ Équipements</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { name: 'meuble', label: '🛋️ Meublé' },
              { name: 'parking', label: '🚗 Parking' },
              { name: 'terrasse', label: '🌿 Terrasse' },
              { name: 'securite', label: '🔒 Sécurité' },
              { name: 'eau', label: '💧 Eau' },
              { name: 'electricite', label: '⚡ Électricité' },
              { name: 'disponible_immediat', label: '✅ Dispo. immédiat' },
            ].map((eq) => (
              <label key={eq.name} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px',
                cursor: 'pointer', color: '#374151', fontSize: '0.9rem',
              }}>
                <input type="checkbox" name={eq.name}
                  defaultChecked={eq.name === 'disponible_immediat'}
                  onChange={handleChange} style={{ width: '16px', height: '16px' }} />
                {eq.label}
              </label>
            ))}
          </div>

          {/* MESSAGE */}
          {message && (
            <div style={{
              padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem',
              backgroundColor: message.includes('Erreur') ? '#fee2e2' : '#dcfce7',
              color: message.includes('Erreur') ? '#dc2626' : '#16a34a',
              fontSize: '0.9rem',
            }}>{message}</div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '1rem', backgroundColor: loading ? '#94a3b8' : '#00bcd4',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Publication...' : '🚀 Publier mon bien'}
          </button>
        </div>
      </div>
    </div>
  )
}

const sectionTitle: React.CSSProperties = {
  color: '#0f172a', fontSize: '1rem', fontWeight: '700',
  marginBottom: '1rem', marginTop: '1.5rem', paddingBottom: '0.5rem',
  borderBottom: '2px solid #e2e8f0',
}
const gridTwo: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1rem', marginBottom: '1rem',
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