export interface MandiPriceItem {
  id: string
  crop_name: string
  crop_name_hi: string
  market: string
  district: string
  state: string
  modal_price: number // in ₹/quintal
  min_price: number
  max_price: number
  msp: number
  price_change_30d_pct: number
  trend_history_30d: number[] // 30 daily price points for sparkline
  last_updated: string
}

export interface ProduceListingItem {
  id: string
  farmer_id: string
  farmer_name: string
  farmer_phone: string
  crop_name: string
  qty_quintals: number
  ask_price_per_quintal: number
  district: string
  quality_grade: string
  moisture_pct?: number
  photos: string[]
  description: string
  status: 'active' | 'negotiating' | 'sold' | 'expired'
  created_at: string
}

export interface ProduceOfferItem {
  id: string
  listing_id: string
  buyer_id: string
  buyer_name: string
  buyer_phone: string
  offer_price: number // in ₹/quintal
  qty: number // in quintals
  status: 'pending' | 'accepted' | 'declined' | 'countered'
  counter_price?: number
  notes?: string
  created_at: string
}

export interface WarehouseItem {
  id: string
  name: string
  district: string
  address: string
  type: 'cold_storage' | 'grain_silo' | 'dry_warehouse'
  total_capacity_mt: number
  available_capacity_mt: number
  price_per_quintal_month: number
  contact_phone: string
  amenities: string[]
}

export const SEEDED_MANDI_PRICES: MandiPriceItem[] = [
  {
    id: 'mandi_1',
    crop_name: 'Wheat (गेहूँ)',
    crop_name_hi: 'गेहूँ',
    market: 'Hisar APMC Mandi',
    district: 'Hisar',
    state: 'Haryana',
    modal_price: 2380,
    min_price: 2310,
    max_price: 2420,
    msp: 2275,
    price_change_30d_pct: 8.4,
    trend_history_30d: [
      2195, 2200, 2210, 2215, 2230, 2225, 2240, 2250, 2260, 2255,
      2270, 2280, 2275, 2290, 2300, 2310, 2320, 2315, 2330, 2340,
      2335, 2350, 2360, 2355, 2365, 2370, 2375, 2380, 2375, 2380,
    ],
    last_updated: 'Today, 11:30 AM',
  },
  {
    id: 'mandi_2',
    crop_name: 'Mustard (सरसों)',
    crop_name_hi: 'सरसों',
    market: 'Hansi Grain Market',
    district: 'Hisar',
    state: 'Haryana',
    modal_price: 5480,
    min_price: 5390,
    max_price: 5550,
    msp: 5650,
    price_change_30d_pct: 5.2,
    trend_history_30d: [
      5210, 5220, 5240, 5230, 5260, 5280, 5300, 5290, 5320, 5340,
      5330, 5360, 5380, 5370, 5390, 5410, 5400, 5420, 5440, 5430,
      5450, 5460, 5450, 5470, 5480, 5475, 5480, 5490, 5475, 5480,
    ],
    last_updated: 'Today, 10:45 AM',
  },
  {
    id: 'mandi_3',
    crop_name: 'Paddy Basmati 1121 (धान)',
    crop_name_hi: 'धान (बासमती)',
    market: 'Karnal New Grain Market',
    district: 'Karnal',
    state: 'Haryana',
    modal_price: 3850,
    min_price: 3760,
    max_price: 3950,
    msp: 2203,
    price_change_30d_pct: -2.3,
    trend_history_30d: [
      3940, 3950, 3930, 3920, 3900, 3890, 3910, 3900, 3880, 3870,
      3890, 3880, 3860, 3850, 3870, 3860, 3850, 3840, 3860, 3850,
      3840, 3830, 3850, 3840, 3850, 3860, 3850, 3840, 3850, 3850,
    ],
    last_updated: 'Today, 12:15 PM',
  },
  {
    id: 'mandi_4',
    crop_name: 'Cotton Medium Staple (कपास)',
    crop_name_hi: 'कपास (नरमा)',
    market: 'Sirsa APMC Yard',
    district: 'Sirsa',
    state: 'Haryana',
    modal_price: 7250,
    min_price: 7100,
    max_price: 7380,
    msp: 6620,
    price_change_30d_pct: 11.5,
    trend_history_30d: [
      6500, 6520, 6560, 6600, 6650, 6700, 6720, 6780, 6820, 6850,
      6900, 6940, 6980, 7020, 7050, 7100, 7080, 7120, 7160, 7180,
      7200, 7220, 7210, 7230, 7250, 7240, 7260, 7270, 7250, 7250,
    ],
    last_updated: 'Today, 09:50 AM',
  },
  {
    id: 'mandi_5',
    crop_name: 'Potato (आलू)',
    crop_name_hi: 'आलू',
    market: 'Ludhiana Sabzi Mandi',
    district: 'Ludhiana',
    state: 'Punjab',
    modal_price: 1350,
    min_price: 1250,
    max_price: 1450,
    msp: 0,
    price_change_30d_pct: 14.8,
    trend_history_30d: [
      1175, 1180, 1190, 1200, 1210, 1220, 1235, 1240, 1250, 1260,
      1270, 1280, 1290, 1300, 1310, 1320, 1315, 1325, 1335, 1340,
      1330, 1340, 1345, 1350, 1355, 1360, 1350, 1355, 1350, 1350,
    ],
    last_updated: 'Today, 08:30 AM',
  },
]

