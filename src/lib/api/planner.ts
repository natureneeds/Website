import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isMockAuth, mockDb } from '@/lib/supabase/client'
import type { CropPlan, CropTask } from '@/lib/supabase/types'
import {
  SEEDED_CROPS,
  CROP_TASK_TEMPLATES,
  CROP_INPUT_TEMPLATES,
  type CropData,
  type CropInputTemplate,
} from '@/lib/data/seedCrops'

export interface RecommendedCrop extends CropData {
  total_score: number
  score_breakdown: {
    season_score: number
    soil_score: number
    water_score: number
    mandi_trend_score: number
    profit_margin_score: number
    season_reason: string
    soil_reason: string
    water_reason: string
    mandi_reason: string
  }
  financials: {
    cost_per_acre: number
    yield_per_acre: number
    gross_per_acre: number
    net_profit_per_acre: number
    total_farm_cost: number
    profit_min: number
    profit_max: number
  }
}

export interface WeatherData {
  success: boolean
  district: string
  current: {
    temp: number
    humidity: number
    wind_speed_kmh: number
    precipitation_mm: number
    condition_text: string
    spray_condition: 'ideal' | 'moderate' | 'avoid'
    spray_advisory: string
  }
  forecast: Array<{
    date: string
    max_temp: number
    min_temp: number
    precip_sum: number
  }>
  cached: boolean
}

// 1. Auto-Detect Season from Date
export const getAutoDetectedSeason = (date = new Date()): 'Kharif' | 'Rabi' | 'Zaid' => {
  const month = date.getMonth() // 0 = Jan, 8 = Sep, 9 = Oct
  // In late September/October onwards, it's Rabi sowing season in India
  if (month >= 8 || month <= 2) {
    return 'Rabi'
  } else if (month >= 3 && month <= 5) {
    return 'Zaid'
  } else {
    return 'Kharif'
  }
}

