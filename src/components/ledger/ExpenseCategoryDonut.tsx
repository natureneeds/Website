import React, { useState } from 'react'
import { LEDGER_CATEGORY_META, type LedgerCategory } from '@/lib/data/seedLedger'

interface ExpenseCategoryDonutProps {
  categoryBreakdown: Record<string, { label: string; amount: number; color: string }>
  totalExpense: number
}

export const ExpenseCategoryDonut: React.FC<ExpenseCategoryDonutProps> = ({
  categoryBreakdown,
  totalExpense,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const categories = Object.entries(categoryBreakdown).map(([catKey, data]) => ({
    key: catKey,
    name: data.label,
    value: data.amount,
    color: data.color || LEDGER_CATEGORY_META[catKey as LedgerCategory]?.color || 'var(--muted)',
    pct: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
  }))

  if (categories.length === 0 || totalExpense === 0) {
    return (
      <div className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--line)] text-center text-xs text-[var(--muted)]">
        No expense entries recorded yet.
      </div>
    )
  }

  // Pure SVG Donut Implementation (no heavy external chart library dependency issues)
  let cumulativeAngle = 0
  const radius = 64
  const strokeWidth = 22
  const circumference = 2 * Math.PI * radius

  const activeCategory = hoveredCategory
    ? categories.find((c) => c.key === hoveredCategory)
    : null

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[var(--surface)] border border-[var(--line)] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--forest)] px-2.5 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--line)]">
            Cost Allocation
          </span>
          <h3 className="text-lg font-black text-[var(--ink)] tracking-tight mt-1">
            Expense Breakdown by Category
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-[var(--danger)]">
          Total: ₹{totalExpense.toLocaleString('en-IN')}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
        {/* Donut Chart Visual */}
        <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
          <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="var(--line)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Segments */}
            {categories.map((cat) => {
              const strokeDasharray = `${(cat.pct / 100) * circumference} ${circumference}`
              const strokeDashoffset = -((cumulativeAngle / 360) * circumference)
              cumulativeAngle += (cat.pct / 100) * 360

              return (
                <circle
                  key={cat.key}
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={cat.color}
                  strokeWidth={hoveredCategory === cat.key ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  fill="transparent"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredCategory(cat.key)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              )
            })}
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
            {activeCategory ? (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] line-clamp-1">
                  {activeCategory.name}
                </span>
                <span className="text-base font-black text-[var(--ink)] font-mono">
                  {activeCategory.pct}%
                </span>
                <span className="text-[10px] font-mono text-[var(--forest)]">
                  ₹{activeCategory.value.toLocaleString('en-IN')}
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Total
                </span>
                <span className="text-sm font-black text-[var(--ink)] font-mono">
                  ₹{totalExpense.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-[var(--muted)]">
                  {categories.length} Categories
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
          {categories.map((cat) => (
            <div
              key={cat.key}
              onMouseEnter={() => setHoveredCategory(cat.key)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                hoveredCategory === cat.key
                  ? 'bg-[var(--surface-alt)] border-[var(--forest)] shadow-sm'
                  : 'bg-[var(--bg-page)] border-[var(--line)]'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-semibold text-[var(--ink)] truncate">{cat.name}</span>
              </div>
              <div className="text-right shrink-0 font-mono ml-2">
                <span className="font-bold text-[var(--ink)]">₹{cat.value.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-[var(--muted)] ml-1">({cat.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
