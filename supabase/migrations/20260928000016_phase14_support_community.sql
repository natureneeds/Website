-- Phase 14: Help Centre, Expert Support Tickets, Realtime Chat & Farmer Community

-- 1. Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farmer_name TEXT NOT NULL,
    farmer_phone TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('crop', 'product', 'order', 'finance')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Ticket Messages (Thread Chat)
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL DEFAULT 'farmer' CHECK (sender_role IN ('farmer', 'expert', 'system')),
    message TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Community Posts
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_district TEXT,
    crop_tag TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    photos TEXT[] DEFAULT '{}',
    upvotes_count INTEGER NOT NULL DEFAULT 0,
    upvoted_by UUID[] DEFAULT '{}',
    reported_by UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Community Post Comments
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON public.support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_crop ON public.community_posts(crop_tag);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON public.community_comments(post_id);

-- RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tickets" ON public.support_tickets
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can see messages for own tickets" ON public.support_ticket_messages
    FOR ALL USING (
        ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = auth.uid())
    ) WITH CHECK (
        ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = auth.uid())
    );

CREATE POLICY "Anyone can view community posts" ON public.community_posts
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.community_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Anyone can view community comments" ON public.community_comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON public.community_comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);
