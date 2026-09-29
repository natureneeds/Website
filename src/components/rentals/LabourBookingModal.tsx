import React, { useState } from 'react'
import { Calendar, Users, CheckCircle2, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreateLabourBooking } from '@/lib/api/rentals'
import { useAuth } from '@/context/AuthContext'
import type { LabourListing } from '@/lib/supabase/types'

interface LabourBookingModalProps {
  isOpen: boolean
  onClose: () => void
  listing: LabourListing | null
}

export const LabourBookingModal: React.FC<LabourBookingModalProps> = ({
  isOpen,
  onClose,
  listing,
}) => {
  const { user, profile, farm } = useAuth()
  const createBooking = useCreateLabourBooking()

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(tomorrow)
  const [daysCount, setDaysCount] = useState(2)
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen || !listing) return null

  const isDateBooked = listing.booked_dates?.includes(startDate)
  const totalAmount = listing.daily_rate * daysCount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || isDateBooked) return

    await createBooking.mutateAsync({
      listing_id: listing.id,
      farmer_id: user.id,
      leader_id: listing.leader_id,
      farmer_name: profile?.full_name || 'Farmer',
      farmer_phone: user.phone || profile?.phone || '+91 98765 00000',
      start_date: startDate,
      days_count: daysCount,
      total_amount: totalAmount,
      status: 'requested',
      notes: notes.trim() || `Farm at ${farm?.village || 'Village'}, ${farm?.district || listing.district}`,
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
            <h3 className="text-2xl font-black text-[var(--ink)]">Labour Request Dispatched!</h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed">
              Your request for <strong className="text-[var(--ink)]">{listing.title}</strong> has been
              sent to crew leader <span className="font-semibold text-[var(--ink)]">{listing.leader_name}</span>.
              The leader will review your schedule and confirm availability.
            </p>
            <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Start Date:</span>
                <span className="font-bold text-[var(--ink)]">{startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Crew Size & Duration:</span>
                <span className="font-bold text-[var(--ink)]">
                  {listing.group_size} Workers &bull; {daysCount} Days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Total Amount:</span>
                <span className="font-black text-[var(--forest)] text-sm">₹{totalAmount}</span>
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
                Agricultural Labour Hire
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight mt-1.5 line-clamp-1">
                {listing.title}
              </h3>
              <p className="text-xs text-[var(--muted)] flex items-center gap-1.5 mt-0.5">
                <Users className="w-3.5 h-3.5 text-[var(--forest)] shrink-0" />
                <span>
                  Group of {listing.group_size} Workers &bull; Leader: {listing.leader_name}
                </span>
              </p>
            </div>

            {/* Rate Preview Pill */}
            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--ink)]">Group Daily Rate:</span>
              <div className="text-right">
                <span className="font-black text-sm text-[var(--ink)]">₹{listing.daily_rate}</span>{' '}
                <span className="text-[var(--muted)]">/ day (all {listing.group_size} workers)</span>
              </div>
            </div>

            {/* Date Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--forest)]" />
                Starting Date
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
                  This crew is already booked on this date. Please choose another date.
                </p>
              )}
            </div>

            {/* Days Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--forest)]" />
                Number of Working Days
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={daysCount}
                  onChange={(e) => setDaysCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-28 text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                />
                <span className="text-xs text-[var(--muted)]">
                  Total Estimate: <strong className="text-[var(--ink)] text-sm">₹{totalAmount}</strong>
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Field Location & Tasks (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., 5 acres wheat harvesting and bundle stacking required. Drinking water and shade provided."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] resize-none"
              />
            </div>

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
                Send Booking Request
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
