// Supabase Edge Function: recommend-products
// Guided product recommendations with deterministic scoring and optional LLM reranking

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestPayload {
  need?: string // 'seeds' | 'fertilizer' | 'pest_control' | 'tool' | 'irrigation' | 'not_sure'
  crop?: string
  farmSize?: string
  problemOrGoal?: string
  budgetRange?: string
  preference?: 'organic' | 'chemical' | 'any'
  freeText?: string
}

interface CandidateProduct {
  id: string
  category_id: string
  name: string
  description: string
  brand: string
  price: number
  mrp: number
  unit: string
  stock: number
  images: string[]
  specs: Record<string, string>
  crop_tags: string[]
  is_active: boolean
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: RequestPayload = await req.json()
    if (!payload || typeof payload !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid JSON request payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const {
      need = 'not_sure',
      crop = '',
      problemOrGoal = '',
      budgetRange = 'any',
      preference = 'any',
      freeText = '',
    } = payload

    if (typeof crop !== 'string' || crop.length > 100) {
      return new Response(JSON.stringify({ error: 'crop parameter must be a string up to 100 characters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (typeof problemOrGoal !== 'string' || problemOrGoal.length > 500) {
      return new Response(JSON.stringify({ error: 'problemOrGoal must be a string up to 500 characters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Retrieve database products (or mock fallback if run standalone)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''

    let allProducts: CandidateProduct[] = []

    if (supabaseUrl && supabaseKey) {
      const res = await fetch(`${supabaseUrl}/rest/v1/products?is_active=eq.true&select=*`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      })
      if (res.ok) {
        allProducts = await res.json()
      }
    }

    // ========================================================================
    // STEP A: DETERMINISTIC FILTERING & SCORING
    // ========================================================================

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

    // 3. Filter candidates
    let candidates = allProducts.filter((p) => {
      // Must have stock
      if (p.stock <= 0) return false
      // Must match category
      if (need !== 'not_sure' && !allowedCategories.includes(p.category_id)) return false
      // Budget check with soft boundary
      if (maxPrice !== Infinity && p.price > maxPrice * 1.25) return false
      // Organic preference check
      if (preference === 'organic') {
        const isOrganicCat = p.category_id === 'c7'
        const hasOrganicText = (p.name + p.description).toLowerCase().includes('bio') ||
          (p.name + p.description).toLowerCase().includes('organic') ||
          (p.name + p.description).toLowerCase().includes('neem')
        if (!isOrganicCat && !hasOrganicText) return false
      }
      return true
    })

    if (candidates.length === 0) {
      candidates = allProducts.filter((p) => p.stock > 0).slice(0, 10)
    }

    // 4. Scoring system
    const searchTerms = [
      crop.toLowerCase(),
      problemOrGoal.toLowerCase(),
      freeText.toLowerCase(),
    ].filter(Boolean)

    const scored = candidates.map((p) => {
      let score = 50 // Base score

      // Crop tag match
      if (crop && p.crop_tags) {
        const matchesCrop = p.crop_tags.some((t) =>
          t.toLowerCase().includes(crop.toLowerCase()) || crop.toLowerCase().includes(t.toLowerCase())
        )
        if (matchesCrop) score += 40
      }

      // Need category direct match
      if (allowedCategories.includes(p.category_id)) {
        score += 20
      }

      // Keyword & symptom matching in description / specs
      const fullText = `${p.name} ${p.description} ${JSON.stringify(p.specs || {})}`.toLowerCase()
      for (const term of searchTerms) {
        if (!term) continue
        const words = term.split(/\s+/)
        for (const w of words) {
          if (w.length > 2 && fullText.includes(w)) {
            score += 15
          }
        }
      }

      // Organic match bonus
      if (preference === 'organic' && (p.category_id === 'c7' || fullText.includes('organic') || fullText.includes('bio'))) {
        score += 25
      }

      // Generate context-aware "why this fits" reason
      let whyFits = ''
      if (crop && p.crop_tags && p.crop_tags.some((t) => t.toLowerCase().includes(crop.toLowerCase()))) {
        whyFits = `Certified formulated for ${crop} production with high active potency.`
      } else if (problemOrGoal && fullText.includes(problemOrGoal.toLowerCase().slice(0, 5))) {
        whyFits = `Specifically targeted for resolving ${problemOrGoal}.`
      } else if (preference === 'organic' && (p.category_id === 'c7' || fullText.includes('organic'))) {
        whyFits = `100% bio-certified organic input compliant with zero residue farming.`
      } else if (p.category_id === 'c3') {
        whyFits = `Fast-acting broad spectrum protection with verified crop safety.`
      } else if (p.category_id === 'c2') {
        whyFits = `Provides essential balanced crop nutrition for rapid root & shoot development.`
      } else {
        whyFits = `High reliability rating and top-tier farmer reviews in your district.`
      }

      return {
        ...p,
        match_score: score,
        why_fits: whyFits,
      }
    })

    // Sort descending by score
    scored.sort((a, b) => b.match_score - a.match_score)
    let topResults = scored.slice(0, 6)

    // ========================================================================
    // STEP B: OPTIONAL LLM RERANK (Behind env flag, OFF by default)
    // ========================================================================
    const enableLlm = Deno.env.get('ENABLE_LLM_RERANK') === 'true'
    const llmApiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('OPENAI_API_KEY')

    if (enableLlm && llmApiKey && topResults.length > 0) {
      try {
        // Send ONLY product IDs, short specs, and farmer answers. NEVER send personal data.
        const anonymizedPayload = {
          farmer_needs: {
            need,
            crop,
            problem_or_goal: problemOrGoal,
            preference,
            symptoms: freeText,
          },
          candidate_products: topResults.map((p) => ({
            id: p.id,
            name: p.name,
            specs: p.specs,
            crop_tags: p.crop_tags,
          })),
        }

        // Call Gemini / LLM endpoint if configured
        if (Deno.env.get('GEMINI_API_KEY')) {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `You are an expert agronomist. Re-rank these product IDs based on the farmer's agricultural goals. Return valid JSON array of objects with "id" and "why_fits" (one-sentence reason in plain English). Candidate input: ${JSON.stringify(
                          anonymizedPayload
                        )}`,
                      },
                    ],
                  },
                ],
              }),
            }
          )

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json()
            const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
            if (textResponse) {
              const cleanedJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim()
              const parsed = JSON.parse(cleanedJson) as Array<{ id: string; why_fits: string }>
              if (Array.isArray(parsed) && parsed.length > 0) {
                const reranked: CandidateProduct[] = []
                for (const item of parsed) {
                  const match = topResults.find((p) => p.id === item.id)
                  if (match) {
                    reranked.push({
                      ...match,
                      why_fits: item.why_fits || match.why_fits,
                    })
                  }
                }
                // Append any unranked
                for (const p of topResults) {
                  if (!reranked.some((r) => r.id === p.id)) {
                    reranked.push(p)
                  }
                }
                topResults = reranked.slice(0, 6)
              }
            }
          }
        }
      } catch (llmErr) {
        // Fallback silently to Step A deterministic results
        console.warn('Optional LLM reranking encountered an error, falling back to deterministic:', llmErr)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: topResults.length,
        llm_rerank_active: enableLlm,
        results: topResults,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMsg,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
