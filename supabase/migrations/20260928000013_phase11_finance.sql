-- ============================================================================
-- Kisan OS Migration: PHASE 11 FINANCE, SCHEMES, ELIGIBILITY & CALL-BACK HELP
-- ============================================================================

-- 1. Enhance schemes table
ALTER TABLE IF EXISTS public.schemes
  ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'subsidies' CHECK (section IN ('loans_kcc', 'insurance', 'subsidies_schemes')),
  ADD COLUMN IF NOT EXISTS max_benefit TEXT,
  ADD COLUMN IF NOT EXISTS required_docs TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS eligible_crops TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS min_land_acre NUMERIC(6, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_land_acre NUMERIC(6, 2) DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS official_portal_url TEXT,
  ADD COLUMN IF NOT EXISTS portal_name TEXT DEFAULT 'National Agriculture Portal';

-- 2. Allow 'finance' category in support_tickets
ALTER TABLE public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_category_check;
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_category_check 
  CHECK (category IN ('technical', 'agronomy', 'order', 'machinery', 'payment', 'finance', 'other'));
