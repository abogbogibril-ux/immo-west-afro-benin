'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function MessagesAdmin() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Diffusion aux agents
  const [broadcastText, setBroadcastText] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null)

  useEffect(() => { loadMessages() }, [])

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, expediteur:profiles!expediteur_id(nom_complet, email), destinataire:profiles!destinataire_id(nom_complet, email), biens(titre)')
      .order('created_at', { ascending: false })
    setMessages(data || [])
    setLoading(false)
  }

  const marquerLu = async (id: string) => {
    await supabase.from('messages').update({ lu: true }).eq('id', id)
    loadMessages()
  }

  const supprimer = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return
    await supabase.from('messages').delete().eq('id', id)
    loadMessages()
  }

  const envoyerDiffusion = async () => {
    if (!broadcastText.trim()) return
    if (!confirm(`Envoyer ce message à TOUS les agents inscrits ?\n\n"${broadcastText}"`)) return

    setBroadcasting(true)
    setBroadcastResult(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setBroadcastResult('Erreur : session expirée, reconnectez-vous.')
        setBroadcasting(false)
        return
      }
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: broadcastText, accessToken: session.access_token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setBroadcastResult(`Erreur : ${data.error || 'inconnue'}`)
      } else {
        setBroadcastResult(`Envoyé à ${data.sent} agent(s) avec succès.`)
        setBroadcastText('')
      }
    } catch {
      setBroadcastResult('Erreur réseau — réessayez.')
    }
    setBroadcasting(false)
  }

  const nonLus = messages.filter(m => !m.lu).length

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Messages & Demandes</h1>
        <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>
          {messages.length} message(s) — {nonLus > 0 && <span style={{ color: '#ef4444', fontWeight: '600' }}>{nonLus} non lu(s)</span>}
        </p>
      </div>

      {/* Diffusion à tous les agents */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1.5rem', border: '2px solid #e0f2fe' }}>
        <h2 style={{ color: '#0f172a', fontSize: '1rem', fontWeight: '700', margin: '0 0 0.25rem' }}>📢 Diffusion à tous les agents</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 1rem' }}>
          Envoyer une notification unique à tous les agents inscrits (ex. changement des CGU, maintenance planifiée).
        </p>
        <textarea
          value={broadcastText}
          onChange={(e) => setBroadcastText(e.target.value)}
          placeholder="Écrivez votre message ici..."
          rows={3}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
          <span style={{ color: broadcastResult?.startsWith('Erreur') ? '#ef4444' : '#16a34a', fontSize: '0.8rem', fontWeight: '600' }}>
            {broadcastResult}
          </span>
          <button
            onClick={envoyerDiffusion}
            disabled={broadcasting || !broadcastText.trim()}
            style={{
              padding: '0.6rem 1.25rem', backgroundColor: broadcasting || !broadcastText.trim() ? '#cbd5e1' : '#0ea5e9',
              color: '#fff', border: 'none', borderRadius: '8px', cursor: broadcasting ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem', fontWeight: '700',
            }}
          >
            {broadcasting ? 'Envoi en cours...' : 'Envoyer à tous les agents'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Chargement...</div>
      ) : messages.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
          <p>Aucun message pour le moment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((m) => (
            <div key={m.id} style={{
              backgroundColor: '#fff', borderRadius: '12px', padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderLeft: m.lu ? '4px solid #e2e8f0' : '4px solid #00bcd4',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ color: '#0f172a', fontWeight: '600', fontSize: '0.9rem' }}>
                    {m.expediteur?.nom_complet || m.expediteur?.email || 'Anonyme'}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}> → </span>
                  <span style={{ color: '#0f172a', fontWeight: '600', fontSize: '0.9rem' }}>
                    {m.destinataire?.nom_complet || m.destinataire?.email || 'Anonyme'}
                  </span>
                  {m.biens?.titre && (
                    <span style={{ marginLeft: '0.5rem', backgroundColor: '#e0f7fa', color: '#00bcd4', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '999px' }}>
                      🏠 {m.biens.titre}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    {new Date(m.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  {!m.lu && (
                    <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '999px', fontWeight: '600' }}>
                      Non lu
                    </span>
                  )}
                </div>
              </div>
              <p style={{ color: '#374151', fontSize: '0.9rem', margin: '0 0 1rem', lineHeight: '1.5' }}>{m.contenu}</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!m.lu && (
                  <button onClick={() => marquerLu(m.id)} style={{ padding: '0.4rem 0.75rem', backgroundColor: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                    ✅ Marquer lu
                  </button>
                )}
                <button onClick={() => supprimer(m.id)} style={{ padding: '0.4rem 0.75rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
