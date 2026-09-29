export interface CropData {
  id: string
  name: string
  hindi_name: string
  seasons: ('Kharif' | 'Rabi' | 'Zaid')[]
  soil_types: string[]
  water_need: 'low' | 'medium' | 'high' | 'very_high'
  duration_days: number
  avg_cost_per_acre: number
  avg_yield_per_acre: number // quintals per acre
  mandi_price: number // INR per quintal
  price_trend: 'rising' | 'stable' | 'declining'
  price_change_pct: number
  description: string
  image: string
}

export interface CropTaskTemplate {
  stage: string
  title: string
  day_offset: number
  category: 'sowing' | 'irrigation' | 'fertilizer' | 'pest_check' | 'harvest'
  description: string
}

export interface CropInputTemplate {
  category: 'Seeds' | 'Fertilizer' | 'Crop Protection' | 'Tools'
  name: string
  qty_per_acre: number
  unit: string
  product_id?: string // Links directly to marketplace product!
  estimated_cost_per_acre: number
  mandatory: boolean
}

export const SEEDED_CROPS: CropData[] = [
  {
    id: 'crop_wheat',
    name: 'Wheat (गेहूँ)',
    hindi_name: 'गेहूँ',
    seasons: ['Rabi'],
    soil_types: ['Alluvial Soil', 'Clay Loam', 'Loam', 'Sandy Loam'],
    water_need: 'medium',
    duration_days: 120,
    avg_cost_per_acre: 18500,
    avg_yield_per_acre: 22.5,
    mandi_price: 2475,
    price_trend: 'rising',
    price_change_pct: 8.4,
    description: 'Premier winter cereal staple with high MSP backing, robust domestic milling demand, and predictable frost resistance.',
    image: '/images/marketplace.bmp',
  },
  {
    id: 'crop_mustard',
    name: 'Mustard (सरसों / राई)',
    hindi_name: 'सरसों',
    seasons: ['Rabi'],
    soil_types: ['Sandy Loam', 'Alluvial Soil', 'Loam'],
    water_need: 'low',
    duration_days: 110,
    avg_cost_per_acre: 12000,
    avg_yield_per_acre: 9.5,
    mandi_price: 5850,
    price_trend: 'rising',
    price_change_pct: 12.1,
    description: 'High-oil cash crop requiring minimal irrigation. Thrives under semi-arid conditions with strong processing margins.',
    image: '/images/marketplace.bmp',
  },
  {
    id: 'crop_chickpea',
    name: 'Chickpea / Desi Chana (चना)',
    hindi_name: 'चना',
    seasons: ['Rabi'],
    soil_types: ['Sandy Loam', 'Black / Regur Soil', 'Alluvial Soil'],
    water_need: 'low',
    duration_days: 115,
    avg_cost_per_acre: 13000,
    avg_yield_per_acre: 8.5,
    mandi_price: 5440,
    price_trend: 'stable',
    price_change_pct: 3.2,
    description: 'Nitrogen-fixing pulse that enriches soil biology while delivering dependable profits with minimal chemical requirements.',
    image: '/images/marketplace.bmp',
  },
  {
    id: 'crop_potato',
    name: 'Potato (आलू)',
    hindi_name: 'आलू',
    seasons: ['Rabi'],
    soil_types: ['Sandy Loam', 'Alluvial Soil', 'Loam'],
    water_need: 'medium',
    duration_days: 90,
    avg_cost_per_acre: 32000,
    avg_yield_per_acre: 110.0,
    mandi_price: 1150,
    price_trend: 'rising',
    price_change_pct: 14.5,
    description: 'Short duration, heavy-yield tuber suited for cold storage or immediate local processing markets.',
    image: '/images/marketplace.bmp',
  },
  {
    id: 'crop_green_pea',
    name: 'Green Pea (मटर)',
    hindi_name: 'मटर',
    seasons: ['Rabi'],
    soil_types: ['Alluvial Soil', 'Loam', 'Sandy Loam'],
    water_need: 'low',
    duration_days: 75,
    avg_cost_per_acre: 19000,
    avg_yield_per_acre: 42.0,
    mandi_price: 2800,
    price_trend: 'rising',
    price_change_pct: 9.8,
    description: 'Fast cash turnaround vegetable pulse. Ideal as an early winter inter-crop before main summer seeding.',
    image: '/images/marketplace.bmp',
  },
  {
    id: 'crop_basmati_rice',
    name: 'Basmati Rice (बासमती धान)',
    hindi_name: 'बासमती धान',
    seasons: ['Kharif'],
    soil_types: ['Clay Loam', 'Alluvial Soil', 'Loam'],
    water_need: 'very_high',
    duration_days: 140,
    avg_cost_per_acre: 24000,
    avg_yield_per_acre: 20.0,
    mandi_price: 3600,
    price_trend: 'stable',
    price_change_pct: 2.1,
    description: 'Premium aromatic grain with extensive international export demand and guaranteed miller contracts.',
    image: '/images/marketplace.bmp',
  },
  {
    id: 'crop_cotton',
    name: 'Bt Cotton (कपास)',
    hindi_name: 'कपास',
    seasons: ['Kharif'],
    soil_types: ['Black / Regur Soil', 'Alluvial Soil', 'Loam'],
    water_need: 'medium',
    duration_days: 165,
    avg_cost_per_acre: 28000,
    avg_yield_per_acre: 14.0,
    mandi_price: 6920,
    price_trend: 'rising',
    price_change_pct: 6.7,
    description: 'Leading industrial fiber crop with strong procurement network and textile export pull.',
    image: '/images/marketplace.bmp',
  },
  {
    id: 'crop_maize',
    name: 'Maize / Hybrid Corn (मक्का)',
    hindi_name: 'मक्का',
    seasons: ['Kharif', 'Rabi'],
    soil_types: ['Alluvial Soil', 'Red Soil', 'Loam'],
    water_need: 'medium',
    duration_days: 95,
    avg_cost_per_acre: 16000,
    avg_yield_per_acre: 24.0,
    mandi_price: 2150,
    price_trend: 'stable',
    price_change_pct: 1.5,
    description: 'High biomass poultry and starch industry favorite with consistent year-round off-take.',
    image: '/images/marketplace.bmp',
  },
  {
    id: 'crop_tomato',
    name: 'Tomato (टमाटर)',
    hindi_name: 'टमाटर',
    seasons: ['Rabi', 'Zaid'],
    soil_types: ['Loam', 'Red Soil', 'Sandy Loam'],
    water_need: 'high',
    duration_days: 105,
    avg_cost_per_acre: 38000,
    avg_yield_per_acre: 140.0,
    mandi_price: 1400,
    price_trend: 'rising',
    price_change_pct: 18.2,
    description: 'High-value horticulture crop with exceptional cash flow velocity during peri-urban retail peaks.',
    image: '/images/marketplace.bmp',
  },
  {
    id: 'crop_sunflower',
    name: 'Sunflower (सूरजमुखी)',
    hindi_name: 'सूरजमुखी',
    seasons: ['Zaid', 'Rabi'],
    soil_types: ['Black / Regur Soil', 'Loam', 'Sandy Loam'],
    water_need: 'medium',
    duration_days: 95,
    avg_cost_per_acre: 16500,
    avg_yield_per_acre: 9.0,
    mandi_price: 5200,
    price_trend: 'stable',
    price_change_pct: 4.0,
    description: 'Drought-hardy oilseed ideal for spring/summer transition windows with low pest sensitivity.',
    image: '/images/marketplace.bmp',
  },
]

