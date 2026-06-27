'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const VILLES = ['Cotonou','Abomey-Calavi','Porto-Novo','Sèmè-Kpodji','Parakou','Bohicon','Ouidah','Lokossa','Abomey','Djougou','Comè','Azovè','Natitingou']
const TYPES = ['Maison','Appartement','Villa','Terrain','Bureau','Studio','Chambre']

export default function RecherchePage() {
  const [biens, setBiens] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filtres, setFiltres] = useState({
    ville: '', type_bien: '', prix_min: '', prix_max: '',
    nb_chambres: '', meuble: '', disponible_immediat: '',
  })

  useEffect(() => { rechercher() }, [])

  const rechercher = async () => {
    setLoading(true)
    let query = supabase.from('biens').select('*, images_biens(url)').eq('statut', 'disponible')
    if (filtres.ville) query = query.eq('ville', filtres.ville)
    if (filtres.type_bien) query = query.eq('type_bien', filtres.type_bien)
    if (filtres.prix_min) query = query.gte('prix', parseInt(filtres.prix_min))
    if (filtres.prix_max) query = query.lte('prix', parseInt(filtres.prix_max))
    if (filtres.nb_chambres) query = query.eq('nb_chambres', parseInt(filtres.nb_chambres))
    if (filtres.meuble === 'oui') query = query.eq('meuble', true)
    if (filtres.disponible_immediat === 'oui') query = query.eq('disponible_immediat', true)
    const { data } = await query.order('created_at', { ascending: false }).limit(50)
    setBiens(data || [])
    setLoading(false)
  }

  const handleFiltreChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFiltres({ ...filtres, [e.target.name]: e.target.value })
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* BARRE FILTRES */}
      <div style={{ backgroundColor: '#0f172a', padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
            Recherche avancée
          </h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <select name="ville" onChange={handleFiltreChange} style={selectStyle}>
              <option value="">Toutes les villes</option>
              {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <select name="type_bien" onChange={handleFiltreChange} style={selectStyle}>
              <option value="">Type de bien</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input name="prix_min" type="number" placeholder="Prix min (FCFA)"
              onChange={handleFiltreChange} style={selectStyle} />
            <input name="prix_max" type="number" placeholder="Prix max (FCFA)"
              onChange={handleFiltreChange} style={selectStyle} />
            <select name="nb_chambres" onChange={handleFiltreChange} style={selectStyle}>
              <option value="">Chambres</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+ chambre(s)</option>)}
            </select>
            <select name="meuble" onChange={handleFiltreChange} style={selectStyle}>
              <option value="">Meublé / Non meublé</option>
              <option value="oui">Meublé</option>
              <option value="non">Non meublé</option>
            </select>
            <select name="disponible_immediat" onChange={handleFiltreChange} style={selectStyle}>
              <option value="">Disponibilité</option>
              <option value="oui">Disponible immédiatement</option>
            </select>
            <button onClick={rechercher} style={{
              padding: '0.75rem 1.5rem', backgroundColor: '#00bcd4',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '1rem', fontWeight: '600', cursor: 'pointer',
            }}>
              🔍 Rechercher
            </button>
          </div>
        </div>
      </div>

      {/* RÉSULTATS */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          {loading ? 'Recherche en cours...' : `${biens.length} bien(s) trouvé(s)`}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {biens.map((bien) => (
            <Link key={bien.id} href={`/bien/${bien.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)', transition: 'transform 0.2s',
              }}>
                {/* IMAGE */}
                <div style={{
                  height: '200px', backgroundColor: '#e2e8f0',
                  backgroundImage: bien.images_biens?.[0]?.url ? `url(${bien.images_biens[0].url})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!bien.images_biens?.[0]?.url && <span style={{ fontSize: '3rem' }}>🏠</span>}
                  {bien.premium && (
                    <span style={{
                      position: 'absolute', top: '1rem', left: '1rem',
                      backgroundColor: '#f59e0b', color: '#fff',
                      padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700',
                    }}>⭐ PREMIUM</span>
                  )}
                </div>
                {/* INFOS */}
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ color: '#0f172a', fontWeight: '700', marginBottom: '0.5rem', fontSize: '1rem' }}>
                    {bien.titre}
                  </h3>
                  <p style={{ color: '#00bcd4', fontWeight: '800', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                    {bien.prix?.toLocaleString()} FCFA<span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '0.85rem' }}>/mois</span>
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                    📍 {bien.quartier ? `${bien.quartier}, ` : ''}{bien.ville}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                    {bien.nb_chambres && <span>🛏 {bien.nb_chambres} ch.</span>}
                    {bien.nb_salles_bain && <span>🚿 {bien.nb_salles_bain} sdb</span>}
                    {bien.surface && <span>📐 {bien.surface}m²</span>}
                    {bien.meuble && <span>🛋️ Meublé</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {!loading && biens.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
              <p style={{ fontSize: '1.1rem' }}>Aucun bien trouvé avec ces critères.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  padding: '0.75rem 1rem', backgroundColor: '#1e293b',
  border: '1px solid #334155', borderRadius: '8px',
  color: '#fff', fontSize: '0.9rem', outline: 'none',
}