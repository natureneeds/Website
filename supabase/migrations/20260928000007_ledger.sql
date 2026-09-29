-- ============================================================================
-- Kisan OS Migration: FARM LEDGER MODULE
-- Ledger Entries (Income & Expenses tracking per farm and crop plan) with RLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_plan_id UUID REFERENCES public.crop_plans(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  category TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- Index
CREATE INDEX IF NOT EXISTS idx_ledger_farm ON public.ledger_entries(farm_id);
CREATE INDEX IF NOT EXISTS idx_ledger_date ON public.ledger_entries(date);

-- Enable RLS
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

-- Ledger RLS: Farmers see/manage only their own farm ledger entries
CREATE POLICY "Farmers view own ledger entries"
  ON public.ledger_entries
  FOR SELECT
  USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Farmers insert own ledger entries"
  ON public.ledger_entries
  FOR INSERT
  WITH CHECK (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Farmers update own ledger entries"
  ON public.ledger_entries
  FOR UPDATE
  USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Farmers delete own ledger entries"
  ON public.ledger_entries
  FOR DELETE
  USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
    OR public.is_admin()
  );
