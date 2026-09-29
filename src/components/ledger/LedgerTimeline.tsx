import React, { useState } from 'react'
import {
  Calendar,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  Search,
} from 'lucide-react'
import { useDeleteLedgerEntry } from '@/lib/api/ledger'
import { LEDGER_CATEGORY_META, type LedgerEntry, type LedgerEntryType } from '@/lib/data/seedLedger'

interface LedgerTimelineProps {
  entries: LedgerEntry[]
}

export const LedgerTimeline: React.FC<LedgerTimelineProps> = ({ entries }) => {
  const [filterType, setFilterType] = useState<'all' | LedgerEntryType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const deleteEntry = useDeleteLedgerEntry()

  const filtered = entries.filter((e) => {
    if (filterType !== 'all' && e.entry_type !== filterType) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        e.crop_name.toLowerCase().includes(q) ||
        (e.notes && e.notes.toLowerCase().includes(q)) ||
        e.category.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleDelete = async (id: string) => {
    if (confirm('Delete this ledger voucher entry?')) {
      await deleteEntry.mutateAsync(id)
    }
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--line)] space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--forest)] px-2.5 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--line)]">
            Audit Trail
          </span>
          <h3 className="text-xl font-black text-[var(--ink)] tracking-tight mt-1">
            Financial Ledger & Vouchers Timeline
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full bg-[var(--surface-alt)] p-1 border border-[var(--line)] text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[var(--forest)] text-white shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              All ({entries.length})
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                filterType === 'income'
                  ? 'bg-[var(--forest)] text-white shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                filterType === 'expense'
                  ? 'bg-[var(--forest)] text-white shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              Expenses
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--bg-page)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
            />
            <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-2.5 top-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Timeline List */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--line)] rounded-2xl">
          No transactions matching your criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => {
            const isIncome = entry.entry_type === 'income'
            const meta = LEDGER_CATEGORY_META[entry.category] || {
              label: entry.category,
              label_hi: '',
              color: 'var(--muted)',
            }

            return (
              <div
                key={entry.id}
                className="p-4 rounded-2xl bg-[var(--bg-page)] border border-[var(--line)] hover:border-[var(--forest)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                      isIncome
                        ? 'bg-[var(--forest)]/10 text-[var(--forest)] border-[var(--forest)]/20'
                        : 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[var(--ink)]">
                        {entry.crop_name}
                      </span>
                      <span className="text-[11px] px-2 py-0.2 rounded-full bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-semibold">
                        {meta.label}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 rounded ${
                          entry.source_type === 'auto_marketplace'
                            ? 'bg-blue-100 text-blue-800'
                            : entry.source_type === 'auto_produce_sale'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-[var(--surface-alt)] text-[var(--muted)]'
                        }`}
                      >
                        {entry.source_type === 'auto_marketplace'
                          ? 'Auto: Marketplace'
                          : entry.source_type === 'auto_produce_sale'
                          ? 'Auto: Produce Sale'
                          : 'Manual Voucher'}
                      </span>
                    </div>

                    {entry.notes && (
                      <p className="text-xs text-[var(--muted)] line-clamp-1">
                        {entry.notes}
                      </p>
                    )}

                    <div className="text-[11px] text-[var(--muted)] flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[var(--muted)]" />
                        {entry.date}
                      </span>
                      {entry.source_id && (
                        <span>&bull; Ref #{entry.source_id.substring(0, 12)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--line)]">
                  <div className="text-right">
                    <div
                      className={`font-mono text-base font-black ${
                        isIncome ? 'text-[var(--forest)]' : 'text-[var(--danger)]'
                      }`}
                    >
                      {isIncome ? '+' : '-'}₹{entry.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">
                      {isIncome ? 'Credit (जमा)' : 'Debit (खर्च)'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(entry.id)}
                    title="Delete Entry"
                    className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--surface)] cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
