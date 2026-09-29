import React from 'react'
import { TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight, DollarSign, Wallet } from 'lucide-react'

interface LedgerSummaryCardProps {
  totalIncome: number
  totalExpense: number
  netProfit: number
  profitMarginPct: number
  entriesCount: number
}

export const LedgerSummaryCard: React.FC<LedgerSummaryCardProps> = ({
  totalIncome,
  totalExpense,
  netProfit,
  profitMarginPct,
  entriesCount,
}) => {
  const isProfit = netProfit >= 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Revenue / Income */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Total Revenue (आय)
          </span>
          <div className="w-8 h-8 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] flex items-center justify-center text-[var(--forest)]">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--forest)] font-mono">
            ₹{totalIncome.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[var(--muted)] mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--forest)]" />
            <span>Mandi sales & direct trades</span>
          </div>
        </div>
      </div>

      {/* 2. Total Costs / Expense */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Total Costs (लागत)
          </span>
          <div className="w-8 h-8 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] flex items-center justify-center text-[var(--danger)]">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--danger)] font-mono">
            ₹{totalExpense.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[var(--muted)] mt-1 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-[var(--danger)]" />
            <span>Inputs, labour, diesel, rentals</span>
          </div>
        </div>
      </div>

      {/* 3. Net Profit / Loss (Highlight card with ink background) */}
      <div className="p-5 rounded-2xl bg-[var(--ink)] border border-[var(--line)] text-white flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--lime)]">
            Net P&L (शुद्ध मुनाफा)
          </span>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[var(--lime)]">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div
            className={`text-2xl sm:text-3xl font-black font-mono ${
              isProfit ? 'text-[var(--lime)]' : 'text-[var(--danger)]'
            }`}
          >
            {isProfit ? '+' : ''}₹{netProfit.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-white/70 mt-1 flex items-center gap-1">
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                isProfit ? 'bg-[var(--forest-dark)] text-[var(--lime)]' : 'bg-red-950 text-[var(--danger)]'
              }`}
            >
              {profitMarginPct}% Margin
            </span>
            <span>Realized season return</span>
          </div>
        </div>
      </div>

      {/* 4. Transactions Recorded */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Audit Records
          </span>
          <div className="w-8 h-8 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] flex items-center justify-center text-[var(--ink)]">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--ink)] font-mono">
            {entriesCount}
          </div>
          <div className="text-[11px] text-[var(--muted)] mt-1">
            <span>Verified ledger vouchers</span>
          </div>
        </div>
      </div>
    </div>
  )
}
