import React, { useState } from 'react'
import { LayoutShell } from '@/components/ui/LayoutShell'
import { Button } from '@/components/ui/Button'
import { LedgerSummaryCard } from '@/components/ledger/LedgerSummaryCard'
import { CropLedgerCard } from '@/components/ledger/CropLedgerCard'
import { ExpenseCategoryDonut } from '@/components/ledger/ExpenseCategoryDonut'
import { LedgerTimeline } from '@/components/ledger/LedgerTimeline'
import { AddLedgerEntryModal } from '@/components/ledger/AddLedgerEntryModal'
import {
  useLedgerEntries,
  computeLedgerSummary,
  exportLedgerToCsv,
  exportLedgerToPdf,
} from '@/lib/api/ledger'
import {
  PlusCircle,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Layers,
} from 'lucide-react'

export const LedgerPage: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { data: entries = [], isLoading } = useLedgerEntries(
    selectedCrop === 'all' ? undefined : selectedCrop
  )

  const summary = computeLedgerSummary(entries, selectedCrop)
  const availableCrops = Array.from(
    new Set(entries.map((e) => e.crop_name).concat(['Wheat HD-3086', 'Mustard Pusa Bold', 'Paddy Basmati 1121']))
  )

  const handleExportCsv = () => {
    exportLedgerToCsv(entries)
  }

  const handleExportPdf = () => {
    exportLedgerToPdf(entries, summary)
  }

  return (
    <LayoutShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Hero Banner */}
        <div className="p-6 sm:p-10 rounded-3xl bg-[var(--surface)] border border-[var(--line)] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-xs font-bold uppercase tracking-wider text-[var(--forest)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--forest)]" />
                Farmer Accounting & P&L Intelligence
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-[var(--ink)] tracking-tight">
                Crop Ledger & Farm Profitability
              </h1>
              <p className="text-xs sm:text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
                Automated accounting that converts marketplace seed & fertilizer orders into expenses, and accepted mandi produce deals into realized income. Log manual costs to track your true net profit.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Cost / Income</span>
              </Button>

              <Button
                variant="secondary"
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold"
              >
                <FileSpreadsheet className="w-4 h-4 text-[var(--forest)]" />
                <span>Export CSV</span>
              </Button>

              <Button
                variant="secondary"
                onClick={handleExportPdf}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold"
              >
                <Printer className="w-4 h-4 text-[var(--forest)]" />
                <span>Export PDF</span>
              </Button>
            </div>
          </div>

          {/* Crop Selector Tabs */}
          <div className="flex items-center gap-2 pt-2 overflow-x-auto">
            <span className="text-xs font-semibold text-[var(--ink)] shrink-0">Filter Crop:</span>
            <button
              onClick={() => setSelectedCrop('all')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                selectedCrop === 'all'
                  ? 'bg-[var(--forest)] text-white shadow-sm'
                  : 'bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              All Crops
            </button>
            {availableCrops.map((crop) => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                  selectedCrop === crop
                    ? 'bg-[var(--forest)] text-white shadow-sm'
                    : 'bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Summary KPI Cards */}
        <LedgerSummaryCard
          totalIncome={summary.totalIncome}
          totalExpense={summary.totalExpense}
          netProfit={summary.netProfit}
          profitMarginPct={summary.profitMarginPct}
          entriesCount={summary.entriesCount}
        />

        {/* 2. Per-Crop Profitability Cards & Season Planned vs Actual */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[var(--surface)] text-[var(--forest)] border border-[var(--line)]">
                <Layers className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-black text-[var(--ink)] tracking-tight">
                Per-Crop Realized P&L & Season Summary
              </h2>
            </div>
            <span className="text-xs text-[var(--muted)]">
              Planned Estimate vs Actual Vouchers
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-[var(--muted)]">
              Loading crop summaries...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {summary.perCropSummaries.map((cropSum, idx) => (
                <CropLedgerCard
                  key={cropSum.cropName}
                  summary={cropSum}
                  isDark={idx % 2 === 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* 3. Expense Donut Breakdown */}
        <ExpenseCategoryDonut
          categoryBreakdown={summary.categoryBreakdown}
          totalExpense={summary.totalExpense}
        />

        {/* 4. Chronological Ledger Vouchers Timeline */}
        <LedgerTimeline entries={entries} />

        {/* Manual Voucher Entry Modal */}
        <AddLedgerEntryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          availableCrops={availableCrops}
        />
      </div>
    </LayoutShell>
  )
}
export default LedgerPage
