import React from 'react'
import { Sprout, Layers } from 'lucide-react'
import type { CropFinancialSummary } from '@/lib/api/ledger'

interface CropLedgerCardProps {
  summary: CropFinancialSummary
  isDark?: boolean
}

export const CropLedgerCard: React.FC<CropLedgerCardProps> = ({ summary, isDark = false }) => {
  const isProfit = summary.netProfit >= 0
  const planned = summary.planned

  return (
    <div
      className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-6 ${
        isDark
          ? 'bg-[var(--ink)] border-[var(--line)] text-white'
          : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink)]'
      }`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isDark
                    ? 'bg-white/10 text-[var(--lime)] border border-white/10'
                    : 'bg-[var(--surface-alt)] text-[var(--forest)] border border-[var(--line)]'
                }`}
              >
                {planned?.season || 'Active Season'} &bull; {planned ? `${planned.planned_area_acres} Acres` : 'Field Lot'}
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight">{summary.cropName}</h3>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isProfit
                  ? 'bg-[var(--forest-dark)] text-[var(--lime)] border border-[var(--lime)]/30'
                  : 'bg-red-950 text-[var(--danger)] border border-[var(--danger)]/30'
              }`}
            >
              {isProfit ? 'PROFIT' : 'LOSS'}
            </span>
          </div>
        </div>

        {/* Realized Financial Metrics Grid */}
        <div
          className={`p-4 rounded-2xl border grid grid-cols-3 gap-3 text-center ${
            isDark ? 'bg-black/30 border-white/10' : 'bg-[var(--bg-page)] border-[var(--line)]'
          }`}
        >
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-[var(--muted)]'}`}>
              Income
            </span>
            <div className="font-mono text-sm sm:text-base font-extrabold text-[var(--forest)] mt-0.5">
              ₹{summary.totalIncome.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-[var(--muted)]'}`}>
              Expense
            </span>
            <div className="font-mono text-sm sm:text-base font-extrabold text-[var(--danger)] mt-0.5">
              ₹{summary.totalExpense.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-[var(--muted)]'}`}>
              Net P&L
            </span>
            <div
              className={`font-mono text-sm sm:text-base font-black mt-0.5 ${
                isProfit ? 'text-[var(--lime)]' : 'text-[var(--danger)]'
              }`}
            >
              {isProfit ? '+' : ''}₹{summary.netProfit.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Planned vs Actual Comparison (Season Summary) */}
        {planned && (
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-[var(--surface-alt)] border-[var(--line)]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className={`flex items-center gap-1.5 ${isDark ? 'text-white/80' : 'text-[var(--ink)]'}`}>
                <Layers className="w-3.5 h-3.5 text-[var(--forest)]" />
                <span>Season Planned vs Actual Variance</span>
              </span>
              <span className={summary.variance.profitDiff >= 0 ? 'text-[var(--lime)]' : 'text-[var(--danger)]'}>
                {summary.variance.profitDiff >= 0 ? '+' : ''}₹{summary.variance.profitDiff.toLocaleString('en-IN')} vs Plan
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Cost Variance */}
              <div>
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className={isDark ? 'text-white/60' : 'text-[var(--muted)]'}>Costs vs Budget:</span>
                  <span className="font-mono font-semibold">
                    Actual: ₹{summary.totalExpense.toLocaleString('en-IN')} / Budget: ₹{planned.planned_expense.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-[var(--line)]'}`}>
                  <div
                    className={`h-full ${summary.totalExpense > planned.planned_expense ? 'bg-[var(--danger)]' : 'bg-[var(--forest)]'}`}
                    style={{
                      width: `${Math.min(100, Math.round((summary.totalExpense / (planned.planned_expense || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Revenue Variance */}
              <div>
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className={isDark ? 'text-white/60' : 'text-[var(--muted)]'}>Revenue vs Target:</span>
                  <span className="font-mono font-semibold">
                    Actual: ₹{summary.totalIncome.toLocaleString('en-IN')} / Target: ₹{planned.planned_income.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-[var(--line)]'}`}>
                  <div
                    className="h-full bg-[var(--lime)]"
                    style={{
                      width: `${Math.min(100, Math.round((summary.totalIncome / (planned.planned_income || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Cost Driver Note */}
      <div className={`pt-3 border-t text-[11px] flex items-center justify-between ${isDark ? 'border-white/10 text-white/70' : 'border-[var(--line)] text-[var(--muted)]'}`}>
        <span className="flex items-center gap-1">
          <Sprout className="w-3.5 h-3.5 text-[var(--forest)]" />
          Realized Return on Investment:
        </span>
        <span className={`font-mono font-bold ${isProfit ? 'text-[var(--lime)]' : 'text-[var(--danger)]'}`}>
          {summary.totalExpense > 0
            ? `${Math.round((summary.netProfit / summary.totalExpense) * 100)}% ROI`
            : 'N/A'}
        </span>
      </div>
    </div>
  )
}
