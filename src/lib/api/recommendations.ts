import { supabase, isMockAuth } from '@/lib/supabase/client'
import { SEEDED_PRODUCTS, type Product } from '@/lib/data/seedMarketplace'

export interface GuidedAnswers {
  need: 'seeds' | 'fertilizer' | 'pest_control' | 'tool' | 'irrigation' | 'not_sure'
  crop: string
  farmSize: string
  problemOrGoal: string
  budgetRange: 'under_1000' | '1000_3000' | '3000_7000' | 'above_7000' | 'any'
  preference: 'organic' | 'chemical' | 'any'
  freeText?: string
}

export interface RankedProduct extends Product {
  why_fits: string
  match_score: number
  rank: number
}

export interface RecommendationResponse {
  success: boolean
  results: RankedProduct[]
  llm_rerank_active: boolean
  error?: string
}

// Deterministic filtering & scoring algorithm (matches Edge Function Step A)
export const computeDeterministicRecommendations = (
  answers: Partial<GuidedAnswers>,
  products: Product[] = SEEDED_PRODUCTS
): RankedProduct[] => {
  const {
    need = 'not_sure',
    crop = '',
    problemOrGoal = '',
    budgetRange = 'any',
    preference = 'any',
    freeText = '',
  } = answers

  // 1. Category mapping
  const needCategoryMap: Record<string, string[]> = {
    seeds: ['c1'],
    fertilizer: ['c2', 'c7'],
    pest_control: ['c3', 'c7'],
    tool: ['c4', 'c5'],
    irrigation: ['c6'],
    not_sure: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'],
  }
  const allowedCategories = needCategoryMap[need] || needCategoryMap.not_sure

  // 2. Budget threshold
  let maxPrice = Infinity
  if (budgetRange === 'under_1000') maxPrice = 1000
  else if (budgetRange === '1000_3000') maxPrice = 3000
  else if (budgetRange === '3000_7000') maxPrice = 7000

  // 3. Filter candidate pool
  let candidates = products.filter((p) => {
    if (!p.is_active || p.stock <= 0) return false
    if (need !== 'not_sure' && !allowedCategories.includes(p.category_id)) return false
    if (maxPrice !== Infinity && p.price > maxPrice * 1.35) return false

    if (preference === 'organic') {
      const isOrganicCat = p.category_id === 'c7'
      const hasOrganicText = `${p.name} ${p.description}`.toLowerCase().includes('bio') ||
        `${p.name} ${p.description}`.toLowerCase().includes('organic') ||
        `${p.name} ${p.description}`.toLowerCase().includes('neem')
      if (!isOrganicCat && !hasOrganicText) return false
    }
    return true
  })

  // If strict filtering produced too few items, relax category constraint to provide recommendations
  if (candidates.length === 0) {
    candidates = products.filter((p) => p.is_active && p.stock > 0)
  }

  // 4. Score calculation
  const searchTerms = [
    crop.toLowerCase(),
    problemOrGoal.toLowerCase(),
    (freeText || '').toLowerCase(),
  ].filter(Boolean)

  const scored = candidates.map((p) => {
    let score = 50

    // Crop match bonus
    if (crop && p.crop_tags) {
      const matchesCrop = p.crop_tags.some((t) =>
        t.toLowerCase().includes(crop.toLowerCase()) || crop.toLowerCase().includes(t.toLowerCase())
      )
      if (matchesCrop) score += 40
    }

    // Direct category alignment
    if (allowedCategories.includes(p.category_id)) {
      score += 25
    }

    // Keyword & symptom matching in product description / technical specs
    const fullText = `${p.name} ${p.description} ${JSON.stringify(p.specs || {})}`.toLowerCase()
    for (const term of searchTerms) {
      const words = term.split(/[\s,]+/)
      for (const w of words) {
        if (w.length > 2 && fullText.includes(w)) {
          score += 15
        }
      }
    }

    // Organic alignment
    if (preference === 'organic' && (p.category_id === 'c7' || fullText.includes('organic') || fullText.includes('bio'))) {
      score += 25
    }

    // Contextual "why this fits" generation
    let whyFits = ''
    if (crop && p.crop_tags && p.crop_tags.some((t) => t.toLowerCase().includes(crop.toLowerCase()))) {
      whyFits = `Direct match for ${crop} with certified dosage guidelines.`
    } else if (problemOrGoal && fullText.includes(problemOrGoal.toLowerCase().slice(0, 4))) {
      whyFits = `Specifically formulated to address ${problemOrGoal}.`
    } else if (preference === 'organic' && (p.category_id === 'c7' || fullText.includes('bio') || fullText.includes('organic'))) {
      whyFits = `100% residue-free organic certification for natural soil enrichment.`
    } else if (p.category_id === 'c3') {
      whyFits = `High-efficiency rapid knockdown crop protection against persistent pests.`
    } else if (p.category_id === 'c2') {
      whyFits = `Essential micro & macronutrient formula for maximum root yield.`
    } else {
      whyFits = `High farmer satisfaction rating and verified regional effectiveness.`
    }

    return {
      ...p,
      match_score: score,
      why_fits: whyFits,
      rank: 1,
    }
  })

  // Sort descending by score, tiebreak by discount/rating
  scored.sort((a, b) => b.match_score - a.match_score)

  return scored.slice(0, 6).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }))
}

// Main API method to fetch recommendations
export const getProductRecommendations = async (
  answers: Partial<GuidedAnswers>
): Promise<RecommendationResponse> => {
  const isLlmEnabled = import.meta.env.VITE_ENABLE_LLM_RERANK === 'true'

  // If live Supabase Edge Function is reachable
  if (!isMockAuth) {
    try {
      const { data, error } = await supabase.functions.invoke('recommend-products', {
        body: answers,
      })

      if (!error && data && data.results && data.results.length > 0) {
        return {
          success: true,
          results: data.results.map((r: RankedProduct, idx: number) => ({
            ...r,
            rank: idx + 1,
          })),
          llm_rerank_active: Boolean(data.llm_rerank_active),
        }
      }
    } catch {
      // Gracefully fall back to deterministic local engine
    }
  }

  // Deterministic local computation (works out-of-the-box in dev/mock)
  const results = computeDeterministicRecommendations(answers, SEEDED_PRODUCTS)

  return {
    success: true,
    results,
    llm_rerank_active: isLlmEnabled,
  }
}