// ============================================================================
// TEMPLATE TASK SCHEDULES BY CROP
// ============================================================================
export const CROP_TASK_TEMPLATES: Record<string, CropTaskTemplate[]> = {
  crop_wheat: [
    {
      stage: 'Basal Prep',
      title: 'Deep tillage & Basal DAP + Potash Application',
      day_offset: 0,
      category: 'fertilizer',
      description: 'Incorporate 1 bag DAP (50kg) and 25kg MOP per acre during final disc harrowing.',
    },
    {
      stage: 'Sowing',
      title: 'Seed Treatment & Precision Line Sowing',
      day_offset: 2,
      category: 'sowing',
      description: 'Treat PBW-550 seeds with Thiram/Carbendazim (2g/kg). Drill at 4-5cm depth with 20cm row spacing.',
    },
    {
      stage: 'CRI Stage',
      title: 'First Irrigation (Crown Root Initiation)',
      day_offset: 21,
      category: 'irrigation',
      description: 'Critical moisture window. Irrigate lightly to stimulate tillering crown roots.',
    },
    {
      stage: 'First Top Dress',
      title: 'Nitrogen Boost: First Split Urea Top-Dressing',
      day_offset: 32,
      category: 'fertilizer',
      description: 'Broadcast 45kg Neem Coated Urea after irrigation when soil reaches field moisture capacity.',
    },
    {
      stage: 'Weed & Pest',
      title: 'Weed Control & Aphid Canopy Scouting',
      day_offset: 45,
      category: 'pest_check',
      description: 'Inspect for Phalaris minor (gulli danda) and apply recommended post-emergence selective herbicide.',
    },
    {
      stage: 'Jointing',
      title: 'Second Irrigation & Foliar Micronutrient Spray',
      day_offset: 65,
      category: 'irrigation',
      description: 'Apply Nano Urea (4ml/L) + Zinc sulfate spray for enhanced chlorophyll density.',
    },
    {
      stage: 'Booting',
      title: 'Third Irrigation & Rust Fungal Defense',
      day_offset: 85,
      category: 'pest_check',
      description: 'Scout leaves for yellow rust stripes. Spray Nativo or Saaf if humidity exceeds 80%.',
    },
    {
      stage: 'Grain Fill',
      title: 'Fourth Irrigation (Milking & Dough Stage)',
      day_offset: 102,
      category: 'irrigation',
      description: 'Maintain soil moisture to prevent shriveling of grains during early summer heat waves.',
    },
    {
      stage: 'Pre-Harvest',
      title: 'Field Drainage & Moisture Testing',
      day_offset: 114,
      category: 'harvest',
      description: 'Cease irrigation. Confirm grain moisture is below 12% before dispatching combine.',
    },
    {
      stage: 'Harvest',
      title: 'Combine Harvester Dispatch & Bagging',
      day_offset: 120,
      category: 'harvest',
      description: 'Execute automated combine harvesting, collect straw residue, and haul bags to farm shed.',
    },
  ],

  crop_mustard: [
    {
      stage: 'Basal Prep',
      title: 'Field Leveling & Basal Single Super Phosphate Incorporation',
      day_offset: 0,
      category: 'fertilizer',
      description: 'Apply SSP 100kg + 15kg Urea per acre for optimal sulfur nutrition.',
    },
    {
      stage: 'Sowing',
      title: 'Seed Treatment & Sowing with Seed Drill',
      day_offset: 1,
      category: 'sowing',
      description: 'Sow Pusa Bold seeds (1.5kg/acre) mixed with sand for uniform 30cm spacing.',
    },
    {
      stage: 'Thinning',
      title: 'Plant Thinning & Hand Weeding',
      day_offset: 18,
      category: 'sowing',
      description: 'Maintain 10-12cm distance between plants to enable vigorous branching.',
    },
    {
      stage: 'Rosette Stage',
      title: 'First Irrigation & Top Dressing',
      day_offset: 30,
      category: 'irrigation',
      description: 'Light irrigation followed by 25kg Urea top-dressing.',
    },
    {
      stage: 'Flowering',
      title: 'Mustard Aphid (Mahua) Monitoring',
      day_offset: 55,
      category: 'pest_check',
      description: 'Inspect flowering racemes. Deploy sticky traps or bio-spray if colonies exceed 10/plant.',
    },
    {
      stage: 'Pod Formation',
      title: 'Second Irrigation & Sulfur Foliar Boost',
      day_offset: 75,
      category: 'irrigation',
      description: 'Critical siliqua grain filling stage.',
    },
    {
      stage: 'Harvest',
      title: 'Sickle Reaping & Field Sun Drying',
      day_offset: 110,
      category: 'harvest',
      description: 'Harvest early morning when pods are yellow-brown to prevent pod shattering.',
    },
  ],

  // Generic fallback schedule generator for any other crop
  default: [
    {
      stage: 'Basal Prep',
      title: 'Deep primary tillage & organic manure incorporation',
      day_offset: 0,
      category: 'fertilizer',
      description: 'Till soil to 20cm depth and incorporate basal nutrients.',
    },
    {
      stage: 'Sowing',
      title: 'Certified seed planting & initial moistening',
      day_offset: 2,
      category: 'sowing',
      description: 'Sow treated seeds according to regional spacing recommendations.',
    },
    {
      stage: 'Vegetative',
      title: 'Vegetative stage irrigation & nutrient top-dress',
      day_offset: 25,
      category: 'irrigation',
      description: 'Supply scheduled water and nitrogen split application.',
    },
    {
      stage: 'Plant Health',
      title: 'AI Crop Health Scan & pest scouting',
      day_offset: 48,
      category: 'pest_check',
      description: 'Scan leaves using mobile camera for early pathogen detection.',
    },
    {
      stage: 'Reproductive',
      title: 'Bloom & fruit setting irrigation',
      day_offset: 70,
      category: 'irrigation',
      description: 'Maintain uniform root zone moisture.',
    },
    {
      stage: 'Harvest',
      title: 'Maturity inspection & harvest operation',
      day_offset: 95,
      category: 'harvest',
      description: 'Harvest crops at peak market moisture and transport to collection center.',
    },
  ],
}

