import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  Coins,
  Layers,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ListCheck,
  CalendarDays,
  ShoppingCart,
} from 'lucide-react'
import {
  LayoutShell,
  Card,
  Button,
  Badge,
} from '@/components/ui'
import { SEEDED_CROPS, CROP_TASK_TEMPLATES } from '@/lib/data/seedCrops'
import { InputChecklistTab } from '@/components/planner/InputChecklistTab'
import { useStartCrop } from '@/lib/api/planner'
import { mockDb } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

export const CropDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const startCropMutation = useStartCrop()

  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'schedule'>('overview')
  const [isStarting, setIsStarting] = useState(false)

  const crop = SEEDED_CROPS.find((c) => c.id === id) || SEEDED_CROPS[0]
  const userFarm = user ? mockDb.getFarm(user.id) : null
  const farmSize = userFarm?.land_size || 2.5
  const farmUnit = userFarm?.land_unit || 'acres'

  // Profit range calculations
  const grossRevenuePerAcre = crop.avg_yield_per_acre * crop.mandi_price
  const netProfitPerAcre = grossRevenuePerAcre - crop.avg_cost_per_acre
  const totalFarmProfitMin = Math.round(netProfitPerAcre * farmSize * 0.9)
  const totalFarmProfitMax = Math.round(netProfitPerAcre * farmSize * 1.15)
  const totalFarmCost = Math.round(crop.avg_cost_per_acre * farmSize)

  const scheduleTemplates = CROP_TASK_TEMPLATES[crop.id] || CROP_TASK_TEMPLATES.default

  const handleStartCrop = async () => {
    setIsStarting(true)
    try {
      await startCropMutation.mutateAsync({
        farmId: userFarm?.id || 'farm_demo_1',
        cropId: crop.id,
        sowDate: new Date().toISOString().split('T')[0],
      })
      navigate('/plan')
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <LayoutShell>
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col gap-8">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate('/plan')}
          className="inline-flex items-center gap-2 text-sm text-forest hover:text-ink transition-colors font-medium self-start focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Crop Planner</span>
        </button>

        {/* Top Header Card */}
        <Card variant="surface" className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <Badge variant="forest">{crop.seasons.join(', ')} Season</Badge>
                <div className="flex items-center gap-1 text-xs text-forest font-semibold">
                  <ShieldCheck className="w-4 h-4 text-forest" />
                  <span>ICAR Agronomy Verified</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                {crop.name}
              </h1>

              <p className="text-sm text-muted leading-relaxed max-w-2xl">
                {crop.description}
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleStartCrop}
              disabled={isStarting}
              className="self-start md:self-center shrink-0 shadow-md"
            >
              {isStarting ? (
                <span>Scheduling Plan...</span>
              ) : (
                <>
                  <span>Start This Crop</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* 5 Agronomic & Financial Stat Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-line pt-5">
            {/* Duration */}
            <div className="p-3 rounded-card bg-white border border-line flex flex-col gap-0.5">
              <span className="text-[11px] text-muted flex items-center gap-1">
                <Clock className="w-3 h-3 text-forest" />
                <span>Maturity Cycle</span>
              </span>
              <span className="text-lg font-bold text-ink">{crop.duration_days} Days</span>
              <span className="text-[10px] text-muted capitalize">Water: {crop.water_need}</span>
            </div>

            {/* Cost Per Acre */}
            <div className="p-3 rounded-card bg-white border border-line flex flex-col gap-0.5">
              <span className="text-[11px] text-muted flex items-center gap-1">
                <Coins className="w-3 h-3 text-forest" />
                <span>Cost / Acre</span>
              </span>
              <span className="text-lg font-bold text-ink">
                ₹{crop.avg_cost_per_acre.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-muted">Total Farm: ₹{totalFarmCost.toLocaleString('en-IN')}</span>
            </div>

            {/* Expected Yield */}
            <div className="p-3 rounded-card bg-white border border-line flex flex-col gap-0.5">
              <span className="text-[11px] text-muted flex items-center gap-1">
                <Layers className="w-3 h-3 text-forest" />
                <span>Avg Yield / Acre</span>
              </span>
              <span className="text-lg font-bold text-ink">{crop.avg_yield_per_acre} Quintals</span>
              <span className="text-[10px] text-muted">Tested Baseline</span>
            </div>

            {/* Mandi Wholesale Rate */}
            <div className="p-3 rounded-card bg-white border border-line flex flex-col gap-0.5">
              <span className="text-[11px] text-muted flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-forest" />
                <span>Mandi Price</span>
              </span>
              <span className="text-lg font-bold text-ink">₹{crop.mandi_price} / Q</span>
              <span className="text-[10px] text-forest font-semibold">+{crop.price_change_pct}% YoY</span>
            </div>

            {/* Profit Range */}
            <div className="col-span-2 sm:col-span-1 p-3 rounded-card bg-white border border-forest/30 flex flex-col gap-0.5">
              <span className="text-[11px] text-forest font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-forest" />
                <span>Farm Net Profit</span>
              </span>
              <span className="text-base sm:text-lg font-bold text-ink">
                ₹{totalFarmProfitMin.toLocaleString('en-IN')} – ₹{totalFarmProfitMax.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-muted">For {farmSize} {farmUnit}</span>
            </div>
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-pill text-xs sm:text-sm font-bold transition-colors ${
              activeTab === 'overview'
                ? 'bg-ink text-white'
                : 'bg-surface text-ink hover:bg-surface-alt'
            }`}
          >
            Agronomy &amp; Profit Overview
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
            <span>Input Checklist ({farmSize} {farmUnit})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-pill text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'bg-ink text-white'
                : 'bg-surface text-ink hover:bg-surface-alt'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Crop Lifecycle Tasks</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & PROFIT FINANCIALS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-7 flex flex-col gap-5">
              <Card variant="surface" className="flex flex-col gap-3.5 p-5">
                <span className="text-sm font-bold text-ink uppercase tracking-wider border-b border-line pb-2">
                  Agronomic Soil &amp; Water Requirements
                </span>

                <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Compatible Soil Profiles</span>
                    <span className="font-semibold text-ink">{crop.soil_types.join(', ')}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted">Water / Irrigation Intensity</span>
                    <Badge variant="lime" className="capitalize">{crop.water_need} Requirement</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted">Optimum Sowing Period</span>
                    <span className="font-semibold text-ink">
                      {crop.seasons.includes('Rabi') ? 'October 15 – November 25' : 'June 10 – July 15'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted">Recommended Harvest Moisture</span>
                    <span className="font-semibold text-ink">11.5% – 12.5%</span>
                  </div>
                </div>
              </Card>

              <Card variant="surface" className="flex flex-col gap-3.5 p-5">
                <span className="text-sm font-bold text-ink uppercase tracking-wider border-b border-line pb-2">
                  Market Wholesale Procurement &amp; Liquidity
                </span>

                <p className="text-xs text-muted leading-relaxed">
                  Wheat and Rabi oilseeds enjoy direct procurement through FCI, NAFED, and private flour mills. Mandi arrivals in regional hubs peak within 10 days of harvest with guaranteed spot liquidity.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="forest">High Spot Liquidity</Badge>
                  <Badge variant="lime">Minimum Support Price (MSP) Covered</Badge>
                </div>
              </Card>
            </div>

            {/* Right: Profit Breakdown Simulator */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <Card variant="ink" className="flex flex-col gap-4 p-5 sm:p-6 text-white border-forest/60">
                <span className="text-xs font-bold uppercase tracking-wider text-lime">
                  Farm Financial Pro-Forma ({farmSize} {farmUnit})
                </span>

                <div className="flex flex-col gap-2.5 text-xs border-b border-white/10 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Estimated Gross Production</span>
                    <span className="font-bold text-white">
                      {(crop.avg_yield_per_acre * farmSize).toFixed(1)} Quintals
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Estimated Gross Revenue</span>
                    <span className="font-bold text-white">
                      ₹{(grossRevenuePerAcre * farmSize).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Total Input &amp; Labor Costs</span>
                    <span className="font-bold text-danger">
                      -₹{totalFarmCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-white/70">Projected Net Farmer Profit</span>
                  <span className="text-2xl sm:text-3xl font-bold text-lime">
                    ₹{totalFarmProfitMin.toLocaleString('en-IN')} – ₹{totalFarmProfitMax.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-white/60">
                    Net return calculated after certified seeds, fertilizers, tractor diesel, and combine fees.
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setActiveTab('checklist')}
                  className="w-full justify-center mt-2 shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4 mr-1 text-ink" />
                  <span>Inspect Input Checklist</span>
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: INPUT CHECKLIST (Phase 8 Requirement 5) */}
        {activeTab === 'checklist' && (
          <InputChecklistTab
            cropId={crop.id}
            cropName={crop.name}
            landSize={farmSize}
            landUnit={farmUnit}
          />
        )}

        {/* TAB 3: SCHEDULE / LIFECYCLE TASKS */}
        {activeTab === 'schedule' && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted px-1">
              Agronomic Task Template for {crop.name} ({scheduleTemplates.length} Milestones)
            </span>

            {scheduleTemplates.map((task, idx) => (
              <Card key={idx} variant="surface" className="p-4 flex items-start gap-4">
                <div className="w-8 h-8 rounded-pill bg-white border border-line flex items-center justify-center font-bold text-xs text-forest shrink-0">
                  +{task.day_offset}d
                </div>

                <div className="flex flex-col gap-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="forest">{task.stage}</Badge>
                    <span className="text-xs text-muted capitalize">{task.category}</span>
                  </div>
                  <h4 className="text-sm font-bold text-ink mt-0.5">{task.title}</h4>
                  <p className="text-xs text-muted leading-relaxed">{task.description}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </LayoutShell>
  )
}
