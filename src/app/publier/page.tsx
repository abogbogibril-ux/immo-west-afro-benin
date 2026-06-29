'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const VILLES = ['Cotonou','Abomey-Calavi','Porto-Novo','S\u00e8m\u00e8-Kpodji','Parakou','Bohicon','Ouidah','Lokossa','Abomey','Djougou','Com\u00e8','Azov\u00e8','Natitingou']
const TYPES = ['Maison','Appartement','Villa','Terrain','Bureau','Studio','Chambre']
const MAX_PHOTOS = 8

export default function PublierPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [cguAccepted, setCguAccepted] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    titre: '', description: '', type_bien: '', transaction: 'vente', prix: '',
    ville: '', arrondissement: '', quartier: '', surface: '',
    nb_pieces: '', nb_chambres: '', nb_salles_bain: '',
    video_url: '',
    meuble: false, parking: false, terrasse: false,
    securite: false, eau: false, electricite: false, disponible_immediat: true,
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/connexion'); return }
      setUserId(user.id)
    })
  }, [])

  useEffect(() => {
    return () => previews.forEach(url => URL.revokeObjectURL(url))
  }, [previews])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    const value = target.type === 'checkbox' ? target.checked : target.value
    setForm({ ...form, [target.name]: value })
  }

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = MAX_PHOTOS - photos.length
    const newFiles = files.slice(0, remaining)
    const valid = newFiles.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
    const newPreviews = valid.map(f => URL.createObjectURL(f))
    setPhotos(prev => [...prev, ...valid])
    setPreviews(prev => [...prev, ...newPreviews])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadPhotos = async (bienId: string): Promise<string[]> => {
    const urls: string[] = []
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i]
      const ext = file.name.split('.').pop()
      const path = `${userId}/${bienId}/${Date.now()}_${i}.${ext}`
      const { error } = await supabase.storage
        .from('biens-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })
      if (!error) {
        const { data } = supabase.storage.from('biens-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
      setUploadProgress(Math.round(((i + 1) / photos.length) * 100))
    }
    return urls
  }

  const handleSubmit = async () => {
    if (!userId) return
    if (!cguAccepted) {
      setMessage('Erreur : Vous devez accepter les CGU avant de publier un bien.')
      return
    }
    if (!form.titre || !form.prix || !form.ville || !form.type_bien) {
      setMessage('Veuillez remplir les champs obligatoires (titre, type, ville, prix).')
      return
    }
    setLoading(true)
    setMessage('')

    const { data: bien, error } = await supabase.from('biens').insert({
      agent_id: userId,
      titre: form.titre,
      description: form.description,
      type_bien: form.type_bien,
      transaction: form.transaction,
      prix: parseInt(form.prix),
      ville: form.ville,
      arrondissement: form.arrondissement,
      quartier: form.quartier,
      surface: form.surface ? parseFloat(form.surface) : null,
      nb_pieces: form.nb_pieces ? parseInt(form.nb_pieces) : null,
      nb_chambres: form.nb_chambres ? parseInt(form.nb_chambres) : null,
      nb_salles_bain: form.nb_salles_bain ? parseInt(form.nb_salles_bain) : null,
      meuble: form.meuble, parking: form.parking, terrasse: form.terrasse,
      securite: form.securite, eau: form.eau, electricite: form.electricite,
      disponible_immediat: form.disponible_immediat,
      video_url: form.video_url || null,
      statut: 'brouillon',
    }).select().single()

    if (error) {
      setLoading(false)
      setMessage('Erreur : ' + error.message)
      return
    }

    if (photos.length > 0) {
      setMessage('Upload des photos en cours...')
      const urls = await uploadPhotos(bien.id)
      if (urls.length > 0) {
        await supabase.from('images_biens').insert(
          urls.map((url, i) => ({
            bien_id: bien.id,
            url,
            ordre: i,
            is_principale: i === 0,
          }))
        )
      }
    }

    setLoading(false)
    setMessage('Bien publi\u00e9 avec succ\u00e8s !')
    setTimeout(() => router.push('/dashboard/agent'), 2000)
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
          <h2 style={sectionTitle}>Informations principales</h2>
          <div style={gridTwo}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Titre du bien *</label>
              <input name="titre" type="text" placeholder="Ex: Belle villa 4 chambres \u00e0 Cotonou"
                onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Transaction *</label>
              <select name="transaction" onChange={handleChange} style={inputStyle} value={form.transaction}>
                <option value="vente">Vente</option>
                <option value="location">Location</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Type de bien *</label>
              <select name="type_bien" onChange={handleChange} style={inputStyle}>
                <option value="">S\u00e9lectionner...</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              {form.transaction === 'location'
                ? <label style={labelStyle}>Prix mensuel (FCFA/mois) *</label>
                : <label style={labelStyle}>Prix de vente (FCFA) *</label>}
              <input name="prix" type="number" placeholder="150000"
                onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" placeholder="D\u00e9crivez votre bien en d\u00e9tail..."
                onChange={handleChange} style={{ ...inputStyle, height: '100px', resize: 'vertical' }} />
            </div>
          </div>

          {/* PHOTOS */}
          <h2 style={sectionTitle}>Photos du bien</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Maximum {MAX_PHOTOS} photos &middot; 5 MB par photo &middot; La 1\u00e8re photo sera la photo principale
          </p>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '2rem',
              textAlign: 'center', cursor: photos.length >= MAX_PHOTOS ? 'not-allowed' : 'pointer',
              backgroundColor: photos.length >= MAX_PHOTOS ? '#f1f5f9' : '#f8fafc',
              marginBottom: '1rem', transition: 'all 0.2s',
            }}
          >
            <p style={{ color: '#475569', fontWeight: '600', marginBottom: '0.25rem' }}>
              {photos.length >= MAX_PHOTOS
                ? `Maximum atteint (${MAX_PHOTOS} photos)`
                : 'Cliquez pour ajouter des photos'}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              JPG, PNG, WEBP &middot; {photos.length}/{MAX_PHOTOS} photo{photos.length > 1 ? 's' : ''} s\u00e9lectionn\u00e9e{photos.length > 1 ? 's' : ''}
            </p>
            <input ref={fileInputRef} type="file" accept="image/*" multiple
              onChange={handlePhotos} disabled={photos.length >= MAX_PHOTOS}
              style={{ display: 'none' }} />
          </div>

          {previews.length > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '0.75rem', marginBottom: '1.5rem',
            }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1' }}>
                  <img src={src} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {i === 0 && (
                    <div style={{
                      position: 'absolute', top: '4px', left: '4px',
                      backgroundColor: '#00bcd4', color: '#fff',
                      fontSize: '0.65rem', fontWeight: '700', padding: '2px 6px', borderRadius: '4px',
                    }}>PRINCIPALE</div>
                  )}
                  <button onClick={() => removePhoto(i)} style={{
                    position: 'absolute', top: '4px', right: '4px',
                    width: '22px', height: '22px', backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#fff', border: 'none', borderRadius: '50%',
                    cursor: 'pointer', fontSize: '0.7rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>&times;</button>
                </div>
              ))}
            </div>
          )}

          {loading && uploadProgress > 0 && uploadProgress < 100 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Upload photos...</span>
                <span style={{ fontSize: '0.8rem', color: '#00bcd4', fontWeight: '600' }}>{uploadProgress}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', backgroundColor: '#00bcd4', borderRadius: '99px',
                  width: `${uploadProgress}%`, transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          )}

          {/* VIDEO */}
          <h2 style={sectionTitle}>Visite vid\u00e9o (optionnel)</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Collez un lien YouTube ou Vimeo pour offrir une visite virtuelle de votre bien.
          </p>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Lien de la vid\u00e9o</label>
            <input
              name="video_url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              onChange={handleChange}
              style={inputStyle}
            />
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.4rem' }}>
              Exemple : https://www.youtube.com/watch?v=XXXXXXXXX
            </p>
          </div>

          {/* LOCALISATION */}
          <h2 style={sectionTitle}>Localisation</h2>
          <div style={gridTwo}>
            <div>
              <label style={labelStyle}>Ville *</label>
              <select name="ville" onChange={handleChange} style={inputStyle}>
                <option value="">S\u00e9lectionner...</option>
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
              <label style={labelStyle}>Surface (m&sup2;)</label>
              <input name="surface" type="number" placeholder="120"
                onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* CARACTERISTIQUES */}
          <h2 style={sectionTitle}>Caract\u00e9ristiques</h2>
          <div style={gridTwo}>
            <div>
              <label style={labelStyle}>Nb. pi\u00e8ces</label>
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

          {/* EQUIPEMENTS */}
          <h2 style={sectionTitle}>\u00c9quipements</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { name: 'meuble', label: 'Meubl\u00e9' },
              { name: 'parking', label: 'Parking' },
              { name: 'terrasse', label: 'Terrasse' },
              { name: 'securite', label: 'S\u00e9curit\u00e9' },
              { name: 'eau', label: 'Eau' },
              { name: 'electricite', label: '\u00c9lectricit\u00e9' },
              { name: 'disponible_immediat', label: 'Dispo. imm\u00e9diat' },
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

          {/* CGU */}
          <div style={{
            marginBottom: '1.25rem', padding: '1rem',
            backgroundColor: cguAccepted ? '#f0fdf4' : '#f8fafc',
            border: `1px solid ${cguAccepted ? '#86efac' : '#e2e8f0'}`,
            borderRadius: '8px', transition: 'all 0.2s',
          }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <div style={{ position: 'relative', flexShrink: 0, marginTop: '2px' }}>
                <input type="checkbox" checked={cguAccepted}
                  onChange={e => { setCguAccepted(e.target.checked); if (message.includes('CGU')) setMessage('') }}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                <div style={{
                  width: '18px', height: '18px', borderRadius: '4px',
                  border: `2px solid ${cguAccepted ? '#16a34a' : '#cbd5e1'}`,
                  backgroundColor: cguAccepted ? '#16a34a' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {cguAccepted && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <span style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.6' }}>
                En publiant cette annonce, je certifie \u00eatre propri\u00e9taire ou mandat\u00e9 pour ce bien
                et j&apos;accepte les{' '}
                <Link href="/cgu" target="_blank"
                  style={{ color: '#00bcd4', textDecoration: 'underline', fontWeight: '500' }}
                  onClick={e => e.stopPropagation()}>
                  Conditions G\u00e9n\u00e9rales d&apos;Utilisation
                </Link>
                {' '}d&apos;Immo West Afro.{' '}
                <span style={{ color: '#ef4444' }}>*</span>
              </span>
            </label>
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

          {/* BOUTON */}
          <button onClick={handleSubmit} disabled={loading || !cguAccepted}
            style={{
              width: '100%', padding: '1rem',
              backgroundColor: loading || !cguAccepted ? '#e2e8f0' : '#00bcd4',
              color: !cguAccepted ? '#94a3b8' : '#fff',
              border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '700',
              cursor: loading || !cguAccepted ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
            }}>
            {loading ? 'Publication en cours...' : 'Publier mon bien'}
          </button>

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.75rem' }}>
            <span style={{ color: '#ef4444' }}>*</span> Champ obligatoire
          </p>

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