// ============================================================================
// INPUT CHECKLIST TEMPLATES (PER ACRE) LINKED TO MARKETPLACE
// ============================================================================
export const CROP_INPUT_TEMPLATES: Record<string, CropInputTemplate[]> = {
  crop_wheat: [
    {
      category: 'Seeds',
      name: 'PBW-550 Certified Wheat Seeds (40kg)',
      qty_per_acre: 1,
      unit: '40kg bag',
      product_id: 'p1', // Matches Marketplace seed ID
      estimated_cost_per_acre: 1350,
      mandatory: true,
    },
    {
      category: 'Fertilizer',
      name: 'IFFCO DAP Di-Ammonium Phosphate 18:46:0 (50kg)',
      qty_per_acre: 1,
      unit: '50kg bag',
      product_id: 'p6', // Matches Marketplace product ID
      estimated_cost_per_acre: 1350,
      mandatory: true,
    },
    {
      category: 'Fertilizer',
      name: 'IFFCO Neem Coated Urea (45kg)',
      qty_per_acre: 2,
      unit: '45kg bag',
      product_id: 'p5', // Matches Marketplace product ID
      estimated_cost_per_acre: 533,
      mandatory: true,
    },
    {
      category: 'Fertilizer',
      name: 'Nano Urea Liquid Fertilizer (500ml Bottle)',
      qty_per_acre: 1,
      unit: '500ml bottle',
      product_id: 'p7',
      estimated_cost_per_acre: 225,
      mandatory: false,
    },
    {
      category: 'Crop Protection',
      name: 'Saaf Systemic Fungicide Carbendazim + Mancozeb (500g)',
      qty_per_acre: 1,
      unit: '500g pack',
      product_id: 'p12',
      estimated_cost_per_acre: 340,
      mandatory: false,
    },
  ],

  crop_mustard: [
    {
      category: 'Seeds',
      name: 'Pusa Bold Mustard Seeds (2kg)',
      qty_per_acre: 1,
      unit: '2kg pack',
      product_id: 'p3',
      estimated_cost_per_acre: 420,
      mandatory: true,
    },
    {
      category: 'Fertilizer',
      name: 'IFFCO DAP Di-Ammonium Phosphate 18:46:0 (50kg)',
      qty_per_acre: 1,
      unit: '50kg bag',
      product_id: 'p6',
      estimated_cost_per_acre: 1350,
      mandatory: true,
    },
    {
      category: 'Fertilizer',
      name: 'IFFCO Neem Coated Urea (45kg)',
      qty_per_acre: 1,
      unit: '45kg bag',
      product_id: 'p5',
      estimated_cost_per_acre: 266.5,
      mandatory: true,
    },
    {
      category: 'Crop Protection',
      name: 'Saaf Systemic Fungicide (500g)',
      qty_per_acre: 1,
      unit: '500g pack',
      product_id: 'p12',
      estimated_cost_per_acre: 340,
      mandatory: false,
    },
  ],

  default: [
    {
      category: 'Fertilizer',
      name: 'IFFCO DAP Di-Ammonium Phosphate 18:46:0 (50kg)',
      qty_per_acre: 1,
      unit: '50kg bag',
      product_id: 'p6',
      estimated_cost_per_acre: 1350,
      mandatory: true,
    },
    {
      category: 'Fertilizer',
      name: 'IFFCO Neem Coated Urea (45kg)',
      qty_per_acre: 1,
      unit: '45kg bag',
      product_id: 'p5',
      estimated_cost_per_acre: 266.5,
      mandatory: true,
    },
  ],
}