export const SEEDED_PRODUCE_LISTINGS: ProduceListingItem[] = [
  {
    id: 'prod_1',
    farmer_id: 'usr_farmer_demo',
    farmer_name: 'Kuldeep Singh Brar',
    farmer_phone: '+91 98765 11223',
    crop_name: 'Wheat HD-3086 (Sharbati Quality)',
    qty_quintals: 80,
    ask_price_per_quintal: 2420,
    district: 'Hisar',
    quality_grade: 'Grade A1 (Machine Cleaned)',
    moisture_pct: 11.2,
    photos: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'Lustrous, bold grain wheat harvested in ideal weather and dried to 11.2% moisture. Stored in new 50kg HDPE bags. Instant pickup available from farm warehouse.',
    status: 'active',
    created_at: '2026-09-20T10:00:00Z',
  },
  {
    id: 'prod_2',
    farmer_id: 'usr_farmer_2',
    farmer_name: 'Rajinder Kumar',
    farmer_phone: '+91 94162 33445',
    crop_name: 'Yellow Mustard Pioneer 45S46',
    qty_quintals: 45,
    ask_price_per_quintal: 5500,
    district: 'Hisar',
    quality_grade: 'Grade A (41.8% Oil Content)',
    moisture_pct: 7.5,
    photos: [
      'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80',
    ],
    description:
      'High oil content mustard seed certified by local oil mill tester. Dry and clean without dust or weed seeds.',
    status: 'negotiating',
    created_at: '2026-09-22T14:30:00Z',
  },
]

export const SEEDED_PRODUCE_OFFERS: ProduceOfferItem[] = [
  {
    id: 'off_1',
    listing_id: 'prod_1',
    buyer_id: 'usr_buyer_1',
    buyer_name: 'Agrigate Grain Exporters (Pawan Mittal)',
    buyer_phone: '+91 98120 77889',
    offer_price: 2390,
    qty: 80,
    status: 'pending',
    notes: 'Ready to pick up in full truckload within 48 hours. Direct RTGS bank payment at weighing bridge.',
    created_at: '2026-09-24T16:00:00Z',
  },
  {
    id: 'off_2',
    listing_id: 'prod_2',
    buyer_id: 'usr_buyer_2',
    buyer_name: 'Shree Krishna Mustard Oil Mills',
    buyer_phone: '+91 98965 22110',
    offer_price: 5460,
    qty: 45,
    status: 'pending',
    notes: 'Offer based on 41.5% minimum oil content guarantee. Unloading at mill gate, freight paid by us.',
    created_at: '2026-09-25T11:20:00Z',
  },
]

