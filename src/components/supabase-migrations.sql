-- ============================================================
-- MIGRATIONS SUPABASE — Immo West Afro Bénin
-- Supabase ID : huvtgaunkcglyeypdtws
-- Exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- ── 1. TABLE CONVERSATIONS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bien_id       UUID REFERENCES public.biens(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Évite les doublons de conversations pour le même bien
  UNIQUE(client_id, agent_id, bien_id)
);

-- Index pour requêtes fréquentes
CREATE INDEX idx_conversations_client ON public.conversations(client_id);
CREATE INDEX idx_conversations_agent ON public.conversations(agent_id);
CREATE INDEX idx_conversations_updated ON public.conversations(updated_at DESC);

-- ── 2. TABLE MESSAGES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL CHECK (char_length(content) <= 2000),
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour requêtes fréquentes
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_unread ON public.messages(conversation_id, read_at) WHERE read_at IS NULL;

-- ── 3. TABLE PUSH SUBSCRIPTIONS ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_push_user ON public.push_subscriptions(user_id);

-- ── 4. MISE À JOUR updated_at automatique ───────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour mettre à jour la conversation quand un message est envoyé
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_update_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- ── 5. ROW LEVEL SECURITY ───────────────────────────────────

-- Conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = agent_id);

CREATE POLICY "Clients can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = agent_id);

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.client_id = auth.uid() OR c.agent_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.client_id = auth.uid() OR c.agent_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages (read_at)"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.client_id = auth.uid() OR c.agent_id = auth.uid())
    )
  );

-- Push Subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 6. REALTIME — Activer pour les tables messages ──────────
-- À exécuter aussi dans Supabase Dashboard > Database > Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- ── 7. VUE — Résumé conversations avec dernier message ──────
CREATE OR REPLACE VIEW public.conversation_summaries AS
SELECT
  c.id,
  c.client_id,
  c.agent_id,
  c.bien_id,
  c.updated_at,
  b.titre as bien_titre,
  b.ville as bien_ville,
  last_msg.content as last_message,
  last_msg.created_at as last_message_at,
  last_msg.sender_id as last_sender_id,
  COALESCE(unread_count.cnt, 0) as unread_count
FROM public.conversations c
LEFT JOIN public.biens b ON b.id = c.bien_id
LEFT JOIN LATERAL (
  SELECT content, created_at, sender_id
  FROM public.messages
  WHERE conversation_id = c.id
  ORDER BY created_at DESC
  LIMIT 1
) last_msg ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*) as cnt
  FROM public.messages
  WHERE conversation_id = c.id
    AND read_at IS NULL
    AND sender_id != auth.uid()
) unread_count ON true;

-- ── 8. FUNCTION — Créer ou récupérer une conversation ───────
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_client_id UUID,
  p_agent_id UUID,
  p_bien_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Chercher conversation existante
  SELECT id INTO v_conversation_id
  FROM public.conversations
  WHERE client_id = p_client_id
    AND agent_id = p_agent_id
    AND (bien_id = p_bien_id OR (bien_id IS NULL AND p_bien_id IS NULL))
  LIMIT 1;

  -- Si pas trouvée, créer
  IF v_conversation_id IS NULL THEN
    INSERT INTO public.conversations (client_id, agent_id, bien_id)
    VALUES (p_client_id, p_agent_id, p_bien_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
