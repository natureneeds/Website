import {
  Calendar,
  Layers,
  Droplets,
  TrendingUp,
  Coins,
  ShieldCheck,
} from 'lucide-react'
import { Modal, Badge, Button } from '@/components/ui'
import type { RecommendedCrop } from '@/lib/api/planner'

interface ScoreBreakdownModalProps {
  isOpen: boolean
  onClose: () => void
  crop: RecommendedCrop | null
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({
  isOpen,
  onClose,
  crop,
}) => {
  if (!crop) return null

  const { score_breakdown: b, total_score } = crop

  const criteria = [
    {
      title: 'Season Agro-Climatic Match',
      score: b.season_score,
      maxScore: 30,
      icon: Calendar,
      reason: b.season_reason,
    },
    {
      title: 'Soil Profile & Texture Compatibility',
      score: b.soil_score,
      maxScore: 25,
      icon: Layers,
      reason: b.soil_reason,
    },
    {
      title: 'Irrigation & Water Availability Match',
      score: b.water_score,
      maxScore: 20,
      icon: Droplets,
      reason: b.water_reason,
    },
    {
      title: 'Latest Mandi Wholesale Price Trend',
      score: b.mandi_trend_score,
      maxScore: 15,
      icon: TrendingUp,
      reason: b.mandi_reason,
    },
    {
      title: 'Cost vs Expected Yield / Profit Ratio',
      score: b.profit_margin_score,
      maxScore: 10,
      icon: Coins,
      reason: `Estimated profit margin based on ₹${crop.mandi_price}/Q mandi rate vs ₹${crop.avg_cost_per_acre.toLocaleString('en-IN')}/acre production cost.`,
    },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Recommendation Breakdown: ${crop.name}`}
    >
      <div className="flex flex-col gap-5 mt-2">
        {/* Total Score Banner */}
        <div className="p-4 rounded-card bg-surface-alt border border-line flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted uppercase font-bold tracking-wider">
              Composite Agronomic Score
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-bold text-ink">{total_score}</span>
              <span className="text-sm font-semibold text-muted">/ 100 Points</span>
            </div>
          </div>

          <Badge variant="lime" dot className="text-sm px-3 py-1">
            Top Tier Match
          </Badge>
        </div>

        {/* 5 Scoring Pillars */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Evaluation Breakdown
          </span>

          {criteria.map((item, idx) => {
            const Icon = item.icon
            const pct = Math.round((item.score / item.maxScore) * 100)

            return (
              <div
                key={idx}
                className="p-3.5 rounded-card bg-surface border border-line flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-pill bg-white flex items-center justify-center text-forest shrink-0 border border-line">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-ink">
                      {item.title}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-forest bg-white px-2 py-0.5 rounded-pill border border-line">
                    {item.score} / {item.maxScore} pts
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-pill bg-surface-alt overflow-hidden border border-line">
                  <div
                    className="h-full bg-lime transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className="text-xs text-muted leading-relaxed pl-1">
                  {item.reason}
                </p>
              </div>
            )
          })}
        </div>

        {/* Audit Transparency Note */}
        <div className="p-3 rounded-card bg-surface-alt border border-line flex items-center gap-2 text-xs text-muted">
          <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
          <span>
            Deterministic agronomic scoring from ICAR crop standards and verified eNAM mandi rates. Zero sponsored placements.
          </span>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onClose}
          className="w-full justify-center"
        >
          Close Breakdown
        </Button>
      </div>
    </Modal>
  )
}
