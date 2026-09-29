-- ============================================================================
-- Kisan OS Migration: RENTALS & LABOUR MODULE
-- Machinery Rentals, Bookings, Labour Listings & Bookings with RLS
-- ============================================================================

-- 1. Rental Listings (Tractors, Harvesters, Spray Drones, Laser Levelers)
CREATE TABLE IF NOT EXISTS public.rental_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('tractor', 'harvester', 'drone', 'laser_leveler', 'rotavator', 'planter', 'other')),
  title TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  price_unit TEXT NOT NULL DEFAULT 'per_hour' CHECK (price_unit IN ('per_hour', 'per_acre', 'per_day')),
  district TEXT NOT NULL,
  availability BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- 2. Rental Bookings
CREATE TABLE IF NOT EXISTS public.rental_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.rental_listings(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- 3. Labour Listings (Sowing Crews, Harvesters, Weeding Groups)
CREATE TABLE IF NOT EXISTS public.labour_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  group_size INTEGER NOT NULL DEFAULT 1 CHECK (group_size > 0),
  daily_rate NUMERIC(10, 2) NOT NULL CHECK (daily_rate >= 0),
  district TEXT NOT NULL,
  availability BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- 4. Labour Bookings
CREATE TABLE IF NOT EXISTS public.labour_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.labour_listings(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  days_count INTEGER NOT NULL DEFAULT 1 CHECK (days_count > 0),
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rental_district ON public.rental_listings(district);
CREATE INDEX IF NOT EXISTS idx_labour_district ON public.labour_listings(district);

-- Enable RLS
ALTER TABLE public.rental_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labour_bookings ENABLE ROW LEVEL SECURITY;

-- Rental Listings RLS: Public Read available, Owner writes own
CREATE POLICY "Rental listings viewable by everyone" ON public.rental_listings FOR SELECT USING (availability = true OR owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "Owners manage their rental listings" ON public.rental_listings FOR ALL USING (owner_id = auth.uid() OR public.is_admin());

-- Rental Bookings RLS: Renter and Owner can view/update
CREATE POLICY "Renters and owners view rental bookings" ON public.rental_bookings FOR SELECT USING (
  renter_id = auth.uid() OR
  listing_id IN (SELECT id FROM public.rental_listings WHERE owner_id = auth.uid()) OR
  public.is_admin()
);
CREATE POLICY "Renters create rental bookings" ON public.rental_bookings FOR INSERT WITH CHECK (renter_id = auth.uid());
CREATE POLICY "Renters and owners update rental bookings" ON public.rental_bookings FOR UPDATE USING (
  renter_id = auth.uid() OR
  listing_id IN (SELECT id FROM public.rental_listings WHERE owner_id = auth.uid()) OR
  public.is_admin()
);

-- Labour Listings RLS: Public Read available, Leader writes own
CREATE POLICY "Labour listings viewable by everyone" ON public.labour_listings FOR SELECT USING (availability = true OR leader_id = auth.uid() OR public.is_admin());
CREATE POLICY "Leaders manage their labour listings" ON public.labour_listings FOR ALL USING (leader_id = auth.uid() OR public.is_admin());

-- Labour Bookings RLS: Farmer and Leader can view/update
CREATE POLICY "Farmers and leaders view labour bookings" ON public.labour_bookings FOR SELECT USING (
  farmer_id = auth.uid() OR
  listing_id IN (SELECT id FROM public.labour_listings WHERE leader_id = auth.uid()) OR
  public.is_admin()
);
CREATE POLICY "Farmers create labour bookings" ON public.labour_bookings FOR INSERT WITH CHECK (farmer_id = auth.uid());
CREATE POLICY "Farmers and leaders update labour bookings" ON public.labour_bookings FOR UPDATE USING (
  farmer_id = auth.uid() OR
  listing_id IN (SELECT id FROM public.labour_listings WHERE leader_id = auth.uid()) OR
  public.is_admin()
);
