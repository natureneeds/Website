-- ============================================================================
-- Kisan OS Migration: FINANCE & GOVERNMENT SCHEMES MODULE
-- Government Schemes, Subsidies, KCC, Crop Insurance with RLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('subsidy', 'credit_loan', 'insurance', 'grant', 'infrastructure', 'advisory')),
  description TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  link TEXT,
  states TEXT[] NOT NULL DEFAULT '{"ALL"}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- Enable RLS
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;

-- Schemes RLS: Public Read, Admin Write
CREATE POLICY "Schemes are readable by all" ON public.schemes FOR SELECT USING (true);
CREATE POLICY "Admins can manage schemes" ON public.schemes FOR ALL USING (public.is_admin());
