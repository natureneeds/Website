-- ============================================================================
-- Kisan OS Migration: STORAGE & SALES MODULE
-- Warehouses, Produce Listings & Live Mandi Prices with RLS
-- ============================================================================

-- 1. Warehouses (Cold Storage, Grain Silos)
CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  capacity NUMERIC(12, 2) NOT NULL CHECK (capacity > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- 2. Produce Listings (Farmers selling harvested grain/crops directly)
CREATE TABLE IF NOT EXISTS public.produce_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
  qty NUMERIC(10, 2) NOT NULL CHECK (qty > 0),
  ask_price NUMERIC(10, 2) NOT NULL CHECK (ask_price > 0),
  district TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'negotiating', 'sold', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- 3. Mandi Prices (Live daily market rates per crop)
CREATE TABLE IF NOT EXISTS public.mandi_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  market TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mandi_crop_date ON public.mandi_prices(crop_id, date);
CREATE INDEX IF NOT EXISTS idx_produce_district ON public.produce_listings(district);

-- Enable RLS
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;

-- Warehouses RLS: Public Read, Admin Write
CREATE POLICY "Warehouses viewable by everyone" ON public.warehouses FOR SELECT USING (true);
CREATE POLICY "Admins manage warehouses" ON public.warehouses FOR ALL USING (public.is_admin());

-- Produce Listings RLS: Public Read active, Farmer writes own
CREATE POLICY "Active produce listings viewable by everyone" ON public.produce_listings FOR SELECT USING (status = 'active' OR farmer_id = auth.uid() OR public.is_admin());
CREATE POLICY "Farmers manage own produce listings" ON public.produce_listings FOR ALL USING (farmer_id = auth.uid() OR public.is_admin());

-- Mandi Prices RLS: Public Read, Admin Write
CREATE POLICY "Mandi prices viewable by everyone" ON public.mandi_prices FOR SELECT USING (true);
CREATE POLICY "Admins manage mandi prices" ON public.mandi_prices FOR ALL USING (public.is_admin());
