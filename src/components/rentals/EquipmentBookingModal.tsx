import React, { useState } from 'react'
import { Calendar, Clock, MapPin, CheckCircle2, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreateRentalBooking } from '@/lib/api/rentals'
import { useAuth } from '@/context/AuthContext'
import type { RentalListing } from '@/lib/supabase/types'

interface EquipmentBookingModalProps {
  isOpen: boolean
  onClose: () => void
  listing: RentalListing | null
}

export const EquipmentBookingModal: React.FC<EquipmentBookingModalProps> = ({
  isOpen,
  onClose,
  listing,
}) => {
  const { user, profile, farm } = useAuth()
  const createBooking = useCreateRentalBooking()

  // Default to tomorrow's date
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(tomorrow)
  const [duration, setDuration] = useState(4) // default 4 hours / units
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen || !listing) return null

  const isDateBooked = listing.booked_dates?.includes(startDate)
  const totalPrice = listing.price * duration

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || isDateBooked) return

    await createBooking.mutateAsync({
      listing_id: listing.id,
      renter_id: user.id,
      owner_id: listing.owner_id,
      renter_name: profile?.full_name || 'Farmer',
      renter_phone: user.phone || profile?.phone || '+91 98765 00000',
      start_date: startDate,
      end_date: startDate,
      hours_or_days: duration,
      total_price: totalPrice,
      status: 'requested',
      notes: notes.trim() || `Field in ${farm?.village || 'Village'}, ${farm?.district || listing.district}`,
    })
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]">
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-page)] border border-[var(--line)] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-150">
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
            <h3 className="text-2xl font-black text-[var(--ink)]">Booking Request Sent!</h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed">
              Your request for <strong className="text-[var(--ink)]">{listing.title}</strong> has been
              sent directly to owner <span className="font-semibold text-[var(--ink)]">{listing.owner_name}</span>.
              You will receive an in-app confirmation once accepted.
            </p>
            <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Service Date:</span>
                <span className="font-bold text-[var(--ink)]">{startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Duration:</span>
                <span className="font-bold text-[var(--ink)]">
                  {duration} {listing.price_unit.replace('_', ' ')}s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Estimated Total:</span>
                <span className="font-black text-[var(--forest)] text-sm">₹{totalPrice}</span>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setSubmitted(false)
                onClose()
              }}
            >
              Done & Track Status
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--forest)] px-2.5 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--line)]">
                Equipment Hire Request
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight mt-1.5 line-clamp-1">
                {listing.title}
              </h3>
              <p className="text-xs text-[var(--muted)] flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--forest)] shrink-0" />
                <span>{listing.area_served} &bull; Owner: {listing.owner_name}</span>
              </p>
            </div>

            {/* Price Preview Pill */}
            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--ink)]">Hire Rate:</span>
              <div className="text-right">
                <span className="font-black text-sm text-[var(--ink)]">
                  ₹{listing.price}
                </span>{' '}
                <span className="text-[var(--muted)]">/ {listing.price_unit.replace('per_', '')}</span>
              </div>
            </div>

            {/* Date Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--forest)]" />
                Required Date
              </label>
              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full text-xs p-3 rounded-xl border bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none ${
                  isDateBooked ? 'border-[var(--danger)]' : 'border-[var(--line)] focus:border-[var(--forest)]'
                }`}
              />
              {isDateBooked && (
                <p className="text-[11px] text-[var(--danger)] font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  This machine is already reserved on this date. Please select another date.
                </p>
              )}
            </div>

            {/* Duration Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--forest)]" />
                Estimated Units ({listing.price_unit.replace('per_', '')}s)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-28 text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                />
                <span className="text-xs text-[var(--muted)]">
                  Total Estimate: <strong className="text-[var(--ink)] text-sm">₹{totalPrice}</strong>
                </span>
              </div>
            </div>

            {/* Field Location / Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Field Location & Details (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Farm near Canal gate #4, Barwala Road. Need tractor for deep summer ploughing."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createBooking.isPending || isDateBooked}
                loading={createBooking.isPending}
              >
                Send Hire Request
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
