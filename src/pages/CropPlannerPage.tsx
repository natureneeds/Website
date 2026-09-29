import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sprout,
  Layers,
  Coins,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Clock,
  CalendarDays,
  ListCheck,
} from 'lucide-react'
import {
  LayoutShell,
  Card,
  Button,
  Badge,
  Skeleton,
} from '@/components/ui'
import {
  useRecommendedCrops,
  useCropPlans,
  useStartCrop,
  getAutoDetectedSeason,
  type RecommendedCrop,
} from '@/lib/api/planner'
import { WeatherCard } from '@/components/planner/WeatherCard'
import { ScoreBreakdownModal } from '@/components/planner/ScoreBreakdownModal'
import { TaskCalendarTab } from '@/components/planner/TaskCalendarTab'
import { InputChecklistTab } from '@/components/planner/InputChecklistTab'
import { useAuth } from '@/context/AuthContext'
import { mockDb } from '@/lib/supabase/client'
import { SEEDED_CROPS } from '@/lib/data/seedCrops'

export const CropPlannerPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // 1. Pick a farm (default from user profile / farm or fallback)
  const userFarm = user ? mockDb.getFarm(user.id) : null
  const selectedFarm = {
    id: userFarm?.id || 'farm_demo_1',
    district: userFarm?.district || 'Ludhiana',
    state: userFarm?.state || 'Punjab',
    village: userFarm?.village || 'Rampur Kalan',
    soil_type: userFarm?.soil_type || 'Clay Loam',
    water_source: userFarm?.water_source || 'Tubewell',
    land_size: userFarm?.land_size || 2.5,
    land_unit: userFarm?.land_unit || 'acre',
  }

  // 2. Auto-detect Season from Date (Kharif/Rabi/Zaid)
  const detectedSeason = getAutoDetectedSeason()
  const [activeSeason, setActiveSeason] = useState<'Kharif' | 'Rabi' | 'Zaid'>(detectedSeason)

  // Active View Tab: 'recommendations' | 'calendar' | 'checklist'
  const [activeTab, setActiveTab] = useState<'recommendations' | 'calendar' | 'checklist'>('recommendations')

  // Selected crop for Score Breakdown modal
  const [breakdownCrop, setBreakdownCrop] = useState<RecommendedCrop | null>(null)

  // Fetch Recommended Crops (Deterministic Edge Function / client engine)
  const { data: recommendations = [], isLoading: isCropsLoading } = useRecommendedCrops({
    farmId: selectedFarm.id,
    season: activeSeason,
    soilType: selectedFarm.soil_type,
    waterSource: selectedFarm.water_source,
    landSize: selectedFarm.land_size,
  })

  // Fetch Active Plans for this farm
  const { data: plans = [] } = useCropPlans(selectedFarm.id)
  const activePlan = plans[0] || null
  const activePlanCrop = activePlan
    ? SEEDED_CROPS.find((c) => c.id === activePlan.crop_id)
    : null

  // Start Crop Mutation
  const startCropMutation = useStartCrop()
  const [startingCropId, setStartingCropId] = useState<string | null>(null)

  const handleStartCrop = async (cropId: string) => {
    try {
      setStartingCropId(cropId)
      await startCropMutation.mutateAsync({
        farmId: selectedFarm.id,
        cropId,
        sowDate: new Date().toISOString().split('T')[0],
      })
      setActiveTab('calendar')
    } finally {
      setStartingCropId(null)
    }
  }

  return (
    <LayoutShell>
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col gap-8">
        {/* Top Header & Farm Picker */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <Sprout className="w-7 h-7 text-forest" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                Autonomous Crop Planner
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted">
              AI & agronomic matching engine for maximizing farm yield, soil biology, and market margins.
            </p>
          </div>

          {/* Farm Picker & Season Selector Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Farm Selector Pill */}
            <div className="flex items-center gap-2 bg-surface p-1.5 px-3 rounded-pill border border-line text-xs font-semibold text-ink">
              <span className="text-muted">Plot:</span>
              <span className="font-bold">{selectedFarm.village} ({selectedFarm.land_size} {selectedFarm.land_unit})</span>
              <span className="text-forest">• {selectedFarm.soil_type}</span>
            </div>

            {/* Season Selector with Auto-Detected Flag */}
            <div className="flex items-center bg-surface-alt p-1 rounded-pill border border-line">
              {(['Kharif', 'Rabi', 'Zaid'] as const).map((s) => {
                const isSelected = activeSeason === s
                const isAuto = detectedSeason === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setActiveSeason(s)}
                    className={`px-3 py-1.5 rounded-pill text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-lime text-ink shadow-sm'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    <span>{s}</span>
                    {isAuto && <span className="ml-1 text-[10px] opacity-75">★</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Hyper-Local 3-Hour Cached Weather Card */}
        <WeatherCard district={selectedFarm.district} />

        {/* Mode Selector Tabs (If an active plan exists) */}
        {activePlan && (
          <div className="flex items-center gap-2 border-b border-line pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('recommendations')}
              className={`px-4 py-2 rounded-pill text-xs sm:text-sm font-bold transition-colors ${
                activeTab === 'recommendations'
                  ? 'bg-ink text-white'
                  : 'bg-surface text-ink hover:bg-surface-alt'
              }`}
            >
              Recommended Crops
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-pill text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'calendar'
                  ? 'bg-ink text-white'
                  : 'bg-surface text-ink hover:bg-surface-alt'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Dated Task Calendar ({activePlanCrop?.name})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`px-4 py-2 rounded-pill text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'checklist'
                  ? 'bg-ink text-white'
                  : 'bg-surface text-ink hover:bg-surface-alt'
              }`}
            >
              <ListCheck className="w-3.5 h-3.5" />
              <span>Input Checklist</span>
            </button>
          </div>
        )}

        {/* TAB 1: RECOMMENDED CROPS (Top 5 Large Cards) */}
        {activeTab === 'recommendations' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
                  <span>Top 5 Recommended Crops for {activeSeason} Season</span>
                  <Badge variant="lime">
                    {selectedFarm.soil_type} • {selectedFarm.water_source}
                  </Badge>
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Ranked by agro-climatic fit, soil permeability, mandi price momentum, and net acre profit.
                </p>
              </div>
            </div>

            {isCropsLoading ? (
              <div className="flex flex-col gap-4">
                <Skeleton variant="card" className="h-64 w-full" />
                <Skeleton variant="card" className="h-64 w-full" />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {recommendations.map((crop, idx) => {
                  // Alternating cards between surface (cream) and ink (black) per DESIGN LOCK
                  const isInkCard = idx % 2 === 1
                  const isTopPick = idx === 0

                  return (
                    <Card
                      key={crop.id}
                      variant={isInkCard ? 'ink' : 'surface'}
                      className={`flex flex-col gap-5 p-6 sm:p-7 relative transition-all ${
                        isTopPick ? 'ring-2 ring-forest shadow-md' : ''
                      }`}
                    >
                      {/* Top Row: Rank, Title, Score Badge */}
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-pill flex items-center justify-center font-bold text-lg shrink-0 ${
                              isInkCard
                                ? 'bg-forest text-white'
                                : 'bg-white text-forest border border-line shadow-xs'
                            }`}
                          >
                            #{idx + 1}
                          </div>

                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xl sm:text-2xl font-bold tracking-tight ${
                                  isInkCard ? 'text-white' : 'text-ink'
                                }`}
                              >
                                {crop.name}
                              </span>
                              <Badge variant={isInkCard ? 'lime' : 'forest'}>
                                {crop.seasons.join(', ')}
                              </Badge>
                              {isTopPick && (
                                <Badge variant="lime" dot>
                                  Best Agronomic Fit
                                </Badge>
                              )}
                            </div>
                            <p
                              className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${
                                isInkCard ? 'text-white/80' : 'text-muted'
                              }`}
                            >
                              {crop.description}
                            </p>
                          </div>
                        </div>

                        {/* Composite Match Score Pill */}
                        <div className="flex flex-col items-end shrink-0">
                          <div className="flex items-center gap-1.5 bg-lime px-3 py-1.5 rounded-pill text-ink font-bold text-sm shadow-xs">
                            <Sparkles className="w-4 h-4 text-ink" />
                            <span>{crop.total_score}% Score</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setBreakdownCrop(crop)}
                            className={`text-xs font-semibold hover:underline mt-1.5 ${
                              isInkCard ? 'text-white/90' : 'text-forest'
                            }`}
                          >
                            View Score Breakdown &gt;
                          </button>
                        </div>
                      </div>

                      {/* Middle: 4 Key Agronomy & Financial Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {/* Metric 1: Duration */}
                        <div
                          className={`p-3 rounded-card border flex flex-col gap-0.5 ${
                            isInkCard
                              ? 'bg-white/5 border-white/10 text-white'
                              : 'bg-white border-line text-ink'
                          }`}
                        >
                          <span className="text-[11px] text-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Duration</span>
                          </span>
                          <span className="text-base sm:text-lg font-bold">
                            {crop.duration_days} Days
                          </span>
                          <span className="text-[10px] text-muted capitalize">
                            Water: {crop.water_need}
                          </span>
                        </div>

                        {/* Metric 2: Estimated Cost / Acre */}
                        <div
                          className={`p-3 rounded-card border flex flex-col gap-0.5 ${
                            isInkCard
                              ? 'bg-white/5 border-white/10 text-white'
                              : 'bg-white border-line text-ink'
                          }`}
                        >
                          <span className="text-[11px] text-muted flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            <span>Input Cost</span>
                          </span>
                          <span className="text-base sm:text-lg font-bold">
                            ₹{crop.avg_cost_per_acre.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-muted">Per Acre Basis</span>
                        </div>

                        {/* Metric 3: Expected Yield */}
                        <div
                          className={`p-3 rounded-card border flex flex-col gap-0.5 ${
                            isInkCard
                              ? 'bg-white/5 border-white/10 text-white'
                              : 'bg-white border-line text-ink'
                          }`}
                        >
                          <span className="text-[11px] text-muted flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            <span>Expected Yield</span>
                          </span>
                          <span className="text-base sm:text-lg font-bold">
                            {crop.avg_yield_per_acre} Quintals
                          </span>
                          <span className="text-[10px] text-muted">Per Acre (ICAR Trial)</span>
                        </div>

                        {/* Metric 4: Mandi Wholesale Trend */}
                        <div
                          className={`p-3 rounded-card border flex flex-col gap-0.5 ${
                            isInkCard
                              ? 'bg-white/5 border-white/10 text-white'
                              : 'bg-white border-line text-ink'
                          }`}
                        >
                          <span className="text-[11px] text-muted flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>Mandi Price</span>
                          </span>
                          <span className="text-base sm:text-lg font-bold">
                            ₹{crop.mandi_price}/Q
                          </span>
                          <span className="text-[10px] text-forest font-semibold">
                            +{crop.price_change_pct}% YoY Trend
                          </span>
                        </div>
                      </div>

                      {/* Estimated Profit For Farm Size & Primary CTA */}
                      <div
                        className={`pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isInkCard ? 'border-white/10' : 'border-line'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs text-muted uppercase font-bold">
                            Estimated Farm Profit ({selectedFarm.land_size} {selectedFarm.land_unit})
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span
                              className={`text-xl sm:text-2xl font-bold ${
                                isInkCard ? 'text-lime' : 'text-ink'
                              }`}
                            >
                              ₹{crop.financials.profit_min.toLocaleString('en-IN')} – ₹
                              {crop.financials.profit_max.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-muted">Net After Input Costs</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <Button
                            variant="secondary"
                            size="md"
                            onClick={() => navigate(`/plan/crop/${crop.id}`)}
                            className={isInkCard ? 'text-white border-white/20 hover:border-lime' : ''}
                          >
                            Crop Details &amp; Inputs
                          </Button>

                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => handleStartCrop(crop.id)}
                            disabled={startingCropId === crop.id}
                            className="shadow-md"
                          >
                            {startingCropId === crop.id ? (
                              <span>Scheduling Plan...</span>
                            ) : (
                              <>
                                <span>Start This Crop</span>
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DATED TASK CALENDAR (Phase 8 Requirement 4) */}
        {activeTab === 'calendar' && activePlan && (
          <TaskCalendarTab
            plan={activePlan}
            cropName={activePlanCrop?.name || 'Active Crop'}
          />
        )}

        {/* TAB 3: INPUT CHECKLIST (Phase 8 Requirement 5) */}
        {activeTab === 'checklist' && (
          <InputChecklistTab
            cropId={activePlan?.crop_id || recommendations[0]?.id || 'crop_wheat'}
            cropName={activePlanCrop?.name || recommendations[0]?.name || 'Wheat'}
            landSize={selectedFarm.land_size}
            landUnit={selectedFarm.land_unit}
          />
        )}

        {/* Score Breakdown Modal */}
        <ScoreBreakdownModal
          isOpen={Boolean(breakdownCrop)}
          onClose={() => setBreakdownCrop(null)}
          crop={breakdownCrop}
        />
      </main>
    </LayoutShell>
  )
}
