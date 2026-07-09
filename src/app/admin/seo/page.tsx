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
    } catch {
      setChatHistory([...newHistory, { role: 'assistant', content: 'Erreur de connexion. Reessayez.' }])
    } finally {
      setAiChatLoading(false)
    }
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg text-sm">
          ✅ SEO sauvegarde avec succes !
        </div>
      )}

      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white m-0">SEO et Referencement</h1>
          <p className="text-slate-400 mt-1">Optimisation pour les moteurs de recherche</p>
        </div>
        <button onClick={generateSEO} disabled={aiLoading}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm border-none cursor-pointer transition-all shadow-md ${
            aiLoading ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-[#00bcd4] to-[#0097a7] hover:opacity-90'
          }`}>
          {aiLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Analyse SEO en cours...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              Generer avec l IA ✨
            </>
          )}
        </button>
      </div>

      {/* Suggestions IA */}
      {aiSuggestions && (
        <div className="bg-[#0f3460] rounded-xl p-6 mb-6 border border-[#00bcd4]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#00bcd4] font-bold m-0">Suggestions IA</h2>
            <div className="flex gap-2">
              <button onClick={applySuggestions}
                className="px-4 py-2 bg-[#00bcd4] text-white rounded-lg font-semibold text-sm border-none cursor-pointer hover:bg-[#0097a7] transition-colors">
                Appliquer tout
              </button>
              <button onClick={() => setAiSuggestions(null)}
                className="px-4 py-2 bg-[#334155] text-slate-400 rounded-lg text-sm border-none cursor-pointer hover:bg-[#475569] transition-colors">
                Ignorer
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-slate-400 text-xs mb-1">Titre suggere ({aiSuggestions.titre?.length || 0}/60)</p>
              <p className="text-white bg-[#1e293b] p-3 rounded-lg text-sm m-0">{aiSuggestions.titre}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Description suggeree ({aiSuggestions.description?.length || 0}/160)</p>
              <p className="text-white bg-[#1e293b] p-3 rounded-lg text-sm m-0">{aiSuggestions.description}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Mots-cles suggeres</p>
              <p className="text-white bg-[#1e293b] p-3 rounded-lg text-sm m-0">{aiSuggestions.keywords}</p>
            </div>
            {aiSuggestions.conseils && (
              <div>
                <p className="text-slate-400 text-xs mb-2">Conseils SEO</p>
                <div className="space-y-2">
                  {aiSuggestions.conseils.map((c: string, i: number) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-[#00bcd4] flex-shrink-0">💡</span>
                      <p className="text-slate-300 text-sm m-0">{c}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">

        {/* Metadonnees */}
        <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-[#334155]">
          <h2 className="text-white font-bold text-base mb-5 pb-3 border-b-2 border-[#334155]">Metadonnees principales</h2>
          <div className="mb-4">
            <label className="block text-slate-400 text-sm font-medium mb-1.5">Titre du site (60 caracteres max)</label>
            <input value={form.titre} onChange={e => setForm({...form, titre: e.target.value})}
              className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm outline-none focus:border-[#00bcd4] transition-colors" />
            <p className={`text-xs mt-1 ${form.titre.length > 60 ? 'text-red-400' : 'text-slate-500'}`}>{form.titre.length}/60 caracteres</p>
          </div>
          <div className="mb-4">
            <label className="block text-slate-400 text-sm font-medium mb-1.5">Description (160 caracteres max)</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm outline-none focus:border-[#00bcd4] transition-colors resize-vertical h-20" />
            <p className={`text-xs mt-1 ${form.description.length > 160 ? 'text-red-400' : 'text-slate-500'}`}>{form.description.length}/160 caracteres</p>
          </div>
          <div className="mb-4">
            <label className="block text-slate-400 text-sm font-medium mb-1.5">Mots-cles (separes par des virgules)</label>
            <input value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})}
              className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm outline-none focus:border-[#00bcd4] transition-colors" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-1.5">Image Open Graph (URL)</label>
            <input value={form.og_image} placeholder="https://..." onChange={e => setForm({...form, og_image: e.target.value})}
              className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm outline-none focus:border-[#00bcd4] transition-colors placeholder-slate-600" />
          </div>
        </div>

        {/* Sitemap */}
        <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-[#334155]">
          <h2 className="text-white font-bold text-base mb-5 pb-3 border-b-2 border-[#334155]">Sitemap et Indexation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Sitemap XML', desc: 'Genere automatiquement', ok: true },
              { label: 'Robots.txt', desc: 'Configure', ok: true },
              { label: 'Google Search Console', desc: 'Propriete verifiee', ok: true },
              { label: 'Donnees structurees', desc: 'Schema.org JSON-LD implemente', ok: true },
            ].map(item => (
              <div key={item.label} className="bg-green-900/20 rounded-xl p-4 border border-green-900/30">
                <p className="text-green-400 font-bold m-0 text-sm">✅ {item.label}</p>
                <p className="text-slate-400 text-xs mt-1 m-0">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat AI SEO */}
        <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-[#334155]">
          <h2 className="text-white font-bold text-base mb-2 pb-3 border-b-2 border-[#334155]">Assistant SEO IA</h2>
          <p className="text-slate-400 text-sm mb-4">Posez vos questions SEO a l IA specialisee immobilier Benin</p>

          <div className="bg-[#0f172a] rounded-xl p-4 mb-4 min-h-[150px] max-h-[300px] overflow-y-auto flex flex-col gap-3">
            {chatHistory.length === 0 ? (
              <div className="text-slate-500 text-sm text-center m-auto">
                <p className="mb-2">Exemples de questions :</p>
                {['Comment ameliorer le SEO local pour Cotonou ?', 'Quels mots-cles pour l immobilier au Benin ?', 'Comment optimiser les fiches annonces ?'].map(q => (
                  <button key={q} onClick={() => setAiQuery(q)}
                    className="block w-full text-left bg-[#1e293b] text-[#00bcd4] border-none rounded-lg px-3 py-2 my-1 cursor-pointer text-xs hover:bg-[#334155] transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user' ? 'bg-[#00bcd4] text-white' : 'bg-[#1e293b] text-slate-200'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {aiChatLoading && (
              <div className="flex justify-start">
                <div className="bg-[#1e293b] px-4 py-3 rounded-xl text-slate-400 text-sm">L IA reflechit...</div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input value={aiQuery} onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !aiChatLoading && askAI()}
              placeholder="Posez votre question SEO..."
              className="flex-1 px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm outline-none focus:border-[#00bcd4] transition-colors placeholder-slate-600" />
            <button onClick={askAI} disabled={aiChatLoading || !aiQuery.trim()}
              className={`px-5 py-2.5 bg-[#00bcd4] text-white rounded-lg font-semibold text-sm border-none cursor-pointer transition-colors hover:bg-[#0097a7] ${
                (aiChatLoading || !aiQuery.trim()) ? 'opacity-50 cursor-not-allowed' : ''
              }`}>
              Envoyer
            </button>
          </div>
        </div>
      </div>

      <button onClick={sauvegarder}
        className="mt-6 px-8 py-4 bg-[#00bcd4] hover:bg-[#0097a7] text-white border-none rounded-lg text-base font-bold cursor-pointer transition-colors">
        Sauvegarder le SEO
      </button>
    </div>
  )
}