-- ============================================================================
-- Kisan OS Migration: PHASE 10 RENTALS, LABOUR, BOOKING CHAT & REVIEWS
-- Enhanced schema with equipment photos, area served, chat threads, and reviews
-- ============================================================================

-- 1. Enhance rental_listings
ALTER TABLE IF EXISTS public.rental_listings 
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS area_served TEXT,
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS owner_phone TEXT,
  ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 4.8,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 2. Enhance rental_bookings
ALTER TABLE IF EXISTS public.rental_bookings
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS hours_or_days INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS decline_reason TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::TEXT, now());

-- Update status check constraint on rental_bookings if needed
ALTER TABLE public.rental_bookings DROP CONSTRAINT IF EXISTS rental_bookings_status_check;
ALTER TABLE public.rental_bookings ADD CONSTRAINT rental_bookings_status_check 
  CHECK (status IN ('requested', 'confirmed', 'declined', 'in_progress', 'completed', 'cancelled'));

-- 3. Enhance labour_listings
ALTER TABLE IF EXISTS public.labour_listings
  ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS area_served TEXT,
  ADD COLUMN IF NOT EXISTS leader_name TEXT,
  ADD COLUMN IF NOT EXISTS leader_phone TEXT,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 4.9,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 4. Enhance labour_bookings
ALTER TABLE IF EXISTS public.labour_bookings
  ADD COLUMN IF NOT EXISTS leader_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS decline_reason TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::TEXT, now());

ALTER TABLE public.labour_bookings DROP CONSTRAINT IF EXISTS labour_bookings_status_check;
ALTER TABLE public.labour_bookings ADD CONSTRAINT labour_bookings_status_check 
  CHECK (status IN ('requested', 'confirmed', 'declined', 'completed', 'cancelled'));

-- 5. Booking In-App Chat Threads
CREATE TABLE IF NOT EXISTS public.booking_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT NOT NULL,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('rental', 'labour')),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

ALTER TABLE public.booking_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view booking messages" ON public.booking_messages
  FOR SELECT USING (
    sender_id = auth.uid() OR
    booking_id IN (SELECT id::text FROM public.rental_bookings WHERE renter_id = auth.uid() OR owner_id = auth.uid()) OR
    booking_id IN (SELECT id::text FROM public.labour_bookings WHERE farmer_id = auth.uid() OR leader_id = auth.uid()) OR
    public.is_admin()
  );

CREATE POLICY "Participants send booking messages" ON public.booking_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- 6. Booking Ratings & Reviews
CREATE TABLE IF NOT EXISTS public.booking_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT NOT NULL,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('rental', 'labour')),
  listing_id TEXT NOT NULL,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

ALTER TABLE public.booking_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews" ON public.booking_reviews FOR SELECT USING (true);
CREATE POLICY "Reviewers can write reviews" ON public.booking_reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());
