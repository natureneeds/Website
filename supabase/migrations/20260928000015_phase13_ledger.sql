-- Phase 13 Migration: Ledger, P&L Accounting, and Cost Tracking
-- Tables for financial ledger entries linked to crop plans and produce sales

CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    crop_plan_id UUID REFERENCES public.crop_plans(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('expense', 'income')),
    category TEXT NOT NULL CHECK (category IN (
        'seed', 'fertilizer', 'pesticide', 'labour', 'diesel', 
        'electricity', 'rent', 'machinery', 'produce_sale', 'other'
    )),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN (
        'auto_marketplace', 'auto_produce_sale', 'manual'
    )),
    source_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast per-crop and per-user financial aggregation
CREATE INDEX IF NOT EXISTS idx_ledger_entries_user ON public.ledger_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_crop ON public.ledger_entries(crop_name);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_type ON public.ledger_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_date ON public.ledger_entries(date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can manage own ledger entries"
    ON public.ledger_entries
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Trigger to auto-log income when produce sale is completed
-- (In client mockDb, simulated in updateProduceOfferStatus)
