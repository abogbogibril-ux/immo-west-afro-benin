'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import type { Message } from '@/hooks/useRealtimeMessages'
import Link from 'next/link'

function getInitiales(p?: { prenom?: string; nom?: string }) {
  return `${p?.prenom?.[0] ?? ''}${p?.nom?.[0] ?? ''}`.toUpperCase() || '?'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  if (mins < 1) return 'À l\'instant'
  if (mins < 60) return `${mins}min`
  if (hours < 24) return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

export default function ClientMessagesPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Message | null>(null)
  const [filter, setFilter] = useState<'tous' | 'recus' | 'envoyes'>('tous')
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const { messages, loading, unreadCount, markAsRead, sendMessage } = useRealtimeMessages({
    userId,
    onNewMessage: (msg) => {
      // Toast notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nouveau message — Immo West Afro', {
          body: msg.sujet,
          icon: '/favicon.ico',
        })
      }
    },
  })

  const filtered = messages.filter((m: any) => {
    if (filter === 'recus') return m._type === 'recu'
    if (filter === 'envoyes') return m._type === 'envoye'
    return true
  })

  const handleSelect = async (msg: Message) => {
    setSelected(msg)
    setReply('')
    if (!(msg as any)._type || (msg as any)._type === 'recu') {
      await markAsRead(msg.id)
    }
  }

  const handleSend = async () => {
    if (!reply.trim() || !selected) return
    setSending(true)
    const destinataireId = (selected as any)._type === 'recu'
      ? selected.expediteur_id
      : selected.destinataire_id
    await sendMessage({
      destinataireId,
      bienId: selected.bien_id,
      sujet: selected.sujet.startsWith('Re:') ? selected.sujet : `Re: ${selected.sujet}`,
      contenu: reply,
    })
    setSending(false)
    setReply('')
  }

  const getContact = (msg: Message) => msg.profiles

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col lg:flex-row">

      {/* ── Liste ── */}
      <div className={`${selected ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 xl:w-96 border-r border-gray-100 bg-white`}>

        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-bold text-gray-900">Messages</h1>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
              {/* Indicateur temps réel */}
              <span className="flex items-center gap-1 text-[10px] text-green-500 font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>
                Live
              </span>
            </div>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(['tous', 'recus', 'envoyes'] as const).map(val => (
              <button key={val} onClick={() => setFilter(val)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}>
                {val === 'tous' ? 'Tous' : val === 'recus' ? 'Reçus' : 'Envoyés'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0"/>
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4"/>
                    <div className="h-3 bg-gray-100 rounded w-1/2"/>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm">Aucun message</p>
              <Link href="/recherche" className="mt-3 inline-block text-sm text-green-600 hover:underline">
                Parcourir les annonces →
              </Link>
            </div>
          ) : filtered.map((msg: any) => {
            const contact = getContact(msg)
            const isSelected = selected?.id === msg.id
            const isUnread = !msg.lu && msg._type === 'recu'
            return (
              <button key={msg.id} onClick={() => handleSelect(msg)}
                className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-green-50 border-l-2 border-l-green-600' : ''
                }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    msg._type === 'recu' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {getInitiales(contact)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-sm truncate ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {contact ? `${contact.prenom} ${contact.nom}` : 'Inconnu'}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(msg.created_at)}</span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${isUnread ? 'text-gray-700' : 'text-gray-400'}`}>
                      {msg._type === 'envoye' && <span className="text-green-500">↗ </span>}
                      {msg.sujet}
                    </p>
                    {msg.biens?.titre && (
                      <p className="text-[10px] text-green-600 mt-0.5 truncate">🏠 {msg.biens.titre}</p>
                    )}
                  </div>
                  {isUnread && <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"/>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Détail ── */}
      <div className={`${selected ? 'flex' : 'hidden lg:flex'} flex-col flex-1 bg-gray-50`}>
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
            <p className="text-sm font-medium">Sélectionnez un message</p>
            <p className="text-xs text-gray-300 mt-1">Les nouveaux messages arrivent en temps réel</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
              <button onClick={() => setSelected(null)} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                (selected as any)._type === 'recu' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {getInitiales(getContact(selected))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">
                  {getContact(selected) ? `${getContact(selected)?.prenom} ${getContact(selected)?.nom}` : 'Inconnu'}
                </p>
                {getContact(selected)?.telephone && (
                  <a href={`tel:${getContact(selected)?.telephone}`}
                    className="text-xs text-green-600 hover:underline">{getContact(selected)?.telephone}</a>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                (selected as any)._type === 'recu' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {(selected as any)._type === 'recu' ? '↙ Reçu' : '↗ Envoyé'}
              </span>
            </div>

            {/* Corps */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 max-w-2xl">
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 text-base">{selected.sujet}</h2>
                  {selected.biens?.titre && (
                    <p className="text-sm text-green-600 mt-1">🏠 {selected.biens.titre}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(selected.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{selected.contenu}</p>
              </div>
            </div>

            {/* Zone réponse */}
            <div className="bg-white border-t border-gray-100 p-4">
              <div className="flex gap-3 items-end max-w-2xl">
                <textarea rows={3} value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Écrire une réponse... (Entrée pour envoyer)"
                  className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
                />
                <button onClick={handleSend} disabled={sending || !reply.trim()}
                  className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50 flex-shrink-0">
                  {sending ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                  )}
                </button>
              </div>
              {getContact(selected)?.telephone && (
                <a href={`https://wa.me/${getContact(selected)?.telephone?.replace(/[\s+\-()]/g, '')}?text=${encodeURIComponent(`Bonjour ${getContact(selected)?.prenom ?? ''}, suite à votre message sur Immo West Afro...`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#25D366] hover:underline font-medium mt-2">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.345.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.15-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  Répondre via WhatsApp
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}