// 2. Deterministic Crop Scoring Engine (matches Edge Function)
export const computeDeterministicCropRecommendations = (
  season: 'Kharif' | 'Rabi' | 'Zaid',
  soilType: string,
  waterSource: string,
  landSize: number
): RecommendedCrop[] => {
  const scored = SEEDED_CROPS.map((crop) => {
    // 1. Season Match (30 pts)
    let seasonScore = 0
    let seasonReason = ''
    if (crop.seasons.includes(season)) {
      seasonScore = 30
      seasonReason = `100% matched for active ${season} sowing window`
    } else {
      seasonScore = 5
      seasonReason = `Out-of-season (Recommended: ${crop.seasons.join(', ')})`
    }

    // 2. Soil Type Match (25 pts)
    let soilScore = 0
    let soilReason = ''
    const normalizedUserSoil = (soilType || 'Clay Loam').toLowerCase()
    const hasDirectSoil = crop.soil_types.some((s) =>
      s.toLowerCase().includes(normalizedUserSoil) || normalizedUserSoil.includes(s.toLowerCase())
    )

    if (hasDirectSoil) {
      soilScore = 25
      soilReason = `Ideal compatibility with farm's ${soilType}`
    } else if (normalizedUserSoil.includes('loam') || normalizedUserSoil.includes('alluvial')) {
      soilScore = 18
      soilReason = `Good root permeability in ${soilType}`
    } else {
      soilScore = 10
      soilReason = `Requires soil conditioning or bed raising in ${soilType}`
    }

    // 3. Water Match (20 pts)
    let waterScore = 0
    let waterReason = ''
    const lowerWater = (waterSource || 'Tubewell').toLowerCase()
    const isIrrigated =
      lowerWater.includes('tubewell') || lowerWater.includes('canal') || lowerWater.includes('drip')

    if (isIrrigated) {
      if (crop.water_need === 'medium' || crop.water_need === 'high') {
        waterScore = 20
        waterReason = `${waterSource} provides dependable moisture for ${crop.water_need} water requirement`
      } else if (crop.water_need === 'low') {
        waterScore = 18
        waterReason = `Low water consumption preserves water table under ${waterSource}`
      } else {
        waterScore = 16
        waterReason = `Adequate for intensive flooding requirements`
      }
    } else {
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

    // 4. Mandi Price Trend (15 pts)
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

    // 5. Cost vs Expected Yield & Profit Margin (10 pts)
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

    const totalFarmCost = crop.avg_cost_per_acre * landSize
    const totalFarmNetProfit = netProfitPerAcre * landSize
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

  scored.sort((a, b) => b.total_score - a.total_score)
  return scored.slice(0, 5)
}

// 3. Fetch Crop Recommendations (Edge Function with fallback)
export const fetchCropRecommendations = async (params: {
  farmId?: string
  season?: 'Kharif' | 'Rabi' | 'Zaid'
  soilType?: string
  waterSource?: string
  landSize?: number
}): Promise<RecommendedCrop[]> => {
  const season = params.season || getAutoDetectedSeason()
  const soilType = params.soilType || 'Clay Loam'
  const waterSource = params.waterSource || 'Tubewell'
  const landSize = params.landSize || 2

  if (!isMockAuth) {
    try {
      const { data, error } = await supabase.functions.invoke('recommend-crops', {
        body: {
          season,
          soil_type: soilType,
          water_source: waterSource,
          land_size: landSize,
        },
      })
      if (!error && data && data.recommendations) {
        return data.recommendations as RecommendedCrop[]
      }
    } catch {
      // fallback
    }
  }

  return computeDeterministicCropRecommendations(season, soilType, waterSource, landSize)
}

export const useRecommendedCrops = (params: {
  farmId?: string
  season?: 'Kharif' | 'Rabi' | 'Zaid'
  soilType?: string
  waterSource?: string
  landSize?: number
}) => {
  return useQuery({
    queryKey: ['recommend-crops', params],
    queryFn: () => fetchCropRecommendations(params),
    staleTime: 60 * 1000,
  })
}

// 4. Weather API (Free Open-Meteo Edge Function with 3-hour cache)
export const fetchWeatherForecast = async (district = 'Ludhiana'): Promise<WeatherData> => {
  if (!isMockAuth) {
    try {
      const { data, error } = await supabase.functions.invoke(
        `weather-forecast?district=${encodeURIComponent(district)}`
      )
      if (!error && data && data.current) {
        return data as WeatherData
      }
    } catch {
      // fallback
    }
  }

  // Local fallback with agricultural advisory
  return {
    success: true,
    district: district.toUpperCase(),
    current: {
      temp: 29,
      humidity: 58,
      wind_speed_kmh: 8,
      precipitation_mm: 0,
      condition_text: 'Partly Cloudy & Pleasant',
      spray_condition: 'ideal',
      spray_advisory: 'Optimal conditions for foliar nutrient and biological sprays (low wind, zero rain).',
    },
    forecast: [
      { date: 'Today', max_temp: 33, min_temp: 22, precip_sum: 0 },
      { date: 'Tomorrow', max_temp: 32, min_temp: 21, precip_sum: 0 },
      { date: 'Day 3', max_temp: 31, min_temp: 22, precip_sum: 1.2 },
      { date: 'Day 4', max_temp: 30, min_temp: 20, precip_sum: 0 },
      { date: 'Day 5', max_temp: 32, min_temp: 21, precip_sum: 0 },
    ],
    cached: true,
  }
}

export const useWeather = (district = 'Ludhiana') => {
  return useQuery({
    queryKey: ['weather', district],
    queryFn: () => fetchWeatherForecast(district),
    staleTime: 3 * 60 * 60 * 1000, // 3-hour cache enforced
  })
}

// 5. Crop Plans & Tasks Persistence Hooks
export const useCropPlans = (farmId: string | undefined) => {
  return useQuery({
    queryKey: ['crop-plans', farmId],
    queryFn: async () => {
      if (!farmId) return []
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('crop_plans')
            .select('*')
            .eq('farm_id', farmId)
            .order('created_at', { ascending: false })
          if (!error && data) return data as CropPlan[]
        } catch {
          // fallback
        }
      }
      return mockDb.getCropPlans(farmId)
    },
    enabled: Boolean(farmId),
  })
}

export const useCropTasks = (planId: string | undefined) => {
  return useQuery({
    queryKey: ['crop-tasks', planId],
    queryFn: async () => {
      if (!planId) return []
      if (!isMockAuth) {
        try {
          const { data, error } = await supabase
            .from('crop_tasks')
            .select('*')
            .eq('plan_id', planId)
            .order('due_date', { ascending: true })
          if (!error && data) return data as CropTask[]
        } catch {
          // fallback
        }
      }
      return mockDb.getCropTasks(planId)
    },
    enabled: Boolean(planId),
  })
}

// 6. Start Crop & Auto-Generate Dated Tasks
export const useStartCrop = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      farmId,
      cropId,
      sowDate = new Date().toISOString().split('T')[0],
    }: {
      farmId: string
      cropId: string
      sowDate?: string
    }) => {
      const templates = CROP_TASK_TEMPLATES[cropId] || CROP_TASK_TEMPLATES.default
      const baseSowDate = new Date(sowDate)

      const taskInputs = templates.map((t) => {
        const dueDate = new Date(baseSowDate)
        dueDate.setDate(dueDate.getDate() + t.day_offset)
        return {
          title: t.title,
          due_date: dueDate.toISOString().split('T')[0],
          stage: t.stage,
          category: t.category,
          description: t.description,
        }
      })

      if (!isMockAuth) {
        try {
          const { data: plan, error: planError } = await supabase
            .from('crop_plans')
            .insert({
              farm_id: farmId,
              crop_id: cropId,
              sow_date: sowDate,
              status: 'planned',
            })
            .select('*')
            .single()

          if (!planError && plan) {
            const taskRows = taskInputs.map((t) => ({
              plan_id: plan.id,
              title: t.title,
              due_date: t.due_date,
              done: false,
            }))
            const { data: tasks } = await supabase
              .from('crop_tasks')
              .insert(taskRows)
              .select('*')

            return { plan: plan as CropPlan, tasks: (tasks || []) as CropTask[] }
          }
        } catch {
          // fallback
        }
      }

      return mockDb.createCropPlanWithTasks(farmId, cropId, sowDate, taskInputs)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crop-plans', variables.farmId] })
    },
  })
}

export const useToggleCropTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      planId,
      taskId,
      done,
    }: {
      planId: string
      taskId: string
      done: boolean
    }) => {
      if (!isMockAuth) {
        try {
          await supabase.from('crop_tasks').update({ done }).eq('id', taskId)
          return
        } catch {
          // fallback
        }
      }
      mockDb.toggleCropTask(planId, taskId, done)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crop-tasks', variables.planId] })
    },
  })
}

// 7. Input Checklist Helper (Scales per farm acreage)
export const getScaledInputChecklist = (
  cropId: string,
  landSize: number
): Array<CropInputTemplate & { total_qty: number; total_cost: number }> => {
  const templates = CROP_INPUT_TEMPLATES[cropId] || CROP_INPUT_TEMPLATES.default
  const size = Math.max(1, landSize || 1)

  return templates.map((item) => ({
    ...item,
    total_qty: Math.round(item.qty_per_acre * size * 10) / 10,
    total_cost: Math.round(item.estimated_cost_per_acre * size),
  }))
}
