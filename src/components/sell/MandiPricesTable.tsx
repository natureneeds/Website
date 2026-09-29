import React, { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react'
import { useMandiPrices } from '@/lib/api/sellStorage'
import { getBestTimeToSellHint, type MandiPriceItem } from '@/lib/data/seedSellStorage'

// SVG Mini Sparkline generator
const Sparkline: React.FC<{ data: number[]; isPositive: boolean }> = ({ data, isPositive }) => {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 120
  const height = 36

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width
      const y = height - ((val - min) / range) * (height - 8) - 4
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={isPositive ? 'var(--forest)' : 'var(--danger)'}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

export const MandiPricesTable: React.FC = () => {
  const [district, setDistrict] = useState('all')
  const [selectedCropHint, setSelectedCropHint] = useState<MandiPriceItem | null>(null)
  const { data: prices = [], isLoading } = useMandiPrices(district)

  const districts = ['all', 'Hisar', 'Karnal', 'Sirsa', 'Ludhiana']

  return (
    <div className="space-y-6">
      {/* Header & District Filter */}
      <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-xs font-bold uppercase tracking-wider text-[var(--forest)] mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--forest)]" />
              Live Mandi Price Terminal & 30-Day Sparklines
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
              APMC Mandi Rates & Best Time to Sell
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
              Live market modal rates across regional mandis with 30-day historical trend analysis and actionable selling signals.
            </p>
          </div>

          {/* District Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase text-[var(--muted)] mr-1">District:</span>
            {districts.map((d) => (
              <button
                key={d}
                onClick={() => setDistrict(d)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  district === d
                    ? 'bg-[var(--forest)] text-[var(--white)]'
                    : 'bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
                }`}
              >
                {d === 'all' ? 'All Mandis' : d}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Crop "Best Time to Sell" Hint Banner */}
        {selectedCropHint && (
          <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--bg-page)] space-y-2 animate-in fade-in duration-200 shadow-sm">
            {(() => {
              const hint = getBestTimeToSellHint(selectedCropHint)
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--lime)] text-[var(--ink)]">
                      {hint.badge} &bull; {selectedCropHint.crop_name}
                    </span>
                    <button
                      onClick={() => setSelectedCropHint(null)}
                      className="text-xs text-[var(--muted)] hover:underline cursor-pointer"
                    >
                      Close hint
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--ink)]">{hint.headline}</h4>
                  <p className="text-xs text-[var(--ink)]/80 leading-relaxed">
                    {hint.recommendation}
                  </p>
                  <p className="text-[10px] text-[var(--muted)] italic pt-0.5">
                    {hint.disclaimer}
                  </p>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Mandi Prices Table */}
      {isLoading ? (
        <div className="p-8 text-center rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--lime)] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs text-[var(--muted)]">Loading live mandi rates...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">Commodity / Crop</th>
                <th className="py-3 px-4">APMC Market</th>
                <th className="py-3 px-4">Modal Price (₹/Q)</th>
                <th className="py-3 px-4">MSP Benchmark</th>
                <th className="py-3 px-4">30-Day Trend</th>
                <th className="py-3 px-4 text-right">Best Time to Sell</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {prices.map((item) => {
                const isPositive = item.price_change_30d_pct >= 0
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[var(--surface-alt)]/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-[var(--ink)]">
                      <div className="text-sm">{item.crop_name}</div>
                      <div className="text-[10px] text-[var(--muted)]">{item.last_updated}</div>
                    </td>

                    <td className="py-3.5 px-4 text-[var(--ink)] font-medium">
                      <div>{item.market}</div>
                      <div className="text-[10px] text-[var(--muted)]">{item.district}, {item.state}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-base font-black text-[var(--ink)]">
                        ₹{item.modal_price}
                      </span>
                      <div className="text-[10px] text-[var(--muted)]">
                        Range: ₹{item.min_price} - ₹{item.max_price}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[var(--muted)]">
                      {item.msp > 0 ? (
                        <div>
                          <span className="font-semibold text-[var(--ink)]">₹{item.msp}</span>
                          <div className="text-[10px] text-[var(--forest)] font-bold">
                            {item.modal_price >= item.msp ? '+ Above MSP' : '- Below MSP'}
                          </div>
                        </div>
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Sparkline data={item.trend_history_30d} isPositive={isPositive} />
                        <span
                          className={`text-xs font-black flex items-center gap-0.5 ${
                            isPositive ? 'text-[var(--forest)]' : 'text-[var(--danger)]'
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                          )}
                          {isPositive ? '+' : ''}
                          {item.price_change_30d_pct}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCropHint(item)}
                        className="px-3 py-1 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-xs font-bold text-[var(--forest)] hover:bg-[var(--lime)] hover:text-[var(--ink)] transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Sell Hint &rarr;
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
