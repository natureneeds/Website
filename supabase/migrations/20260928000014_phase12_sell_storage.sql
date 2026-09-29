-- ============================================================================
-- Kisan OS Migration: PHASE 12 MANDI PRICES, PRODUCE OFFERS & WAREHOUSES
-- ============================================================================

-- 1. Enhance produce_listings
ALTER TABLE IF EXISTS public.produce_listings
  ADD COLUMN IF NOT EXISTS crop_name TEXT,
  ADD COLUMN IF NOT EXISTS farmer_name TEXT,
  ADD COLUMN IF NOT EXISTS farmer_phone TEXT,
  ADD COLUMN IF NOT EXISTS quality_grade TEXT DEFAULT 'Grade A',
  ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Produce Offers Table
CREATE TABLE IF NOT EXISTS public.produce_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.produce_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  offer_price NUMERIC(10, 2) NOT NULL CHECK (offer_price > 0),
  qty NUMERIC(10, 2) NOT NULL CHECK (qty > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'countered')),
  counter_price NUMERIC(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

ALTER TABLE public.produce_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers and farmers view produce offers" ON public.produce_offers FOR SELECT USING (
  buyer_id = auth.uid() OR
  listing_id IN (SELECT id FROM public.produce_listings WHERE farmer_id = auth.uid()) OR
  public.is_admin()
);

CREATE POLICY "Buyers create produce offers" ON public.produce_offers FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Farmers and buyers update produce offers" ON public.produce_offers FOR UPDATE USING (
  buyer_id = auth.uid() OR
  listing_id IN (SELECT id FROM public.produce_listings WHERE farmer_id = auth.uid()) OR
  public.is_admin()
);

-- 3. Enhance Warehouses
ALTER TABLE IF EXISTS public.warehouses
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'cold_storage' CHECK (type IN ('cold_storage', 'grain_silo', 'dry_warehouse')),
  ADD COLUMN IF NOT EXISTS available_capacity NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS price_unit TEXT DEFAULT 'per_quintal_month',
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{"24/7 CCTV", "Govt Warehouse Receipt (e-NWR)", "Insurance Covered", "Moisture Controlled"}';

-- 4. Warehouse Bookings Table
CREATE TABLE IF NOT EXISTS public.warehouse_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  qty_quintals NUMERIC(10, 2) NOT NULL CHECK (qty_quintals > 0),
  start_date DATE NOT NULL,
  months_count INTEGER NOT NULL DEFAULT 1 CHECK (months_count > 0),
  total_cost NUMERIC(12, 2) NOT NULL CHECK (total_cost >= 0),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'stored', 'released', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

ALTER TABLE public.warehouse_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers view own warehouse bookings" ON public.warehouse_bookings FOR SELECT USING (farmer_id = auth.uid() OR public.is_admin());
CREATE POLICY "Farmers create warehouse bookings" ON public.warehouse_bookings FOR INSERT WITH CHECK (farmer_id = auth.uid());
