'use client'

import { useState, useEffect, useRef } from 'react'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import type { Message } from '@/hooks/useRealtimeMessages'

interface Props {
  userId: string
  contactId: string
  contactNom: string
  contactPrenom: string
  contactTelephone?: string
  bienId?: string
  bienTitre?: string
  className?: string
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'À l\'instant'
  if (mins < 60) return `${mins}min`
  if (hours < 24) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (days === 1) return 'Hier'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function getInitiales(prenom?: string, nom?: string) {
  return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase() || '?'
}

export default function ChatWindow({
  userId,
  contactId,
  contactNom,
  contactPrenom,
  contactTelephone,
  bienId,
  bienTitre,
  className = '',
}: Props) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { messages, loading, markAsRead, sendMessage } = useRealtimeMessages({
    userId,
    onNewMessage: (msg) => {
      // Son de notification
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA==')
        audio.volume = 0.3
        audio.play().catch(() => {})
      } catch {}
    },
  })

  // Filtrer uniquement la conversation avec ce contact
  const conversation = messages
    .filter(m =>
      (m.expediteur_id === userId && m.destinataire_id === contactId) ||
      (m.expediteur_id === contactId && m.destinataire_id === userId)
    )
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  // Scroll automatique en bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.length])

  // Marquer les messages reçus comme lus
  useEffect(() => {
    conversation
      .filter(m => m.expediteur_id === contactId && !m.lu)
      .forEach(m => markAsRead(m.id))
  }, [conversation.length])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    const sujet = bienTitre ? `Re: ${bienTitre}` : 'Message direct'
    await sendMessage({
      destinataireId: contactId,
      bienId,
      sujet,
      contenu: input.trim(),
    })
    setInput('')
    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    setIsTyping(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1500)
  }

  const waText = encodeURIComponent(
    `Bonjour ${contactPrenom}, je vous contacte via Immo West Afro${bienTitre ? ` concernant "${bienTitre}"` : ''}.`
  )

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-white">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {getInitiales(contactPrenom, contactNom)}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{contactPrenom} {contactNom}</p>
          <p className="text-xs text-green-500 font-medium">En ligne</p>
        </div>
        <div className="flex items-center gap-1.5">
          {contactTelephone && (
            <>
              <a href={`tel:${contactTelephone}`}
                className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all"
                title="Appeler">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z"/>
                </svg>
              </a>
              <a href={`https://wa.me/${contactTelephone.replace(/[\s+\-()]/g, '')}?text=${waText}`}
                target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-xl text-gray-400 hover:text-[#25D366] hover:bg-green-50 transition-all"
                title="WhatsApp">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.345.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.15-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </a>
            </>
          )}
        </div>
      </div>

      {/* Contexte bien */}
      {bienTitre && (
        <div className="px-4 py-2 bg-green-50 border-b border-green-100 flex items-center gap-2">
          <span className="text-green-600 text-xs">🏠</span>
          <p className="text-xs text-green-700 font-medium truncate">{bienTitre}</p>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[500px]" style={{WebkitOverflowScrolling:"touch",overscrollBehavior:"contain"}}>
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Chargement...
          </div>
        ) : conversation.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <svg className="w-10 h-10 mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
            <p className="text-sm">Démarrez la conversation</p>
            <p className="text-xs mt-0.5">Envoyez votre premier message</p>
          </div>
        ) : (
          <>
            {conversation.map((msg, idx) => {
              const isMine = msg.expediteur_id === userId
              const prevMsg = conversation[idx - 1]
              const showDate = !prevMsg ||
                new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString()

              return (
                <div key={msg.id}>
                  {/* Séparateur de date */}
                  {showDate && (
                    <div className="flex items-center gap-2 my-3">
                      <div className="flex-1 h-px bg-gray-100"/>
                      <span className="text-[10px] text-gray-400 font-medium px-2 bg-white">
                        {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                          weekday: 'long', day: 'numeric', month: 'long'
                        })}
                      </span>
                      <div className="flex-1 h-px bg-gray-100"/>
                    </div>
                  )}

                  {/* Bulle */}
                  <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMine && (
                      <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mb-1">
                        {getInitiales(contactPrenom, contactNom)}
                      </div>
                    )}
                    <div className={`group max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-green-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.contenu}</p>
                      </div>
                      <div className={`flex items-center gap-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</span>
                        {isMine && (
                          <svg className={`w-3 h-3 ${msg.lu ? 'text-blue-500' : 'text-gray-300'}`}
                            fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Indicateur "en train d'écrire" */}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {getInitiales(contactPrenom, contactNom)}
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </>
        )}
      </div>

      {/* ── Zone de saisie ── */}
      <div className="border-t border-gray-100 p-3.5">
        <div className="flex items-end gap-2.5">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Écrire un message... (Entrée pour envoyer)"
            className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50 max-h-32 leading-relaxed"
            style={{ minHeight: '42px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {sending ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            )}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 text-center">
          Entrée pour envoyer · Maj+Entrée pour nouvelle ligne
        </p>
      </div>
    </div>
  )
}