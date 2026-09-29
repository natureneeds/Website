-- ============================================================================
-- Kisan OS Migration: PLANNER MODULE
-- Crops (Catalog), Crop Plans, Crop Tasks with RLS
-- ============================================================================

-- 1. Crops Catalog (Public Read)
CREATE TABLE IF NOT EXISTS public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  seasons TEXT[] NOT NULL DEFAULT '{}',
  soil_types TEXT[] NOT NULL DEFAULT '{}',
  water_need TEXT NOT NULL DEFAULT 'medium' CHECK (water_need IN ('low', 'medium', 'high', 'very_high')),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  avg_cost_per_acre NUMERIC(10, 2) NOT NULL DEFAULT 0,
  avg_yield_per_acre NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- 2. Crop Plans (Farmers plan per farm)
CREATE TABLE IF NOT EXISTS public.crop_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
  sow_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'sown', 'growing', 'harvesting', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- 3. Crop Tasks (Tasks scheduled under a plan)
CREATE TABLE IF NOT EXISTS public.crop_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.crop_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crop_plans_farm ON public.crop_plans(farm_id);
CREATE INDEX IF NOT EXISTS idx_crop_tasks_plan ON public.crop_tasks(plan_id);

-- Enable RLS
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_tasks ENABLE ROW LEVEL SECURITY;

-- Crops RLS: Public Read, Admin Write
CREATE POLICY "Crops are viewable by everyone" ON public.crops FOR SELECT USING (true);
CREATE POLICY "Admins can manage crops" ON public.crops FOR ALL USING (public.is_admin());

-- Crop Plans RLS: Farmers see/manage only their own farm plans
CREATE POLICY "Farmers view own crop plans"
  ON public.crop_plans
  FOR SELECT
  USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Farmers insert own crop plans"
  ON public.crop_plans
  FOR INSERT
  WITH CHECK (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
  );

CREATE POLICY "Farmers update own crop plans"
  ON public.crop_plans
  FOR UPDATE
  USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Farmers delete own crop plans"
  ON public.crop_plans
  FOR DELETE
  USING (
    farm_id IN (SELECT id FROM public.farms WHERE user_id = auth.uid())
    OR public.is_admin()
  );

-- Crop Tasks RLS: Farmers manage tasks for their own plans
CREATE POLICY "Farmers view own crop tasks"
  ON public.crop_tasks
  FOR SELECT
  USING (
    plan_id IN (
      SELECT cp.id FROM public.crop_plans cp
      JOIN public.farms f ON cp.farm_id = f.id
      WHERE f.user_id = auth.uid()
    )
    OR public.is_admin()
  );

CREATE POLICY "Farmers insert own crop tasks"
  ON public.crop_tasks
  FOR INSERT
  WITH CHECK (
    plan_id IN (
      SELECT cp.id FROM public.crop_plans cp
      JOIN public.farms f ON cp.farm_id = f.id
      WHERE f.user_id = auth.uid()
    )
  );

CREATE POLICY "Farmers update own crop tasks"
  ON public.crop_tasks
  FOR UPDATE
  USING (
    plan_id IN (
      SELECT cp.id FROM public.crop_plans cp
      JOIN public.farms f ON cp.farm_id = f.id
      WHERE f.user_id = auth.uid()
    )
    OR public.is_admin()
  );

CREATE POLICY "Farmers delete own crop tasks"
  ON public.crop_tasks
  FOR DELETE
  USING (
    plan_id IN (
      SELECT cp.id FROM public.crop_plans cp
      JOIN public.farms f ON cp.farm_id = f.id
      WHERE f.user_id = auth.uid()
    )
    OR public.is_admin()
  );
