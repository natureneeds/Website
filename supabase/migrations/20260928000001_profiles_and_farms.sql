-- ============================================================================
-- Kisan OS Migration: profiles & farms tables with Row Level Security (RLS)
-- Phase 2: User Onboarding & Farm Profiles
-- ============================================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE,
  full_name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- 2. Create farms table
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  village TEXT NOT NULL,
  land_size NUMERIC(10, 2) NOT NULL,
  land_unit TEXT NOT NULL DEFAULT 'acre' CHECK (land_unit IN ('acre', 'bigha')),
  soil_type TEXT NOT NULL,
  water_source TEXT NOT NULL,
  crops TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- 3. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

-- 5. Profiles RLS Policies
-- Users can only read their own profile row
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can only insert their own profile row
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile row
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Farms RLS Policies
-- Users can only view their own farm rows
CREATE POLICY "Users can view own farms"
  ON public.farms
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own farm rows
CREATE POLICY "Users can insert own farms"
  ON public.farms
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own farm rows
CREATE POLICY "Users can update own farms"
  ON public.farms
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own farm rows
CREATE POLICY "Users can delete own farms"
  ON public.farms
  FOR DELETE
  USING (auth.uid() = user_id);
