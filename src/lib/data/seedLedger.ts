export type LedgerEntryType = 'expense' | 'income'

export type LedgerCategory =
  | 'seed'
  | 'fertilizer'
  | 'pesticide'
  | 'labour'
  | 'diesel'
  | 'electricity'
  | 'rent'
  | 'machinery'
  | 'produce_sale'
  | 'other'

export interface LedgerEntry {
  id: string
  user_id: string
  crop_plan_id?: string
  crop_name: string
  entry_type: LedgerEntryType
  category: LedgerCategory
  amount: number
  date: string
  source_type: 'auto_marketplace' | 'auto_produce_sale' | 'manual'
  source_id?: string
  notes?: string
  created_at: string
}

export interface CropSeasonEstimate {
  crop_name: string
  season: 'Kharif' | 'Rabi' | 'Zaid'
  planned_area_acres: number
  planned_expense: number
  planned_income: number
  planned_profit: number
}

export const LEDGER_CATEGORY_META: Record<
  LedgerCategory,
  { label: string; label_hi: string; color: string; isIncome: boolean }
> = {
  seed: { label: 'Certified Seeds', label_hi: 'प्रमाणित बीज', color: 'var(--lime)', isIncome: false },
  fertilizer: { label: 'Fertilizers & Nutrients', label_hi: 'खाद व उर्वरक', color: 'var(--forest)', isIncome: false },
  pesticide: { label: 'Crop Protection & Bio', label_hi: 'कीटनाशक व फफूंदनाशक', color: 'var(--lime-strong)', isIncome: false },
  labour: { label: 'Farm Labour & Weeding', label_hi: 'मजदूरी व निराई-गुड़ाई', color: 'var(--warning)', isIncome: false },
  diesel: { label: 'Diesel & Fuel', label_hi: 'डीजल व ईंधन', color: 'var(--danger)', isIncome: false },
  electricity: { label: 'Tube-well Electricity', label_hi: 'ट्यूबवेल बिजली बिल', color: 'var(--ink)', isIncome: false },
  rent: { label: 'Equipment & Land Rent', label_hi: 'उपकरण व पट्टा किराया', color: 'var(--muted)', isIncome: false },
  machinery: { label: 'Harvester & Tillage', label_hi: 'हार्वेस्टर व जुताई', color: 'var(--warning)', isIncome: false },
  other: { label: 'Miscellaneous Costs', label_hi: 'अन्य व्यय', color: 'var(--muted)', isIncome: false },
  produce_sale: { label: 'Mandi Produce Sale', label_hi: 'मंडी उपज बिक्री आय', color: 'var(--lime)', isIncome: true },
}

export const SEEDED_PLANNED_ESTIMATES: Record<string, CropSeasonEstimate> = {
  'Wheat HD-3086': {
    crop_name: 'Wheat HD-3086',
    season: 'Rabi',
    planned_area_acres: 5,
    planned_expense: 42000,
    planned_income: 130000,
    planned_profit: 88000,
  },
  'Mustard Pusa Bold': {
    crop_name: 'Mustard Pusa Bold',
    season: 'Rabi',
    planned_area_acres: 3,
    planned_expense: 21000,
    planned_income: 68000,
    planned_profit: 47000,
  },
  'Paddy Basmati 1121': {
    crop_name: 'Paddy Basmati 1121',
    season: 'Kharif',
    planned_area_acres: 4,
    planned_expense: 48000,
    planned_income: 145000,
    planned_profit: 97000,
  },
}

export const SEEDED_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: 'led_1',
    user_id: 'usr_OTg3NjU0MzIxMA00',
    crop_name: 'Wheat HD-3086',
    entry_type: 'expense',
    category: 'seed',
    amount: 3200,
    date: '2026-09-02',
    source_type: 'auto_marketplace',
    source_id: 'ord_WHEAT_SEED_01',
    notes: 'Wheat HD-3086 Certified Foundation Seeds (2 Bags)',
    created_at: '2026-09-02T10:00:00Z',
  },
  {
    id: 'led_2',
    user_id: 'usr_OTg3NjU0MzIxMA00',
    crop_name: 'Wheat HD-3086',
    entry_type: 'expense',
    category: 'fertilizer',
    amount: 4150,
    date: '2026-09-06',
    source_type: 'auto_marketplace',
    source_id: 'ord_FERT_DAP_02',
    notes: 'IFFCO DAP (50kg) + Neem Coated Urea dose',
    created_at: '2026-09-06T14:30:00Z',
  },
  {
    id: 'led_3',
    user_id: 'usr_OTg3NjU0MzIxMA00',
    crop_name: 'Wheat HD-3086',
    entry_type: 'expense',
    category: 'machinery',
    amount: 5400,
    date: '2026-09-10',
    source_type: 'manual',
    notes: 'Tractor laser leveling & deep ploughing (6 hrs @ ₹900/hr)',
    created_at: '2026-09-10T18:00:00Z',
  },
  {
    id: 'led_4',
    user_id: 'usr_OTg3NjU0MzIxMA00',
    crop_name: 'Wheat HD-3086',
    entry_type: 'expense',
    category: 'diesel',
    amount: 2800,
    date: '2026-09-15',
    source_type: 'manual',
    notes: 'Diesel for generator tube-well pumping (32 Litres)',
    created_at: '2026-09-15T09:20:00Z',
  },
  {
    id: 'led_5',
    user_id: 'usr_OTg3NjU0MzIxMA00',
    crop_name: 'Wheat HD-3086',
    entry_type: 'expense',
    category: 'labour',
    amount: 3600,
    date: '2026-09-20',
    source_type: 'manual',
    notes: 'Sowing labour crew (6 persons @ ₹600/day)',
    created_at: '2026-09-20T17:00:00Z',
  },
  {
    id: 'led_6',
    user_id: 'usr_OTg3NjU0MzIxMA00',
    crop_name: 'Wheat HD-3086',
    entry_type: 'income',
    category: 'produce_sale',
    amount: 120500,
    date: '2026-09-26',
    source_type: 'auto_produce_sale',
    source_id: 'off_wheat_deal_01',
    notes: 'Accepted Sale: 50 Quintals Wheat @ ₹2,410/Q to Agrigate Exporters',
    created_at: '2026-09-26T16:45:00Z',
  },
  {
    id: 'led_7',
    user_id: 'usr_OTg3NjU0MzIxMA00',
    crop_name: 'Mustard Pusa Bold',
    entry_type: 'expense',
    category: 'seed',
    amount: 1850,
    date: '2026-09-08',
    source_type: 'auto_marketplace',
    source_id: 'ord_MUST_SEED_01',
    notes: 'Pusa Bold certified seed packet (3 acres)',
    created_at: '2026-09-08T11:10:00Z',
  },
  {
    id: 'led_8',
    user_id: 'usr_OTg3NjU0MzIxMA00',
    crop_name: 'Mustard Pusa Bold',
    entry_type: 'expense',
    category: 'fertilizer',
    amount: 2600,
    date: '2026-09-12',
    source_type: 'manual',
    notes: 'Single Super Phosphate (SSP) + Sulphur broadcast',
    created_at: '2026-09-12T15:00:00Z',
  },
]