export const SEEDED_WAREHOUSES: WarehouseItem[] = [
  {
    id: 'wh_1',
    name: 'Hisar Central Grain Silo & Modern Cold Storage',
    district: 'Hisar',
    address: 'Near NH-9 Bypass, Sector 27 Industrial Zone, Hisar',
    type: 'grain_silo',
    total_capacity_mt: 12000,
    available_capacity_mt: 3400,
    price_per_quintal_month: 60,
    contact_phone: '+91 94160 88990',
    amenities: [
      'Govt Electronic Warehouse Receipt (e-NWR)',
      'Automated Aeration & Temperature Control',
      '24/7 Security & CCTV',
      '100% General Insurance Against Fire & Theft',
      'Bank Loan Collateral Approved (75% value)',
    ],
  },
  {
    id: 'wh_2',
    name: 'Karnal Agro Fresh Controlled Atmosphere Cold Chain',
    district: 'Karnal',
    address: 'GT Road, Taraori Hub, Karnal',
    type: 'cold_storage',
    total_capacity_mt: 6500,
    available_capacity_mt: 1850,
    price_per_quintal_month: 85,
    contact_phone: '+91 98962 11334',
    amenities: [
      'Multi-Chamber Temperature Zones (-2°C to 12°C)',
      'Ethylene Scrubbers for Potato & Onion',
      'e-NWR Accreditation',
      'Loading & Unloading Conveyor Docks',
      'DG Backup Generator (Zero Power Failure)',
    ],
  },
  {
    id: 'wh_3',
    name: 'Ludhiana District Warehousing Corporation Hub',
    district: 'Ludhiana',
    address: 'Focal Point Phase 8, Dhandari Kalan, Ludhiana',
    type: 'dry_warehouse',
    total_capacity_mt: 22000,
    available_capacity_mt: 7200,
    price_per_quintal_month: 55,
    contact_phone: '+91 98725 44556',
    amenities: [
      'WDRA Certified Warehouse',
      'Periodic Fumigation & Rodent Control',
      'Direct Rail Siding Connectivity',
      'Digital Weighbridge & Moisture Testing Lab',
    ],
  },
  {
    id: 'wh_4',
    name: 'Malwa Farmer Cooperative Storage Complex',
    district: 'Bathinda',
    address: 'Goniana Road, Near Mandi Gate, Bathinda',
    type: 'grain_silo',
    total_capacity_mt: 15000,
    available_capacity_mt: 4100,
    price_per_quintal_month: 58,
    contact_phone: '+91 98150 99221',
    amenities: [
      'Cooperative Member 10% Discount',
      'e-NWR Pledge Loan Facility',
      'Grain Cleaning & Sorting Pre-Storage',
      'Comprehensive Insurance Included',
    ],
  },
]

// ============================================================================
// "BEST TIME TO SELL" ALGORITHM (INDICATIVE HINT, NO CERTAINTY)
// ============================================================================

export interface BestTimeHint {
  status: 'bullish' | 'bearish' | 'neutral'
  badge: string
  headline: string
  recommendation: string
  disclaimer: string
}

export const getBestTimeToSellHint = (item: MandiPriceItem): BestTimeHint => {
  const pct = item.price_change_30d_pct
  const isAboveMsp = item.msp > 0 ? item.modal_price >= item.msp : true

  if (pct >= 5.0) {
    return {
      status: 'bullish',
      badge: 'Favorable Price Trend (+)',
      headline: `${item.crop_name} is trading +${pct.toFixed(1)}% above last month's rates in ${item.market}.`,
      recommendation:
        'Local mill & procurement demand is vigorous. If immediate cash is not urgent, staggered selling (e.g. 50% now, 50% in 2 weeks) or holding in an accredited warehouse can help maximize returns.',
      disclaimer: 'Market advice is indicative based on 30-day APMC trends. No claims of certainty.',
    }
  }

  if (pct <= -2.0) {
    return {
      status: 'bearish',
      badge: 'Market Softening (-)',
      headline: `${item.crop_name} has softened -${Math.abs(pct).toFixed(1)}% over 30 days due to peak harvest arrivals.`,
      recommendation:
        'To prevent distress selling below fair market value, consider utilizing e-NWR warehouse storage to obtain a low-interest pledge loan while awaiting seasonal price recovery.',
      disclaimer: 'Market advice is indicative based on 30-day APMC trends. No claims of certainty.',
    }
  }

  return {
    status: 'neutral',
    badge: 'Stable Pricing (~)',
    headline: `${item.crop_name} is trading steadily at ₹${item.modal_price}/Q (${isAboveMsp ? 'above' : 'near'} MSP benchmark).`,
    recommendation:
      'Supply and daily arrivals are balanced. Standard market conditions favor selling as per your operational cashflow requirements.',
    disclaimer: 'Market advice is indicative based on 30-day APMC trends. No claims of certainty.',
  }
}
