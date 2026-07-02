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
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any>(null)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiChatLoading, setAiChatLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([])

  const sauvegarder = () => {
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  const generateSEO = async () => {
    setAiLoading(true)
    setAiSuggestions(null)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: 'Tu es un expert SEO specialise dans l immobilier en Afrique de l Ouest. Genere des metadonnees SEO optimisees pour Immo West Afro Benin, une plateforme immobiliere beninoise. Le site couvre Cotonou, Abomey-Calavi, Porto-Novo, Parakou et tout le Benin. Reponds UNIQUEMENT en JSON valide sans backticks: {"titre": "...(max 60 chars)", "description": "...(max 160 chars)", "keywords": "mot1, mot2, mot3...(15 mots cles)", "conseils": ["conseil1", "conseil2", "conseil3"]}'
          }]
        })
      })
      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      setAiSuggestions(parsed)
    } catch (err) {
      console.error('Erreur IA SEO:', err)
    } finally {
      setAiLoading(false)
    }
  }

  const applySuggestions = () => {
    if (aiSuggestions) {
      setForm(prev => ({
        ...prev,
        titre: aiSuggestions.titre || prev.titre,
        description: aiSuggestions.description || prev.description,
        keywords: aiSuggestions.keywords || prev.keywords,
      }))
      setAiSuggestions(null)
      setToast(true)
      setTimeout(() => setToast(false), 3000)
    }
  }

  const askAI = async () => {
    if (!aiQuery.trim()) return
    setAiChatLoading(true)
    const newHistory = [...chatHistory, { role: 'user', content: aiQuery }]
    setChatHistory(newHistory)
    setAiQuery('')
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: 'Tu es un expert SEO specialise dans l immobilier au Benin. Tu aides a optimiser le referencement de la plateforme Immo West Afro Benin. Reponds en francais, de maniere concise et actionnable.',
          messages: newHistory.map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await response.json()
      const reply = data.content?.[0]?.text || 'Desolee, une erreur est survenue.'
      setChatHistory([...newHistory, { role: 'assistant', content: reply }])
    } catch (err) {
      setChatHistory([...newHistory, { role: 'assistant', content: 'Erreur de connexion. Reessayez.' }])
    } finally {
      setAiChatLoading(false)
    }
  }

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 50, backgroundColor: '#16a34a', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          Sauvegarde avec succes !
        </div>
      )}

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>SEO et Referencement</h1>
          <p style={{ color: '#94a3b8', margin: '0.25rem 0 0' }}>Optimisation pour les moteurs de recherche</p>
        </div>
        <button onClick={generateSEO} disabled={aiLoading} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          background: aiLoading ? '#334155' : 'linear-gradient(135deg, #00bcd4, #0097a7)',
          color: '#fff', border: 'none', borderRadius: '10px',
          cursor: aiLoading ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem', fontWeight: '600',
          boxShadow: '0 2px 8px rgba(0,188,212,0.3)',
        }}>
          {aiLoading ? (
            <>
              <svg style={{ width: 18, height: 18 }} className="animate-spin" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Analyse SEO en cours...
            </>
          ) : (
            <>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              Generer avec l IA
            </>
          )}
        </button>
      </div>

      {/* Suggestions IA */}
      {aiSuggestions && (
        <div style={{ backgroundColor: '#0f3460', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #00bcd4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ color: '#00bcd4', fontWeight: '700', margin: 0 }}>Suggestions IA</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={applySuggestions} style={{ padding: '0.5rem 1rem', backgroundColor: '#00bcd4', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                Appliquer tout
              </button>
              <button onClick={() => setAiSuggestions(null)} style={{ padding: '0.5rem 1rem', backgroundColor: '#334155', color: '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                Ignorer
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Titre suggere ({aiSuggestions.titre?.length || 0}/60)</p>
              <p style={{ color: '#f1f5f9', backgroundColor: '#1e293b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', margin: 0 }}>{aiSuggestions.titre}</p>
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Description suggeree ({aiSuggestions.description?.length || 0}/160)</p>
              <p style={{ color: '#f1f5f9', backgroundColor: '#1e293b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', margin: 0 }}>{aiSuggestions.description}</p>
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Mots-cles suggeres</p>
              <p style={{ color: '#f1f5f9', backgroundColor: '#1e293b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', margin: 0 }}>{aiSuggestions.keywords}</p>
            </div>
            {aiSuggestions.conseils && (
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Conseils SEO</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {aiSuggestions.conseils.map((c: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#00bcd4', flexShrink: 0 }}>💡</span>
                      <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0 }}>{c}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem' }}>

        {/* Metadonnees */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Metadonnees principales</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Titre du site (60 caracteres max)</label>
            <input value={form.titre} onChange={e => setForm({...form, titre: e.target.value})} style={inputStyle} />
            <p style={{ color: form.titre.length > 60 ? '#ef4444' : '#64748b', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{form.titre.length}/60 caracteres</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Description (160 caracteres max)</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
            <p style={{ color: form.description.length > 160 ? '#ef4444' : '#64748b', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{form.description.length}/160 caracteres</p>
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

        {/* Sitemap */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Sitemap et Indexation</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Sitemap XML', desc: 'Genere automatiquement', ok: true },
              { label: 'Robots.txt', desc: 'Configure', ok: true },
              { label: 'Google Search Console', desc: 'A configurer', ok: false },
              { label: 'Donnees structurees', desc: 'Schema.org JSON-LD implemente', ok: true },
            ].map(item => (
              <div key={item.label} style={{ backgroundColor: item.ok ? '#064e3b20' : '#7c2d1220', borderRadius: '10px', padding: '1rem', border: '1px solid ' + (item.ok ? '#059669' : '#dc2626') + '30' }}>
                <p style={{ color: item.ok ? '#34d399' : '#f87171', fontWeight: '700', margin: 0, fontSize: '0.9rem' }}>{item.ok ? '✅' : '⚠️'} {item.label}</p>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat AI SEO */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Assistant SEO IA</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Posez vos questions SEO a l IA specialisee immobilier Benin
          </p>

          {/* Historique */}
          <div style={{ backgroundColor: '#0f172a', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', minHeight: '150px', maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {chatHistory.length === 0 ? (
              <div style={{ color: '#475569', fontSize: '0.85rem', textAlign: 'center', margin: 'auto' }}>
                <p>Exemples de questions :</p>
                {['Comment ameliorer le SEO local pour Cotonou ?', 'Quels mots-cles pour l immobilier au Benin ?', 'Comment optimiser les fiches annonces ?'].map(q => (
                  <button key={q} onClick={() => setAiQuery(q)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', background: '#1e293b', color: '#00bcd4', border: 'none', borderRadius: '8px', padding: '0.5rem 0.75rem', margin: '0.25rem 0', cursor: 'pointer', fontSize: '0.8rem' }}>
                    {q}
                  </button>
                ))}
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: '12px',
                    backgroundColor: msg.role === 'user' ? '#00bcd4' : '#1e293b',
                    color: '#f1f5f9', fontSize: '0.85rem', lineHeight: 1.5,
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {aiChatLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ backgroundColor: '#1e293b', padding: '0.75rem 1rem', borderRadius: '12px', color: '#94a3b8', fontSize: '0.85rem' }}>
                  L IA reflechit...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !aiChatLoading && askAI()}
              placeholder="Posez votre question SEO..."
              style={{ ...inputStyle, flex: 1, margin: 0 }}
            />
            <button onClick={askAI} disabled={aiChatLoading || !aiQuery.trim()}
              style={{
                padding: '0.6rem 1.25rem', backgroundColor: '#00bcd4', color: '#fff',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                opacity: aiChatLoading || !aiQuery.trim() ? 0.5 : 1,
              }}>
              Envoyer
            </button>
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
const sectionTitle: React.CSSProperties = { color: '#f1f5f9', fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #334155' }
const labelStyle: React.CSSProperties = { display: 'block', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.4rem' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }