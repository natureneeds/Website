import React, { useState } from 'react'
import { PlusCircle, X, CheckCircle2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreateLedgerEntry } from '@/lib/api/ledger'
import { useAuth } from '@/context/AuthContext'
import { LEDGER_CATEGORY_META, type LedgerCategory, type LedgerEntryType } from '@/lib/data/seedLedger'

interface AddLedgerEntryModalProps {
  isOpen: boolean
  onClose: () => void
  availableCrops: string[]
}

export const AddLedgerEntryModal: React.FC<AddLedgerEntryModalProps> = ({
  isOpen,
  onClose,
  availableCrops,
}) => {
  const { user } = useAuth()
  const createEntry = useCreateLedgerEntry()

  const [entryType, setEntryType] = useState<LedgerEntryType>('expense')
  const [cropName, setCropName] = useState(availableCrops[0] || 'Wheat HD-3086')
  const [category, setCategory] = useState<LedgerCategory>('labour')
  const [amount, setAmount] = useState(2500)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const activeUserId = user?.id || 'usr_test_farmer'
    if (amount <= 0) return

    await createEntry.mutateAsync({
      user_id: activeUserId,
      crop_name: cropName.trim(),
      entry_type: entryType,
      category,
      amount,
      date,
      source_type: 'manual',
      notes: notes.trim() || undefined,
    })

    setSubmitted(true)
  }

  const handleResetAndClose = () => {
    setSubmitted(false)
    setNotes('')
    onClose()
  }

  const expenseCategories: LedgerCategory[] = [
    'labour',
    'diesel',
    'electricity',
    'rent',
    'machinery',
    'seed',
    'fertilizer',
    'pesticide',
    'other',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]">
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-page)] border border-[var(--line)] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-150 space-y-5">
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--surface-alt)] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--surface)] text-[var(--forest)] flex items-center justify-center mx-auto border border-[var(--line)]">
              <CheckCircle2 className="w-10 h-10 text-[var(--forest)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--ink)]">Ledger Entry Recorded!</h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
              Added {entryType.toUpperCase()} voucher for{' '}
              <strong className="text-[var(--ink)]">₹{amount.toLocaleString('en-IN')}</strong> under{' '}
              <span className="font-semibold text-[var(--forest)]">{cropName}</span>.
            </p>
            <div className="pt-2">
              <Button variant="primary" onClick={handleResetAndClose} className="w-full">
                Close & View Ledger
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-[10px] font-bold uppercase tracking-wider text-[var(--forest)] mb-1">
                <PlusCircle className="w-3.5 h-3.5 text-[var(--forest)]" />
                Farmer Cost & Voucher Entry
              </div>
              <h3 className="text-xl font-black text-[var(--ink)] tracking-tight">
                Log Expense or Income
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Record manual farming costs like diesel, hired labour wages, rent, or off-market cash sales.
              </p>
            </div>

            {/* Entry Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)]">
              <button
                type="button"
                onClick={() => {
                  setEntryType('expense')
                  setCategory('labour')
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  entryType === 'expense'
                    ? 'bg-[var(--danger)] text-white shadow-sm'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                Cost / Expense (खर्च)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEntryType('income')
                  setCategory('produce_sale')
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  entryType === 'income'
                    ? 'bg-[var(--forest)] text-white shadow-sm'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                Revenue / Income (आय)
              </button>
            </div>

            <div className="space-y-3">
              {/* Crop Plan Picker */}
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                  Associated Crop Plan
                </label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] cursor-pointer"
                >
                  {availableCrops.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="General Farm Costs">General Farm Overhead</option>
                </select>
              </div>

              {/* Category Picker */}
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                  Category (मद)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LedgerCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] cursor-pointer"
                >
                  {entryType === 'expense' ? (
                    expenseCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {LEDGER_CATEGORY_META[cat]?.label} ({LEDGER_CATEGORY_META[cat]?.label_hi})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="produce_sale">Mandi Produce Sale (उपज बिक्री)</option>
                      <option value="other">Government Subsidy / Other</option>
                    </>
                  )}
                </select>
              </div>

              {/* Amount & Date in 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                    Amount (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                    Date of Expense
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] cursor-pointer"
                    />
                    <Calendar className="w-4 h-4 text-[var(--muted)] absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Notes / Details */}
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                  Voucher Notes / Description
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid 4 labourers for weeding; or 25L diesel for canal pump..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={handleResetAndClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createEntry.isPending || amount <= 0}
                loading={createEntry.isPending}
              >
                Save Ledger Voucher
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
