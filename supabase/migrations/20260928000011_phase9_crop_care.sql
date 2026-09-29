-- ============================================================================
-- Migration: 20260928000011_phase9_crop_care.sql
-- Description: Phase 9 Crop Care, AI Diagnoses, Notifications & Knowledge Articles
-- ============================================================================

-- 1. In-App Notifications (Weather alerts, Task reminders, Diagnostics)
CREATE TABLE IF NOT EXISTS public.in_app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weather_alert', 'task_reminder', 'diagnosis', 'general')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'danger', 'success')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.in_app_notifications(user_id, is_read);

-- 2. Crop Diagnoses (Leaf disease scans)
CREATE TABLE IF NOT EXISTS public.crop_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  crop_type TEXT,
  issue_name TEXT NOT NULL,
  confidence NUMERIC(5, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  symptoms TEXT NOT NULL,
  treatment_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_product_ids TEXT[] NOT NULL DEFAULT '{}',
  expert_review_requested BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'expert_escalated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

CREATE INDEX IF NOT EXISTS idx_crop_diagnoses_user ON public.crop_diagnoses(user_id);

-- 3. Knowledge Articles (Searchable English + Hindi guides)
CREATE TABLE IF NOT EXISTS public.knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  crop_tag TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('disease_control', 'nutrient_management', 'water_saving', 'soil_health', 'harvest_tips')),
  summary TEXT NOT NULL,
  summary_hi TEXT NOT NULL,
  content TEXT NOT NULL,
  content_hi TEXT NOT NULL,
  read_time_minutes INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::TEXT, now())
);

-- Enable RLS
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;

-- Notifications RLS
CREATE POLICY "Users view own notifications" ON public.in_app_notifications
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users insert own notifications" ON public.in_app_notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON public.in_app_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications" ON public.in_app_notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Diagnoses RLS
CREATE POLICY "Users view own diagnoses" ON public.crop_diagnoses
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users insert own diagnoses" ON public.crop_diagnoses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own diagnoses" ON public.crop_diagnoses
  FOR UPDATE USING (auth.uid() = user_id);

-- Knowledge Articles RLS: Public Read, Admin Write
CREATE POLICY "Knowledge articles readable by everyone" ON public.knowledge_articles
  FOR SELECT USING (true);

CREATE POLICY "Admins manage knowledge articles" ON public.knowledge_articles
  FOR ALL USING (public.is_admin());
