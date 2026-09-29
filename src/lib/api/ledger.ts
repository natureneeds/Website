import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isMockAuth, mockDb } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import {
  type LedgerEntry,
  type CropSeasonEstimate,
  SEEDED_PLANNED_ESTIMATES,
  LEDGER_CATEGORY_META,
} from '@/lib/data/seedLedger'

// ============================================================================
// 1. QUERY & MUTATION HOOKS
// ============================================================================

export const useLedgerEntries = (cropName?: string) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['ledger-entries', user?.id, cropName],
    queryFn: async (): Promise<LedgerEntry[]> => {
      if (!isMockAuth && user?.id) {
        try {
          let query = supabase
            .from('ledger_entries')
            .select('*')
            .order('date', { ascending: false })
          if (cropName && cropName !== 'all') {
            query = query.ilike('crop_name', `%${cropName}%`)
          }
          const { data, error } = await query
          if (!error && data) return data as any
        } catch {
          // fallback
        }
      }
      return mockDb.getLedgerEntries(user?.id, cropName)
    },
    staleTime: 5 * 1000,
  })
}

export const useCreateLedgerEntry = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (
      entry: Omit<LedgerEntry, 'id' | 'created_at'>
    ): Promise<LedgerEntry> => {
      if (!isMockAuth && user?.id) {
        try {
          const { data, error } = await supabase
            .from('ledger_entries')
            .insert(entry)
            .select('*')
            .single()
          if (!error && data) return data as any
        } catch {
          // fallback
        }
      }
      return mockDb.createLedgerEntry(entry)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] })
    },
  })
}

export const useDeleteLedgerEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<boolean> => {
      if (!isMockAuth) {
        try {
          await supabase.from('ledger_entries').delete().eq('id', id)
        } catch {
          // fallback
        }
      }
      return mockDb.deleteLedgerEntry(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] })
    },
  })
}

// ============================================================================
// 2. FINANCIAL COMPUTATION & AGGREGATION
// ============================================================================

export interface CropFinancialSummary {
  cropName: string
  totalExpense: number
  totalIncome: number
  netProfit: number
  profitMarginPct: number
  categoryBreakdown: Record<string, { label: string; amount: number; color: string }>
  planned?: CropSeasonEstimate
  variance: {
    expenseDiff: number
    incomeDiff: number
    profitDiff: number
  }
}

export const computeLedgerSummary = (
  entries: LedgerEntry[],
  selectedCrop: string = 'all'
) => {
  const filtered =
    selectedCrop === 'all'
      ? entries
      : entries.filter((e) => e.crop_name.toLowerCase().includes(selectedCrop.toLowerCase()))

  let totalExpense = 0
  let totalIncome = 0
  const categoryBreakdown: Record<string, { label: string; amount: number; color: string }> = {}

  filtered.forEach((entry) => {
    const meta = LEDGER_CATEGORY_META[entry.category] || {
      label: entry.category,
      color: 'var(--muted)',
    }
    if (entry.entry_type === 'expense') {
      totalExpense += entry.amount
      if (!categoryBreakdown[entry.category]) {
        categoryBreakdown[entry.category] = { label: meta.label, amount: 0, color: meta.color }
      }
      categoryBreakdown[entry.category].amount += entry.amount
    } else {
      totalIncome += entry.amount
    }
  })

  const netProfit = totalIncome - totalExpense
  const profitMarginPct = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0

  // Per crop breakdowns
  const cropNames = Array.from(new Set(entries.map((e) => e.crop_name)))
  const perCropSummaries: CropFinancialSummary[] = cropNames.map((cName) => {
    const cropEntries = entries.filter((e) => e.crop_name === cName)
    let cExp = 0
    let cInc = 0
    const cCatBreakdown: Record<string, { label: string; amount: number; color: string }> = {}

    cropEntries.forEach((e) => {
      const meta = LEDGER_CATEGORY_META[e.category] || { label: e.category, color: 'var(--muted)' }
      if (e.entry_type === 'expense') {
        cExp += e.amount
        if (!cCatBreakdown[e.category]) {
          cCatBreakdown[e.category] = { label: meta.label, amount: 0, color: meta.color }
        }
        cCatBreakdown[e.category].amount += e.amount
      } else {
        cInc += e.amount
      }
    })

    const cProfit = cInc - cExp
    const cMargin = cInc > 0 ? Math.round((cProfit / cInc) * 100) : 0
    const planned = SEEDED_PLANNED_ESTIMATES[cName]

    return {
      cropName: cName,
      totalExpense: cExp,
      totalIncome: cInc,
      netProfit: cProfit,
      profitMarginPct: cMargin,
      categoryBreakdown: cCatBreakdown,
      planned,
      variance: {
        expenseDiff: planned ? cExp - planned.planned_expense : 0,
        incomeDiff: planned ? cInc - planned.planned_income : 0,
        profitDiff: planned ? cProfit - planned.planned_profit : 0,
      },
    }
  })

  return {
    totalExpense,
    totalIncome,
    netProfit,
    profitMarginPct,
    categoryBreakdown,
    perCropSummaries,
    entriesCount: filtered.length,
  }
}

