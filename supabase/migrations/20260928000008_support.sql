-- ============================================================================
-- Kisan OS Migration: SUPPORT & COMMUNITY MODULE
-- Tickets, Ticket Messages, Community Posts, Community Comments with RLS
-- ============================================================================

-- 1. Support Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'agronomy', 'order', 'machinery', 'payment', 'other')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- 2. Ticket Messages
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- 3. Community Posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- 4. Community Comments
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- Tickets RLS: Users view/create their own tickets
CREATE POLICY "Users view own support tickets" ON public.support_tickets FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users create support tickets" ON public.support_tickets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users and admins update support tickets" ON public.support_tickets FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- Ticket Messages RLS: Users view/add messages to own tickets
CREATE POLICY "Users view messages for own tickets" ON public.ticket_messages FOR SELECT USING (
  ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = auth.uid()) OR public.is_admin()
);
CREATE POLICY "Users add messages to own tickets" ON public.ticket_messages FOR INSERT WITH CHECK (
  ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = auth.uid()) OR public.is_admin()
);

-- Community Posts & Comments RLS: Public Read, Auth users write
CREATE POLICY "Community posts readable by everyone" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Auth users create community posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors update own community posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Authors delete own community posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Community comments readable by everyone" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Auth users create community comments" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors update own community comments" ON public.community_comments FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Authors delete own community comments" ON public.community_comments FOR DELETE USING (auth.uid() = user_id OR public.is_admin());
