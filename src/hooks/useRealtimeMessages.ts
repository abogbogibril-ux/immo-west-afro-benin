import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export interface Message {
  id: string
  sujet: string
  contenu: string
  lu: boolean
  created_at: string
  bien_id?: string
  expediteur_id: string
  destinataire_id: string
  _type?: 'recu' | 'envoye'
  profiles?: {
    nom: string
    prenom: string
    telephone?: string
    avatar_url?: string
  }
  biens?: { titre: string }
}

interface UseRealtimeMessagesOptions {
  userId: string | null
  onNewMessage?: (msg: Message) => void
}

export function useRealtimeMessages({ userId, onNewMessage }: UseRealtimeMessagesOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // ── Chargement initial ────────────────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    const [recusRes, envoyesRes] = await Promise.all([
      supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_expediteur_id_fkey (nom, prenom, telephone, avatar_url),
          biens (titre)
        `)
        .eq('destinataire_id', userId)
        .order('created_at', { ascending: false }),

      supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_destinataire_id_fkey (nom, prenom, telephone, avatar_url),
          biens (titre)
        `)
        .eq('expediteur_id', userId)
        .order('created_at', { ascending: false }),
    ])

    const recus = (recusRes.data ?? []).map(m => ({ ...m, _type: 'recu' as const }))
    const envoyes = (envoyesRes.data ?? []).map(m => ({ ...m, _type: 'envoye' as const }))

    const all = [...recus, ...envoyes].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    setMessages(all)
    setUnreadCount(recus.filter(m => !m.lu).length)
    setLoading(false)
  }, [userId])

  // ── Supabase Realtime ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return

    loadMessages()

    // Abonnement aux nouveaux messages reçus
    const channel = supabase
      .channel(`messages:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `destinataire_id=eq.${userId}`,
        },
        async (payload) => {
          // Enrichir le nouveau message avec les relations
          const { data: enriched } = await supabase
            .from('messages')
            .select(`
              *,
              profiles!messages_expediteur_id_fkey (nom, prenom, telephone, avatar_url),
              biens (titre)
            `)
            .eq('id', payload.new.id)
            .single()

          if (enriched) {
            const newMsg = { ...enriched, _type: 'recu' as const }
            setMessages(prev => [newMsg, ...prev])
            setUnreadCount(prev => prev + 1)
            onNewMessage?.(newMsg)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `destinataire_id=eq.${userId}`,
        },
        (payload) => {
          setMessages(prev =>
            prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m)
          )
          // Recalculer les non lus
          setMessages(prev => {
            setUnreadCount(prev.filter(m => m._type === 'recu' && !m.lu).length)
            return prev
          })
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, loadMessages])

  // ── Actions ───────────────────────────────────────────────────────────────
  const markAsRead = useCallback(async (messageId: string) => {
    await supabase.from('messages').update({ lu: true }).eq('id', messageId)
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, lu: true } : m))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const sendMessage = useCallback(async ({
    destinataireId,
    bienId,
    sujet,
    contenu,
  }: {
    destinataireId: string
    bienId?: string
    sujet: string
    contenu: string
  }) => {
    if (!userId || !contenu.trim()) return { error: 'Contenu vide' }

    const { data, error } = await supabase.from('messages').insert({
      expediteur_id: userId,
      destinataire_id: destinataireId,
      bien_id: bienId ?? null,
      sujet,
      contenu,
      lu: false,
    }).select(`
      *,
      profiles!messages_destinataire_id_fkey (nom, prenom, telephone, avatar_url),
      biens (titre)
    `).single()

    if (data) {
      const sent = { ...data, _type: 'envoye' as const }
      setMessages(prev => [sent, ...prev])
    }

    return { data, error }
  }, [userId])

  const deleteMessage = useCallback(async (messageId: string) => {
    await supabase.from('messages').delete().eq('id', messageId)
    setMessages(prev => prev.filter(m => m.id !== messageId))
  }, [])

  return {
    messages,
    loading,
    unreadCount,
    markAsRead,
    sendMessage,
    deleteMessage,
    reload: loadMessages,
  }
}

// ── Hook simplifié pour un fil de conversation ────────────────────────────────
export function useConversation(userId: string | null, contactId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || !contactId) return

    const load = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(expediteur_id.eq.${userId},destinataire_id.eq.${contactId}),` +
          `and(expediteur_id.eq.${contactId},destinataire_id.eq.${userId})`
        )
        .order('created_at', { ascending: true })

      setMessages(data ?? [])
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel(`conv:${userId}:${contactId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const m = payload.new as Message
          const isRelevant =
            (m.expediteur_id === userId && m.destinataire_id === contactId) ||
            (m.expediteur_id === contactId && m.destinataire_id === userId)
          if (isRelevant) {
            setMessages(prev => [...prev, m])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, contactId])

  return { messages, loading }
}