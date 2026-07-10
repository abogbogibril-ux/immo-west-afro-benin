"use client";

/**
 * RealtimeMessages — Messagerie temps réel Supabase
 * Immo West Afro Bénin
 *
 * Usage dans /client/messages/page.tsx :
 *   <RealtimeMessages userId={user.id} conversationId={conversationId} />
 *
 * Tables Supabase requises :
 *   conversations (id, client_id, agent_id, bien_id, created_at, updated_at)
 *   messages (id, conversation_id, sender_id, content, read_at, created_at)
 *
 * RLS : users can only read/write their own conversations
 */

import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ───────────────────────────────────────────────────
interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url?: string;
    role: "agent" | "client";
  };
}

interface Conversation {
  id: string;
  client_id: string;
  agent_id: string;
  bien_id?: string;
  unread_count?: number;
  last_message?: string;
  last_message_at?: string;
  other_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  bien?: {
    titre: string;
    ville: string;
  };
}

interface RealtimeMessagesProps {
  userId: string;
  initialConversationId?: string;
  userRole?: "agent" | "client";
}

// ── Client Supabase (côté client) ──────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Icônes ──────────────────────────────────────────────────
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <polyline points="15,18 9,12 15,6" />
  </svg>
);
const CheckDoubleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

// ── Formatage de l'heure ────────────────────────────────────
function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const diff = today.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ── Composant avatar ────────────────────────────────────────
function Avatar({ name, src, size = 36 }: { name: string; src?: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <div className="relative rounded-full overflow-hidden flex-shrink-0" style={{ width: size, height: size }}>
        <Image src={src} alt={name} fill className="object-cover" sizes={`${size}px`} />
      </div>
    );
  }
  return (
    <div
      className="rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 text-white font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

// ── Composant principal ─────────────────────────────────────
export default function RealtimeMessages({
  userId,
  initialConversationId,
  userRole = "client",
}: RealtimeMessagesProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showList, setShowList] = useState(!initialConversationId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // ── Scroll bas automatique ──────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── Chargement conversations ────────────────────────────
  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      const field = userRole === "agent" ? "agent_id" : "client_id";

      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id, client_id, agent_id, bien_id, updated_at,
          bien:biens(titre, ville),
          messages(id, content, sender_id, read_at, created_at)
        `)
        .eq(field, userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement conversations:", error);
        setLoading(false);
        return;
      }

      // Charger les profils de l'autre utilisateur
      const processed = await Promise.all(
        (data || []).map(async (conv: Record<string, unknown>) => {
          const otherId = userRole === "agent" ? conv.client_id : conv.agent_id;
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, role")
            .eq("id", otherId)
            .single();

          const msgs = (conv.messages as Message[]) || [];
          const unread = msgs.filter(
            (m: Message) => m.sender_id !== userId && !m.read_at
          ).length;
          const lastMsg = msgs.sort(
            (a: Message, b: Message) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];

          return {
            ...conv,
            other_user: profile,
            unread_count: unread,
            last_message: lastMsg?.content || "Nouvelle conversation",
            last_message_at: lastMsg?.created_at || conv.updated_at,
          } as Conversation;
        })
      );

      setConversations(processed);
      setLoading(false);
    };

    loadConversations();
  }, [userId, userRole]);

  // ── Chargement messages de la conversation active ───────
  useEffect(() => {
    if (!activeConvId) return;
    setLoadingMessages(true);

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id, conversation_id, sender_id, content, read_at, created_at,
          sender:profiles(full_name, avatar_url, role)
        `)
        .eq("conversation_id", activeConvId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data as unknown as Message[]);
      }
      setLoadingMessages(false);

      // Marquer comme lu
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", activeConvId)
        .neq("sender_id", userId)
        .is("read_at", null);
    };

    loadMessages();

    // ── Abonnement Realtime ───────────────────────────────
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`messages:${activeConvId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConvId}`,
        },
        async (payload) => {
          // Charger le profil sender
          const { data: sender } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, role")
            .eq("id", payload.new.sender_id)
            .single();

          const newMsg = { ...payload.new, sender } as Message;
          setMessages((prev) => {
            // Éviter les doublons
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Marquer lu si c'est l'autre qui envoie
          if (payload.new.sender_id !== userId) {
            await supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", payload.new.id);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [activeConvId, userId]);

  // ── Envoi message ───────────────────────────────────────
  const sendMessage = async () => {
    const content = input.trim();
    if (!content || !activeConvId || sending) return;

    setSending(true);
    setInput("");

    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConvId,
      sender_id: userId,
      content,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Erreur envoi message:", error);
      setInput(content); // restaurer
    } else {
      // Mettre à jour updated_at de la conversation
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeConvId);
    }

    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Grouper messages par date ───────────────────────────
  const groupedMessages = messages.reduce<{ date: string; msgs: Message[] }[]>(
    (acc, msg) => {
      const date = formatDate(msg.created_at);
      const last = acc[acc.length - 1];
      if (last && last.date === date) {
        last.msgs.push(msg);
      } else {
        acc.push({ date, msgs: [msg] });
      }
      return acc;
    },
    []
  );

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="flex h-full bg-[var(--background)] rounded-xl overflow-hidden border border-[var(--border)]">
      {/* Liste conversations */}
      <aside
        className={`
          ${showList ? "flex" : "hidden md:flex"}
          flex-col w-full md:w-80 border-r border-[var(--border)]
          bg-[var(--card)]
        `}
      >
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--foreground)]">Messages</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {conversations.filter((c) => (c.unread_count || 0) > 0).length} non lus
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton h-3 w-24 rounded mb-2" />
                  <div className="skeleton h-2.5 w-36 rounded" />
                </div>
              </div>
            ))
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-[var(--muted)] text-sm">
              <p className="text-2xl mb-2">💬</p>
              <p>Aucun message pour l&apos;instant</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConvId(conv.id);
                  setShowList(false);
                }}
                className={`
                  w-full flex items-center gap-3 p-4 text-left
                  border-b border-[var(--border)]
                  transition-colors duration-100 min-h-[44px]
                  ${activeConvId === conv.id
                    ? "bg-emerald-500/10 border-l-2 border-l-emerald-500"
                    : "hover:bg-[var(--background)]"
                  }
                `}
              >
                <div className="relative flex-shrink-0">
                  <Avatar
                    name={conv.other_user?.full_name || "Utilisateur"}
                    src={conv.other_user?.avatar_url}
                    size={44}
                  />
                  {(conv.unread_count || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {conv.unread_count! > 9 ? "9+" : conv.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-sm text-[var(--foreground)] truncate">
                      {conv.other_user?.full_name || "Utilisateur"}
                    </p>
                    <span className="text-[10px] text-[var(--muted)] flex-shrink-0">
                      {conv.last_message_at ? formatTime(conv.last_message_at) : ""}
                    </span>
                  </div>
                  {conv.bien && (
                    <p className="text-[10px] text-emerald-500 truncate font-medium">
                      {conv.bien.titre} · {conv.bien.ville}
                    </p>
                  )}
                  <p className={`text-xs truncate mt-0.5 ${(conv.unread_count || 0) > 0 ? "font-semibold text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                    {conv.last_message}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Zone de chat */}
      <div className={`${!showList || activeConvId ? "flex" : "hidden md:flex"} flex-col flex-1 min-w-0`}>
        {activeConvId && activeConv ? (
          <>
            {/* Header conversation */}
            <div className="flex items-center gap-3 p-4 border-b border-[var(--border)] bg-[var(--card)]">
              <button
                onClick={() => setShowList(true)}
                className="md:hidden p-2 hover:bg-[var(--border)] rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Retour aux conversations"
              >
                <BackIcon />
              </button>
              <Avatar
                name={activeConv.other_user?.full_name || ""}
                src={activeConv.other_user?.avatar_url}
                size={40}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[var(--foreground)] truncate">
                  {activeConv.other_user?.full_name || "Utilisateur"}
                </p>
                {activeConv.bien && (
                  <p className="text-xs text-[var(--muted)] truncate">
                    Re : {activeConv.bien.titre}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-[var(--muted)]">En ligne</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
                </div>
              ) : (
                groupedMessages.map(({ date, msgs }) => (
                  <div key={date}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-[var(--border)]" />
                      <span className="text-xs text-[var(--muted)] px-3 py-1 rounded-full bg-[var(--card)] border border-[var(--border)]">
                        {date}
                      </span>
                      <div className="flex-1 h-px bg-[var(--border)]" />
                    </div>

                    <div className="space-y-2">
                      {msgs.map((msg, i) => {
                        const isMe = msg.sender_id === userId;
                        const showAvatar =
                          !isMe &&
                          (i === 0 || msgs[i - 1]?.sender_id !== msg.sender_id);

                        return (
                          <div
                            key={msg.id}
                            className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            {!isMe && (
                              <div className="w-8 flex-shrink-0">
                                {showAvatar && (
                                  <Avatar
                                    name={msg.sender?.full_name || ""}
                                    src={msg.sender?.avatar_url}
                                    size={28}
                                  />
                                )}
                              </div>
                            )}

                            <div
                              className={`
                                max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                                ${isMe
                                  ? "bg-emerald-500 text-white rounded-br-sm"
                                  : "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-bl-sm"
                                }
                              `}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                                <span className={`text-[10px] ${isMe ? "text-white/70" : "text-[var(--muted)]"}`}>
                                  {formatTime(msg.created_at)}
                                </span>
                                {isMe && (
                                  <span className={msg.read_at ? "text-white" : "text-white/60"}>
                                    {msg.read_at ? <CheckDoubleIcon /> : <CheckIcon />}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input message */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Écrire un message..."
                  rows={1}
                  className="
                    flex-1 resize-none rounded-xl px-4 py-3 text-sm
                    bg-[var(--background)] text-[var(--foreground)]
                    border border-[var(--border)] focus:border-emerald-500
                    outline-none placeholder:text-[var(--muted)]
                    max-h-32 overflow-y-auto
                    min-h-[44px]
                  "
                  style={{
                    height: "auto",
                    minHeight: "44px",
                  }}
                  onInput={(e) => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = "auto";
                    t.style.height = Math.min(t.scrollHeight, 128) + "px";
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="
                    w-11 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600
                    disabled:opacity-40 disabled:cursor-not-allowed
                    text-white flex items-center justify-center flex-shrink-0
                    transition-colors min-w-[44px]
                  "
                  aria-label="Envoyer"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : (
                    <SendIcon />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-[var(--muted)] text-center mt-2">
                Entrée pour envoyer · Maj+Entrée pour nouvelle ligne
              </p>
            </div>
          </>
        ) : (
          /* État vide — aucune conversation sélectionnée */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <p className="text-4xl mb-4">💬</p>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              Vos messages
            </h3>
            <p className="text-sm text-[var(--muted)] max-w-xs">
              Sélectionnez une conversation pour lire et envoyer des messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
