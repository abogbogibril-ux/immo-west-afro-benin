'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AIGenerateur from '@/components/AIGenerateur'

const VILLES = ['Cotonou','Abomey-Calavi','Porto-Novo','Sème-Kpodji','Parakou','Bohicon','Ouidah','Lokossa','Abomey','Djougou','Comè','Azovè','Natitingou']
const TYPES = ['Maison','Appartement','Villa','Terrain','Bureau','Studio','Chambre']
const MAX_PHOTOS = 8

export default function PublierPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditMode = !!editId

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEditMode)
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [cguAccepted, setCguAccepted] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [existingPhotos, setExistingPhotos] = useState<{url: string, ordre: number}[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAIGenerated = (titre: string, description: string) => {
    setForm(prev => ({ ...prev, titre, description }))
  }
  const [form, setForm] = useState({
    titre: '', description: '', type_bien: '', transaction: 'vente', prix: '',
    ville: '', arrondissement: '', quartier: '', surface: '',
    nb_pieces: '', nb_chambres: '', nb_salles_bain: '',
    video_url: '',
    meuble: false, parking: false, terrasse: false,
    securite: false, eau: false, electricite: false, disponible_immediat: true,
  })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/connexion'); return }
      setUserId(user.id)

      if (isEditMode && editId) {
        const { data, error } = await supabase
          .from('biens')
          .select('*, images_biens(url, ordre)')
          .eq('id', editId)
          .eq('agent_id', user.id)
          .single()

        if (error || !data) {
          setMessage('Erreur : bien introuvable ou accès non autorisé.')
          setLoadingData(false)
          return
        }

        setForm({
          titre: data.titre ?? '',
          description: data.description ?? '',
          type_bien: data.type_bien ?? '',
          transaction: data.transaction ?? 'vente',
          prix: data.prix?.toString() ?? '',
          ville: data.ville ?? '',
          arrondissement: data.arrondissement ?? '',
          quartier: data.quartier ?? '',
          surface: data.surface?.toString() ?? '',
          nb_pieces: data.nb_pieces?.toString() ?? '',
          nb_chambres: data.nb_chambres?.toString() ?? '',
          nb_salles_bain: data.nb_salles_bain?.toString() ?? '',
          video_url: data.video_url ?? '',
          meuble: data.meuble ?? false,
          parking: data.parking ?? false,
          terrasse: data.terrasse ?? false,
          securite: data.securite ?? false,
          eau: data.eau ?? false,
          electricite: data.electricite ?? false,
          disponible_immediat: data.disponible_immediat ?? true,
        })

        const imgs = [...(data.images_biens ?? [])].sort((a: any, b: any) => a.ordre - b.ordre)
        setExistingPhotos(imgs)
        setCguAccepted(true)
        setLoadingData(false)
      }
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
    const totalExisting = existingPhotos.length + photos.length
    const remaining = MAX_PHOTOS - totalExisting
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

  const removeExistingPhoto = async (url: string) => {
    setExistingPhotos(prev => prev.filter(p => p.url !== url))
    if (isEditMode && editId) {
      await supabase.from('images_biens').delete().eq('bien_id', editId).eq('url', url)
    }
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

    const bienData = {
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
    }

    let bienId: string

    if (isEditMode && editId) {
      // MODE EDITION — UPDATE
      const { error } = await supabase
        .from('biens')
        .update(bienData)
        .eq('id', editId)
        .eq('agent_id', userId)

      if (error) {
        setLoading(false)
        setMessage('Erreur : ' + error.message)
        return
      }
      bienId = editId
    } else {
      // MODE CREATION — INSERT
      const { data: bien, error } = await supabase
        .from('biens')
        .insert({ ...bienData, agent_id: userId, statut: 'brouillon' })
        .select()
        .single()

      if (error) {
        setLoading(false)
        setMessage('Erreur : ' + error.message)
        return
      }
      bienId = bien.id
    }

    if (photos.length > 0) {
      setMessage('Upload des photos en cours...')
      const urls = await uploadPhotos(bienId)
      if (urls.length > 0) {
        const startOrdre = existingPhotos.length
        await supabase.from('images_biens').insert(
          urls.map((url, i) => ({
            bien_id: bienId,
            url,
            ordre: startOrdre + i,
          }))
        )
      }
    }

    setLoading(false)
    setMessage(isEditMode ? 'Modifications enregistrées !' : 'Brouillon enregistré !')
    setTimeout(() => router.push(`/dashboard/agent/apercu/${bienId}`), 1500)
  }

  if (loadingData) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#64748b' }}>Chargement du bien...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        {/* BANDEAU MODE EDITION */}
        {isEditMode && (
          <div style={{
            backgroundColor: '#fef9c3', border: '1px solid #fde047',
            borderRadius: '12px', padding: '0.75rem 1rem',
            marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span>✏️</span>
            <span style={{ fontSize: '0.875rem', color: '#854d0e', fontWeight: '600' }}>
              Mode édition — Modifiez votre brouillon puis enregistrez
            </span>
            <Link href={`/dashboard/agent/apercu/${editId}`}
              style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#92400e', textDecoration: 'underline' }}>
              Retour à l&apos;aperçu
            </Link>
          </div>
        )}

        <h1 style={{ color: '#0f172a', fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>
          {isEditMode ? 'Modifier le bien' : 'Publier un bien'}
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          {isEditMode ? 'Modifiez les informations et enregistrez.' : 'Remplissez les informations de votre bien immobilier.'}
        </p>

        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

          {/* INFOS PRINCIPALES */}
          <h2 style={sectionTitle}>Informations principales</h2>
          <div style={gridTwo}>
            <div style={{ gridColumn: '1/-1' }}>
              <AIGenerateur form={form} previews={previews} onGenerated={handleAIGenerated} />
              <label style={labelStyle}>Titre du bien *</label>
              <input name="titre" type="text" placeholder="Ex: Belle villa 4 chambres à Cotonou"
                value={form.titre} onChange={handleChange} style={inputStyle} />
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
              <select name="type_bien" onChange={handleChange} style={inputStyle} value={form.type_bien}>
                <option value="">Sélectionner...</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              {form.transaction === 'location'
                ? <label style={labelStyle}>Prix mensuel (FCFA/mois) *</label>
                : <label style={labelStyle}>Prix de vente (FCFA) *</label>}
              <input name="prix" type="number" placeholder="150000"
                value={form.prix} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" placeholder="Décrivez votre bien en détail..."
                value={form.description} onChange={handleChange}
                style={{ ...inputStyle, height: '100px', resize: 'vertical' }} />
            </div>
          </div>

          {/* PHOTOS EXISTANTES (mode édition) */}
          {isEditMode && existingPhotos.length > 0 && (
            <>
              <h2 style={sectionTitle}>Photos actuelles</h2>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '0.75rem', marginBottom: '1.5rem',
              }}>
                {existingPhotos.map((photo, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1' }}>
                    <img src={photo.url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {i === 0 && (
                      <div style={{
                        position: 'absolute', top: '4px', left: '4px',
                        backgroundColor: '#00bcd4', color: '#fff',
                        fontSize: '0.65rem', fontWeight: '700', padding: '2px 6px', borderRadius: '4px',
                      }}>PRINCIPALE</div>
                    )}
                    <button onClick={() => removeExistingPhoto(photo.url)} style={{
                      position: 'absolute', top: '4px', right: '4px',
                      width: '22px', height: '22px', backgroundColor: 'rgba(220,38,38,0.8)',
                      color: '#fff', border: 'none', borderRadius: '50%',
                      cursor: 'pointer', fontSize: '0.7rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>&times;</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* NOUVELLES PHOTOS */}
          <h2 style={sectionTitle}>{isEditMode ? 'Ajouter des photos' : 'Photos du bien'}</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Maximum {MAX_PHOTOS} photos &middot; 5 MB par photo &middot; La 1ère photo sera la photo principale
          </p>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '2rem',
              textAlign: 'center',
              cursor: (existingPhotos.length + photos.length) >= MAX_PHOTOS ? 'not-allowed' : 'pointer',
              backgroundColor: (existingPhotos.length + photos.length) >= MAX_PHOTOS ? '#f1f5f9' : '#f8fafc',
              marginBottom: '1rem', transition: 'all 0.2s',
            }}
          >
            <p style={{ color: '#475569', fontWeight: '600', marginBottom: '0.25rem' }}>
              {(existingPhotos.length + photos.length) >= MAX_PHOTOS
                ? `Maximum atteint (${MAX_PHOTOS} photos)`
                : 'Cliquez pour ajouter des photos'}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              JPG, PNG, WEBP &middot; {existingPhotos.length + photos.length}/{MAX_PHOTOS} photo{(existingPhotos.length + photos.length) > 1 ? 's' : ''}
            </p>
            <input ref={fileInputRef} type="file" accept="image/*" multiple
              onChange={handlePhotos}
              disabled={(existingPhotos.length + photos.length) >= MAX_PHOTOS}
              style={{ display: 'none' }} />
          </div>

          {previews.length > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '0.75rem', marginBottom: '1.5rem',
            }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1' }}>
                  <img src={src} alt={`Nouvelle photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', top: '4px', left: '4px',
                    backgroundColor: '#16a34a', color: '#fff',
                    fontSize: '0.6rem', fontWeight: '700', padding: '2px 6px', borderRadius: '4px',
                  }}>NOUVEAU</div>
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
          <h2 style={sectionTitle}>Visite vidéo (optionnel)</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Collez un lien YouTube ou Vimeo pour offrir une visite virtuelle de votre bien.
          </p>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Lien de la vidéo</label>
            <input name="video_url" type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.video_url} onChange={handleChange} style={inputStyle} />
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.4rem' }}>
              Exemple : https://www.youtube.com/watch?v=XXXXXXXXX
            </p>
          </div>

          {/* LOCALISATION */}
          <h2 style={sectionTitle}>Localisation</h2>
          <div style={gridTwo}>
            <div>
              <label style={labelStyle}>Ville *</label>
              <select name="ville" onChange={handleChange} style={inputStyle} value={form.ville}>
                <option value="">Sélectionner...</option>
                {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Arrondissement</label>
              <input name="arrondissement" type="text" placeholder="Ex: Akpakpa"
                value={form.arrondissement} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Quartier</label>
              <input name="quartier" type="text" placeholder="Ex: Cadjehoun"
                value={form.quartier} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Surface (m²)</label>
              <input name="surface" type="number" placeholder="120"
                value={form.surface} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* CARACTERISTIQUES */}
          <h2 style={sectionTitle}>Caractéristiques</h2>
          <div style={gridTwo}>
            <div>
              <label style={labelStyle}>Nb. pièces</label>
              <input name="nb_pieces" type="number" placeholder="5"
                value={form.nb_pieces} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nb. chambres</label>
              <input name="nb_chambres" type="number" placeholder="3"
                value={form.nb_chambres} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nb. salles de bain</label>
              <input name="nb_salles_bain" type="number" placeholder="2"
                value={form.nb_salles_bain} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* EQUIPEMENTS */}
          <h2 style={sectionTitle}>Équipements</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { name: 'meuble', label: 'Meublé' },
              { name: 'parking', label: 'Parking' },
              { name: 'terrasse', label: 'Terrasse' },
              { name: 'securite', label: 'Sécurité' },
              { name: 'eau', label: 'Eau' },
              { name: 'electricite', label: 'Électricité' },
              { name: 'disponible_immediat', label: 'Dispo. immédiat' },
            ].map((eq) => (
              <label key={eq.name} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                backgroundColor: (form as any)[eq.name] ? '#f0fdf4' : '#f8fafc',
                padding: '0.75rem', borderRadius: '8px',
                cursor: 'pointer', color: '#374151', fontSize: '0.9rem',
                border: `1px solid ${(form as any)[eq.name] ? '#86efac' : '#e2e8f0'}`,
              }}>
                <input type="checkbox" name={eq.name}
                  checked={(form as any)[eq.name]}
                  onChange={handleChange} style={{ width: '16px', height: '16px' }} />
                {eq.label}
              </label>
            ))}
          </div>

          {/* CGU */}
          {!isEditMode && (
            <div style={{
              marginBottom: '1.25rem', padding: '1rem',
              backgroundColor: cguAccepted ? '#f0fdf4' : '#f8fafc',
              border: `1px solid ${cguAccepted ? '#86efac' : '#e2e8f0'}`,
              borderRadius: '8px', transition: 'all 0.2s',
            }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={cguAccepted}
                  onChange={e => { setCguAccepted(e.target.checked); if (message.includes('CGU')) setMessage('') }}
                  style={{ marginTop: '3px', width: '16px', height: '16px' }} />
                <span style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.6' }}>
                  En publiant cette annonce, je certifie être propriétaire ou mandaté pour ce bien
                  et j&apos;accepte les{' '}
                  <Link href="/cgu" target="_blank"
                    style={{ color: '#00bcd4', textDecoration: 'underline', fontWeight: '500' }}
                    onClick={e => e.stopPropagation()}>
                    Conditions Générales d&apos;Utilisation
                  </Link>
                  {' '}d&apos;Immo West Afro.{' '}
                  <span style={{ color: '#ef4444' }}>*</span>
                </span>
              </label>
            </div>
          )}

          {/* MESSAGE */}
          {message && (
            <div style={{
              padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem',
              backgroundColor: message.includes('Erreur') ? '#fee2e2' : '#dcfce7',
              color: message.includes('Erreur') ? '#dc2626' : '#16a34a',
              fontSize: '0.9rem',
            }}>{message}</div>
          )}

          {/* BOUTONS */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {isEditMode && (
              <Link href={`/dashboard/agent/apercu/${editId}`}
                style={{
                  flex: '0 0 auto', padding: '1rem 1.5rem',
                  border: '2px solid #e2e8f0', borderRadius: '8px',
                  fontSize: '0.95rem', fontWeight: '600', color: '#64748b',
                  textDecoration: 'none', display: 'flex', alignItems: 'center',
                }}>
                Annuler
              </Link>
            )}
            <button onClick={handleSubmit} disabled={loading || !cguAccepted}
              style={{
                flex: 1, padding: '1rem',
                backgroundColor: loading || !cguAccepted ? '#e2e8f0' : '#00bcd4',
                color: !cguAccepted ? '#94a3b8' : '#fff',
                border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '700',
                cursor: loading || !cguAccepted ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              }}>
              {loading
                ? 'Enregistrement...'
                : isEditMode
                  ? 'Enregistrer les modifications'
                  : 'Enregistrer le brouillon'}
            </button>
          </div>

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