// ============================================================================
// 3. EXPORT HELPERS (CSV & PDF)
// ============================================================================

export const exportLedgerToCsv = (entries: LedgerEntry[], filename = 'kisan_ledger.csv') => {
  const headers = ['Date', 'Crop', 'Type', 'Category', 'Amount (INR)', 'Source', 'Notes']
  const rows = entries.map((e) => [
    e.date,
    `"${e.crop_name.replace(/"/g, '""')}"`,
    e.entry_type.toUpperCase(),
    LEDGER_CATEGORY_META[e.category]?.label || e.category,
    e.amount,
    e.source_type,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportLedgerToPdf = (
  entries: LedgerEntry[],
  summary: ReturnType<typeof computeLedgerSummary>
) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const rowsHtml = entries
    .map(
      (e) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid var(--line);">${e.date}</td>
      <td style="padding: 8px; border-bottom: 1px solid var(--line); font-weight: bold;">${e.crop_name}</td>
      <td style="padding: 8px; border-bottom: 1px solid var(--line); color: ${
        e.entry_type === 'income' ? 'var(--forest)' : 'var(--danger)'
      }; font-weight: bold; text-transform: uppercase;">
        ${e.entry_type}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid var(--line);">${
        LEDGER_CATEGORY_META[e.category]?.label || e.category
      }</td>
      <td style="padding: 8px; border-bottom: 1px solid var(--line); text-align: right; font-family: monospace; font-weight: bold;">
        ₹${e.amount.toLocaleString('en-IN')}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid var(--line); font-size: 11px; color: var(--muted);">${
        e.notes || '-'
      }</td>
    </tr>
  `
    )
    .join('')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Kisan OS — Farmer Financial Ledger</title>
        <link rel="stylesheet" href="/src/styles/tokens.css">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: var(--ink); background: var(--bg-page); }
          h1 { margin-bottom: 4px; }
          .summary-box { display: flex; gap: 20px; margin: 20px 0; background: var(--surface-alt); padding: 16px; border-radius: 8px; border: 1px solid var(--line); }
          .stat { flex: 1; }
          .stat-label { font-size: 11px; text-transform: uppercase; color: var(--muted); font-weight: bold; }
          .stat-value { font-size: 20px; font-weight: bold; font-family: monospace; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th { background: var(--surface); padding: 10px 8px; text-align: left; font-size: 11px; border-bottom: 2px solid var(--line); }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--forest); padding-bottom: 12px;">
          <div>
            <h1>Kisan OS &bull; Farmer Accounting Ledger</h1>
            <p style="margin: 0; font-size: 12px; color: var(--muted);">Generated on ${new Date().toLocaleDateString(
              'en-IN',
              { dateStyle: 'full' }
            )}</p>
          </div>
          <button onclick="window.print()" style="padding: 8px 16px; background: var(--forest); color: var(--white); border: none; border-radius: 20px; cursor: pointer; font-weight: bold;">
            Print / Save as PDF
          </button>
        </div>

        <div class="summary-box">
          <div class="stat">
            <div class="stat-label">Total Revenue (Income)</div>
            <div class="stat-value" style="color: var(--forest);">₹${summary.totalIncome.toLocaleString(
              'en-IN'
            )}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total Input Cost (Expense)</div>
            <div class="stat-value" style="color: var(--danger);">₹${summary.totalExpense.toLocaleString(
              'en-IN'
            )}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Net Profit / Loss</div>
            <div class="stat-value" style="color: ${
              summary.netProfit >= 0 ? 'var(--forest)' : 'var(--danger)'
            };">
              ₹${summary.netProfit.toLocaleString('en-IN')} (${summary.profitMarginPct}%)
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Crop</th>
              <th>Type</th>
              <th>Category</th>
              <th style="text-align: right;">Amount (INR)</th>
              <th>Notes / Reference</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
    </html>
  `)
  printWindow.document.close()
}
