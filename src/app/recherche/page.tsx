'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const VILLES = ['Cotonou','Abomey-Calavi','Porto-Novo','Sèmè-Kpodji','Parakou','Bohicon','Ouidah','Lokossa','Abomey','Djougou','Comè','Azovè','Klouékanmey','Agbangnizoun','Natitingou']
const TYPES = ['Maison','Appartement','Villa','Terrain','Bureau','Studio','Chambre']
const TRIS = [
  { value: 'created_at', label: 'Date (récent d\'abord)' },
  { value: 'prix_asc', label: 'Prix croissant' },
  { value: 'prix_desc', label: 'Prix décroissant' },
  { value: 'vues', label: 'Popularité' },
]

export default function RecherchePage() {
  const [biens, setBiens] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [vue, setVue] = useState<'grille' | 'liste'>('grille')
  const [filtresVisibles, setFiltresVisibles] = useState(true)
  const [filtres, setFiltres] = useState({
    ville: '', arrondissement: '', quartier: '',
    type_bien: '', prix_min: '', prix_max: '',
    nb_pieces: '', nb_chambres: '', nb_salles_bain: '',
    meuble: '', parking: '', terrasse: '',
    securite: '', eau: '', electricite: '',
    disponible_immediat: '', surface_min: '',
    tri: 'created_at',
  })

  useEffect(() => { rechercher() }, [])

  const rechercher = async () => {
    setLoading(true)
    let query = supabase.from('biens').select('*, images_biens(url)').eq('statut', 'disponible')
    if (filtres.ville) query = query.eq('ville', filtres.ville)
    if (filtres.arrondissement) query = query.ilike('arrondissement', `%${filtres.arrondissement}%`)
    if (filtres.quartier) query = query.ilike('quartier', `%${filtres.quartier}%`)
    if (filtres.type_bien) query = query.eq('type_bien', filtres.type_bien)
    if (filtres.prix_min) query = query.gte('prix', parseInt(filtres.prix_min))
    if (filtres.prix_max) query = query.lte('prix', parseInt(filtres.prix_max))
    if (filtres.nb_pieces) query = query.gte('nb_pieces', parseInt(filtres.nb_pieces))
    if (filtres.nb_chambres) query = query.gte('nb_chambres', parseInt(filtres.nb_chambres))
    if (filtres.nb_salles_bain) query = query.gte('nb_salles_bain', parseInt(filtres.nb_salles_bain))
    if (filtres.surface_min) query = query.gte('surface', parseFloat(filtres.surface_min))
    if (filtres.meuble === 'oui') query = query.eq('meuble', true)
    if (filtres.parking === 'oui') query = query.eq('parking', true)
    if (filtres.terrasse === 'oui') query = query.eq('terrasse', true)
    if (filtres.securite === 'oui') query = query.eq('securite', true)
    if (filtres.eau === 'oui') query = query.eq('eau', true)
    if (filtres.electricite === 'oui') query = query.eq('electricite', true)
    if (filtres.disponible_immediat === 'oui') query = query.eq('disponible_immediat', true)
    if (filtres.tri === 'prix_asc') query = query.order('prix', { ascending: true })
    else if (filtres.tri === 'prix_desc') query = query.order('prix', { ascending: false })
    else if (filtres.tri === 'vues') query = query.order('vues', { ascending: false })
    else query = query.order('created_at', { ascending: false })
    const { data } = await query.limit(50)
    setBiens(data || [])
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFiltres({ ...filtres, [e.target.name]: e.target.value })
  }

  const reinitialiser = () => {
    setFiltres({ ville: '', arrondissement: '', quartier: '', type_bien: '', prix_min: '', prix_max: '', nb_pieces: '', nb_chambres: '', nb_salles_bain: '', meuble: '', parking: '', terrasse: '', securite: '', eau: '', electricite: '', disponible_immediat: '', surface_min: '', tri: 'created_at' })
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* HEADER */}
      <div style={{ backgroundColor: '#0f172a', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>Recherche de biens</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            {loading ? 'Recherche...' : `${biens.length} bien(s) trouvé(s)`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select name="tri" value={filtres.tri} onChange={handleChange} style={selectTopStyle}>
            {TRIS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button onClick={() => setVue(vue === 'grille' ? 'liste' : 'grille')} style={btnTopStyle}>
            {vue === 'grille' ? '☰ Liste' : '⊞ Grille'}
          </button>
          <button onClick={() => setFiltresVisibles(!filtresVisibles)} style={btnTopStyle}>
            {filtresVisibles ? '✕ Masquer filtres' : '⊞ Afficher filtres'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', padding: '1.5rem', gap: '1.5rem' }}>

        {/* SIDEBAR FILTRES */}
        {filtresVisibles && (
          <aside style={{ width: '280px', flexShrink: 0 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', position: 'sticky', top: '80px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#0f172a', fontSize: '1rem', fontWeight: '700', margin: 0 }}>Filtres</h2>
                <button onClick={reinitialiser} style={{ color: '#00bcd4', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                  Effacer tout
                </button>
              </div>

              {/* LOCALISATION */}
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📍 Localisation</h3>
                <select name="ville" value={filtres.ville} onChange={handleChange} style={filterInputStyle}>
                  <option value="">Toutes les villes</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <input name="arrondissement" value={filtres.arrondissement} onChange={handleChange} placeholder="Arrondissement" style={filterInputStyle} />
                <input name="quartier" value={filtres.quartier} onChange={handleChange} placeholder="Quartier / Zone" style={filterInputStyle} />
              </div>

              {/* TYPE */}
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>🏠 Type de bien</h3>
                <select name="type_bien" value={filtres.type_bien} onChange={handleChange} style={filterInputStyle}>
                  <option value="">Tous les types</option>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* PRIX */}
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>💰 Prix (FCFA/mois)</h3>
                <input name="prix_min" value={filtres.prix_min} onChange={handleChange} type="number" placeholder="Prix min" style={filterInputStyle} />
                <input name="prix_max" value={filtres.prix_max} onChange={handleChange} type="number" placeholder="Prix max" style={filterInputStyle} />
              </div>

              {/* CARACTÉRISTIQUES */}
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>🛏 Caractéristiques</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input name="nb_pieces" value={filtres.nb_pieces} onChange={handleChange} type="number" placeholder="Pièces min" style={filterInputStyle} />
                  <input name="nb_chambres" value={filtres.nb_chambres} onChange={handleChange} type="number" placeholder="Chambres min" style={filterInputStyle} />
                  <input name="nb_salles_bain" value={filtres.nb_salles_bain} onChange={handleChange} type="number" placeholder="SDB min" style={filterInputStyle} />
                  <input name="surface_min" value={filtres.surface_min} onChange={handleChange} type="number" placeholder="Surface m²" style={filterInputStyle} />
                </div>
              </div>

              {/* ÉQUIPEMENTS */}
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>✅ Équipements</h3>
                {[
                  { name: 'meuble', label: '🛋️ Meublé' },
                  { name: 'parking', label: '🚗 Parking' },
                  { name: 'terrasse', label: '🌿 Terrasse' },
                  { name: 'securite', label: '🔒 Sécurité' },
                  { name: 'eau', label: '💧 Eau' },
                  { name: 'electricite', label: '⚡ Électricité' },
                  { name: 'disponible_immediat', label: '✅ Dispo. immédiat' },
                ].map(eq => (
                  <label key={eq.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer', color: '#374151', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={filtres[eq.name as keyof typeof filtres] === 'oui'}
                      onChange={(e) => setFiltres({ ...filtres, [eq.name]: e.target.checked ? 'oui' : '' })} />
                    {eq.label}
                  </label>
                ))}
              </div>

              <button onClick={rechercher} style={{
                width: '100%', padding: '0.875rem', backgroundColor: '#00bcd4',
                color: '#fff', border: 'none', borderRadius: '8px',
                fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
              }}>
                🔍 Rechercher
              </button>
            </div>
          </aside>
        )}

        {/* RÉSULTATS */}
        <main style={{ flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <p>Recherche en cours...</p>
            </div>
          ) : biens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', backgroundColor: '#fff', borderRadius: '12px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
              <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>Aucun bien trouvé</p>
              <p style={{ fontSize: '0.9rem' }}>Essayez d&apos;élargir vos critères de recherche.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: vue === 'grille' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
              gap: '1.25rem',
            }}>
              {biens.map((bien) => (
                <Link key={bien.id} href={`/bien/${bien.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                    display: vue === 'liste' ? 'flex' : 'block',
                  }}>
                    {/* IMAGE */}
                    <div style={{
                      height: vue === 'liste' ? '160px' : '200px',
                      width: vue === 'liste' ? '240px' : '100%',
                      flexShrink: 0,
                      backgroundColor: '#e2e8f0',
                      backgroundImage: bien.images_biens?.[0]?.url ? `url(${bien.images_biens[0].url})` : 'none',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                    }}>
                      {!bien.images_biens?.[0]?.url && <span style={{ fontSize: '3rem' }}>🏠</span>}
                      {bien.premium && (
                        <span style={{
                          position: 'absolute', top: '0.75rem', left: '0.75rem',
                          backgroundColor: '#f59e0b', color: '#fff',
                          padding: '0.2rem 0.6rem', borderRadius: '999px',
                          fontSize: '0.7rem', fontWeight: '700',
                        }}>⭐ PREMIUM</span>
                      )}
                      <span style={{
                        position: 'absolute', top: '0.75rem', right: '0.75rem',
                        backgroundColor: '#10b981', color: '#fff',
                        padding: '0.2rem 0.6rem', borderRadius: '999px',
                        fontSize: '0.7rem', fontWeight: '600',
                      }}>Disponible</span>
                    </div>

                    {/* INFOS */}
                    <div style={{ padding: '1.25rem', flex: 1 }}>
                      <h3 style={{ color: '#0f172a', fontWeight: '700', marginBottom: '0.4rem', fontSize: '1rem', lineHeight: '1.3' }}>
                        {bien.titre}
                      </h3>
                      <p style={{ color: '#00bcd4', fontWeight: '800', fontSize: '1.15rem', marginBottom: '0.4rem' }}>
                        {bien.prix?.toLocaleString()} FCFA<span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '0.8rem' }}>/mois</span>
                      </p>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                        📍 {[bien.quartier, bien.arrondissement, bien.ville].filter(Boolean).join(', ')}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', color: '#64748b', fontSize: '0.8rem' }}>
                        {bien.type_bien && <span style={badgeStyle}>🏠 {bien.type_bien}</span>}
                        {bien.nb_chambres && <span style={badgeStyle}>🛏 {bien.nb_chambres} ch.</span>}
                        {bien.nb_salles_bain && <span style={badgeStyle}>🚿 {bien.nb_salles_bain} sdb</span>}
                        {bien.surface && <span style={badgeStyle}>📐 {bien.surface}m²</span>}
                        {bien.meuble && <span style={badgeStyle}>🛋️ Meublé</span>}
                        {bien.parking && <span style={badgeStyle}>🚗 Parking</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

const sectionStyle: React.CSSProperties = { marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }
const sectionTitleStyle: React.CSSProperties = { color: '#0f172a', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }
const filterInputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', marginBottom: '0.5rem' }
const selectTopStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '0.85rem', outline: 'none' }
const btnTopStyle: React.CSSProperties = { padding: '0.5rem 1rem', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '0.85rem', cursor: 'pointer' }
const badgeStyle: React.CSSProperties = { backgroundColor: '#f1f5f9', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem' }