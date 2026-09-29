import React, { useState } from 'react'
import { Warehouse, Calendar, CheckCircle2, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreateWarehouseBooking } from '@/lib/api/sellStorage'
import { useAuth } from '@/context/AuthContext'
import type { WarehouseItem } from '@/lib/data/seedSellStorage'

interface WarehouseBookingModalProps {
  isOpen: boolean
  onClose: () => void
  warehouse: WarehouseItem | null
}

export const WarehouseBookingModal: React.FC<WarehouseBookingModalProps> = ({
  isOpen,
  onClose,
  warehouse,
}) => {
  const { user, profile } = useAuth()
  const createBooking = useCreateWarehouseBooking()

  const [cropName, setCropName] = useState('Wheat HD-3086')
  const [qty, setQty] = useState(100) // quintals
  const [months, setMonths] = useState(3)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen || !warehouse) return null

  const monthlyRate = warehouse.price_per_quintal_month
  const totalCost = qty * monthlyRate * months

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    await createBooking.mutateAsync({
      warehouse_id: warehouse.id,
      farmer_id: user.id,
      farmer_name: profile?.full_name || 'Farmer Client',
      farmer_phone: user.phone || profile?.phone || '+91 98765 43210',
      crop_name: cropName.trim(),
      qty_quintals: qty,
      start_date: startDate,
      months_count: months,
      total_cost: totalCost,
    })
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]">
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-page)] border border-[var(--line)] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-150 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--surface-alt)] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--surface)] text-[var(--forest)] flex items-center justify-center mx-auto border border-[var(--line)]">
              <CheckCircle2 className="w-10 h-10 text-[var(--forest)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--ink)]">Booking Request Submitted!</h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
              Your storage request for <span className="font-semibold text-[var(--ink)]">{qty} Quintals</span> of {cropName} at <span className="font-semibold text-[var(--ink)]">{warehouse.name}</span> has been lodged.
            </p>
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Duration:</span>
                <span className="font-medium text-[var(--ink)]">{months} months ({startDate})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Estimated Charges:</span>
                <span className="font-bold text-[var(--forest)]">₹{totalCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">e-NWR Receipt:</span>
                <span className="font-semibold text-[var(--forest)]">Eligible for Bank Pledge Loan</span>
              </div>
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                onClick={() => {
                  setSubmitted(false)
                  onClose()
                }}
                className="w-full"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[var(--surface)] text-[var(--forest)] border border-[var(--line)]">
                  <Warehouse className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Warehouse Space Reservation
                </span>
              </div>
              <h3 className="text-xl font-black text-[var(--ink)] tracking-tight mt-1 line-clamp-1">
                {warehouse.name}
              </h3>
              <p className="text-xs text-[var(--muted)]">
                {warehouse.district} &bull; ₹{warehouse.price_per_quintal_month}/quintal/month &bull; {warehouse.available_capacity_mt} MT Available
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                  Crop to Store
                </label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Wheat, Mustard, Paddy"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                    Quantity (Quintals)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="10000"
                    required
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] font-mono"
                  />
                  <span className="text-[10px] text-[var(--muted)]">{(qty / 10).toFixed(1)} Metric Tonnes</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                    Duration (Months)
                  </label>
                  <select
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] cursor-pointer"
                  >
                    <option value={1}>1 Month</option>
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={9}>9 Months</option>
                    <option value={12}>12 Months (Annual)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                  Expected Inward Arrival Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] cursor-pointer"
                  />
                  <Calendar className="w-4 h-4 text-[var(--muted)] absolute right-3.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Price calculation summary */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-2 text-xs">
              <div className="flex justify-between items-center text-[var(--muted)]">
                <span>Storage rate:</span>
                <span className="font-mono text-[var(--ink)]">₹{monthlyRate} &times; {qty} Q &times; {months} mo</span>
              </div>
              <div className="border-t border-[var(--line)] pt-2 flex justify-between items-center">
                <span className="font-bold text-[var(--ink)]">Estimated Storage Rent:</span>
                <span className="text-base font-extrabold text-[var(--forest)] font-mono">
                  ₹{totalCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] text-[11px] text-[var(--muted)]">
              <AlertCircle className="w-4 h-4 text-[var(--forest)] shrink-0 mt-0.5" />
              <span>
                Standard moisture testing and electronic weighbridge verification are conducted upon arrival. Insurance coverage against perils is included.
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createBooking.isPending}
                className="flex-1"
              >
                {createBooking.isPending ? 'Booking...' : 'Confirm Reservation'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
