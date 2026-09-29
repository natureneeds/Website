// Supabase Edge Function: recommend-crops
// Deterministic crop agronomic scoring & profit estimation engine

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecommendCropsRequest {
  farm_id?: string
  season?: 'Kharif' | 'Rabi' | 'Zaid'
  soil_type?: string
  water_source?: string
  land_size?: number // in acres
  land_unit?: 'acre' | 'bigha'
}

interface CropScoringInput {
  id: string
  name: string
  hindi_name: string
  seasons: string[]
  soil_types: string[]
  water_need: 'low' | 'medium' | 'high' | 'very_high'
  duration_days: number
  avg_cost_per_acre: number
  avg_yield_per_acre: number
  mandi_price: number
  price_trend: 'rising' | 'stable' | 'declining'
  price_change_pct: number
  description: string
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: RecommendCropsRequest = await req.json()
    if (!payload || typeof payload !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid JSON request payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const {
      season = 'Rabi',
      soil_type = 'Clay Loam',
      water_source = 'Tubewell',
      land_size = 2,
    } = payload

    if (season && !['Kharif', 'Rabi', 'Zaid'].includes(season)) {
      return new Response(JSON.stringify({ error: 'Validation error: season must be Kharif, Rabi, or Zaid' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (typeof land_size !== 'number' || isNaN(land_size) || land_size <= 0 || land_size > 10000) {
      return new Response(JSON.stringify({ error: 'Validation error: land_size must be a positive number up to 10000' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. Candidate Crops Pool (or from DB public.crops)
    const candidateCrops: CropScoringInput[] = [
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
      },
    ]

    // 2. Deterministic Scoring Algorithm
    const scoredCrops = candidateCrops.map((crop) => {
      // 1. Season Match (Max 30 pts)
      let seasonScore = 0
      let seasonReason = ''
      if (crop.seasons.includes(season)) {
        seasonScore = 30
        seasonReason = `100% matched for active ${season} sowing window`
      } else {
        seasonScore = 5
        seasonReason = `Out-of-season (Recommended season: ${crop.seasons.join(', ')})`
      }

      // 2. Soil Type Match (Max 25 pts)
      let soilScore = 0
      let soilReason = ''
      const normalizedUserSoil = soil_type.toLowerCase()
      const hasDirectSoil = crop.soil_types.some((s) =>
        s.toLowerCase().includes(normalizedUserSoil) || normalizedUserSoil.includes(s.toLowerCase())
      )

      if (hasDirectSoil) {
        soilScore = 25
        soilReason = `Ideal compatibility with farm's ${soil_type}`
      } else if (normalizedUserSoil.includes('loam') || normalizedUserSoil.includes('alluvial')) {
        soilScore = 18
        soilReason = `Good root permeability in ${soil_type}`
      } else {
        soilScore = 10
        soilReason = `Requires soil conditioning or bed raising in ${soil_type}`
      }

      // 3. Water Source / Availability Match (Max 20 pts)
      let waterScore = 0
      let waterReason = ''
      const lowerWaterSource = water_source.toLowerCase()
      const isIrrigated = lowerWaterSource.includes('tubewell') || lowerWaterSource.includes('canal') || lowerWaterSource.includes('drip')

      if (isIrrigated) {
        if (crop.water_need === 'medium' || crop.water_need === 'high') {
          waterScore = 20
          waterReason = `${water_source} provides dependable moisture for ${crop.water_need} water requirement`
        } else if (crop.water_need === 'low') {
          waterScore = 18
          waterReason = `Low water consumption preserves water table under ${water_source}`
        } else {
          waterScore = 16
          waterReason = `Adequate for intensive flooding requirements`
        }
      } else {
        // Rainfed
        if (crop.water_need === 'low') {
          waterScore = 20
          waterReason = `Drought-hardy profile thrives under rainfed moisture conditions`
        } else if (crop.water_need === 'medium') {
          waterScore = 10
          waterReason = `Moderate risk under rainfed conditions if monsoon tapers`
        } else {
          waterScore = 2
          waterReason = `High risk under rainfed conditions; supplemental irrigation needed`
        }
      }

      // 4. Latest Mandi Price Trend (Max 15 pts)
      let mandiScore = 0
      let mandiReason = ''
      if (crop.price_trend === 'rising') {
        mandiScore = 15
        mandiReason = `Regional wholesale prices up +${crop.price_change_pct}% YoY at key mandis`
      } else if (crop.price_trend === 'stable') {
        mandiScore = 10
        mandiReason = `Stable price trajectory at ₹${crop.mandi_price.toLocaleString('en-IN')}/quintal with solid MSP buffer`
      } else {
        mandiScore = 5
        mandiReason = `Market prices fluctuating near seasonal lows`
      }

      // 5. Cost vs Expected Yield & Profit Margin (Max 10 pts)
      const grossRevenuePerAcre = crop.avg_yield_per_acre * crop.mandi_price
      const netProfitPerAcre = grossRevenuePerAcre - crop.avg_cost_per_acre
      const profitMarginPct = (netProfitPerAcre / crop.avg_cost_per_acre) * 100

      let profitScore = 5
      if (profitMarginPct >= 150) profitScore = 10
      else if (profitMarginPct >= 100) profitScore = 8
      else if (profitMarginPct >= 60) profitScore = 6
      else profitScore = 4

      const totalScore = Math.round(
        seasonScore + soilScore + waterScore + mandiScore + profitScore
      )

      // Farm-size specific profit range calculation
      const totalFarmCost = crop.avg_cost_per_acre * land_size
      const totalFarmNetProfit = netProfitPerAcre * land_size
      const profitMin = Math.round(totalFarmNetProfit * 0.9)
      const profitMax = Math.round(totalFarmNetProfit * 1.15)

      return {
        ...crop,
        total_score: totalScore,
        score_breakdown: {
          season_score: seasonScore,
          soil_score: soilScore,
          water_score: waterScore,
          mandi_trend_score: mandiScore,
          profit_margin_score: profitScore,
          season_reason: seasonReason,
          soil_reason: soilReason,
          water_reason: waterReason,
          mandi_reason: mandiReason,
        },
        financials: {
          cost_per_acre: crop.avg_cost_per_acre,
          yield_per_acre: crop.avg_yield_per_acre,
          gross_per_acre: grossRevenuePerAcre,
          net_profit_per_acre: netProfitPerAcre,
          total_farm_cost: totalFarmCost,
          profit_min: profitMin,
          profit_max: profitMax,
        },
      }
    })

    // Sort descending by score and pick top 5
    scoredCrops.sort((a, b) => b.total_score - a.total_score)
    const top5 = scoredCrops.slice(0, 5)

    return new Response(
      JSON.stringify({
        success: true,
        season,
        soil_type,
        water_source,
        land_size,
        recommendations: top5,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
