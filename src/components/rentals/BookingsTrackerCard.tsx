import React, { useState } from 'react'
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Star,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  useRentalBookings,
  useUpdateRentalBookingStatus,
  useLabourBookings,
  useUpdateLabourBookingStatus,
} from '@/lib/api/rentals'
import { useAuth } from '@/context/AuthContext'
import { BookingChatModal } from './BookingChatModal'
import { ReviewModal } from './ReviewModal'
import type { RentalBooking, LabourBooking } from '@/lib/supabase/types'

export const BookingsTrackerCard: React.FC = () => {
  const { user } = useAuth()
  const { data: rentalBookings = [] } = useRentalBookings(user?.id)
  const { data: labourBookings = [] } = useLabourBookings(user?.id)

  const updateRentalStatus = useUpdateRentalBookingStatus()
  const updateLabourStatus = useUpdateLabourBookingStatus()

  const [activeCategory, setActiveCategory] = useState<'rentals' | 'labour'>('rentals')
  const [chatTarget, setChatTarget] = useState<{
    id: string
    type: 'rental' | 'labour'
    title: string
    counterparty: string
    status: string
  } | null>(null)
  const [reviewTarget, setReviewTarget] = useState<{
    bookingId: string
    type: 'rental' | 'labour'
    listingId: string
    title: string
  } | null>(null)

  const handleRentalAction = async (bookingId: string, status: RentalBooking['status']) => {
    await updateRentalStatus.mutateAsync({ bookingId, status })
  }

  const handleLabourAction = async (bookingId: string, status: LabourBooking['status']) => {
    await updateLabourStatus.mutateAsync({ bookingId, status })
  }

  const currentBookings = activeCategory === 'rentals' ? rentalBookings : labourBookings

  return (
    <div className="space-y-6">
      {/* Tracker Card Header */}
      <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-xs font-bold uppercase tracking-wider text-[var(--forest)] mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Live Status & Coordination Hub
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
            My Hire & Labour Bookings
          </h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Accept/decline requests, coordinate delivery via in-app chat threads, and submit post-completion ratings.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[var(--surface-alt)] p-1 rounded-xl border border-[var(--line)]">
          <button
            onClick={() => setActiveCategory('rentals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'rentals'
                ? 'bg-[var(--lime)] text-[var(--ink)] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            Machinery ({rentalBookings.length})
          </button>
          <button
            onClick={() => setActiveCategory('labour')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'labour'
                ? 'bg-[var(--lime)] text-[var(--ink)] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            Labour Crews ({labourBookings.length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {currentBookings.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] text-sm space-y-2">
            <Calendar className="w-8 h-8 text-[var(--line)] mx-auto" />
            <p className="font-semibold text-[var(--ink)]">No bookings found</p>
            <p className="text-xs">
              Browse available equipment or labour crews to submit your first hire request.
            </p>
          </div>
        ) : (
          currentBookings.map((b: any) => {
            const isRental = activeCategory === 'rentals'
            const isOwnerOrLeader = isRental
              ? b.owner_id === user?.id
              : b.leader_id === user?.id

            const title = b.listing?.title || (isRental ? 'Equipment' : 'Labour Crew')
            const counterparty = isOwnerOrLeader
              ? (isRental ? b.renter_name : b.farmer_name)
              : (isRental ? b.listing?.owner_name || 'Owner' : b.listing?.leader_name || 'Leader')

            const getStatusBadge = (status: string) => {
              switch (status) {
                case 'confirmed':
                  return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--forest)] text-[var(--white)] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirmed
                    </span>
                  )
                case 'requested':
                  return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--warning)] text-[var(--ink)] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Awaiting Acceptance
                    </span>
                  )
                case 'completed':
                  return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--lime)] text-[var(--ink)] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )
                case 'declined':
                  return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--danger)] text-[var(--white)] flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Declined
                    </span>
                  )
                default:
                  return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--surface-alt)] text-[var(--ink)] capitalize">
                      {status}
                    </span>
                  )
              }
            }

            return (
              <div
                key={b.id}
                className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--forest)] transition-all space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {getStatusBadge(b.status)}
                      <span className="text-xs text-[var(--muted)]">
                        Booking #{b.id.slice(-6).toUpperCase()}
                      </span>
                      {isOwnerOrLeader && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--ink)] text-[var(--white)]">
                          Incoming Request
                        </span>
                      )}
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-[var(--ink)] leading-snug">
                      {title}
                    </h4>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-[var(--forest)]">
                      ₹{isRental ? b.total_price : b.total_amount}
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {isRental ? `${b.hours_or_days} unit(s)` : `${b.days_count} day(s)`} &bull; {b.start_date}
                    </div>
                  </div>
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] block">
                      {isOwnerOrLeader ? 'Client Farmer' : 'Owner / Provider'}
                    </span>
                    <span className="font-bold text-[var(--ink)]">{counterparty}</span>
                    <div className="text-[11px] text-[var(--muted)]">
                      {isOwnerOrLeader ? (isRental ? b.renter_phone : b.farmer_phone) : 'Verified Partner'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] block">
                      Scheduled Date
                    </span>
                    <span className="font-bold text-[var(--ink)]">{b.start_date}</span>
                    <div className="text-[11px] text-[var(--muted)]">
                      {isRental ? 'Hourly / Daily Field Slot' : `${b.listing?.group_size || 8} Workers Assigned`}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] space-y-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] block">
                      Notes / Location
                    </span>
                    <span className="text-[var(--ink)] line-clamp-2">
                      {b.notes || 'Direct on-site coordination'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {/* Chat Trigger */}
                    <button
                      onClick={() =>
                        setChatTarget({
                          id: b.id,
                          type: activeCategory === 'rentals' ? 'rental' : 'labour',
                          title,
                          counterparty,
                          status: b.status,
                        })
                      }
                      className="px-3.5 py-1.5 rounded-full border border-[var(--line)] bg-[var(--bg-page)] text-xs font-bold text-[var(--ink)] hover:bg-[var(--surface-alt)] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[var(--forest)]" />
                      Open Chat Thread
                    </button>

                    {/* Rate & Review (If completed) */}
                    {b.status === 'completed' && !isOwnerOrLeader && (
                      <button
                        onClick={() =>
                          setReviewTarget({
                            bookingId: b.id,
                            type: activeCategory === 'rentals' ? 'rental' : 'labour',
                            listingId: b.listing_id,
                            title,
                          })
                        }
                        className="px-3.5 py-1.5 rounded-full bg-[var(--lime)] text-xs font-bold text-[var(--ink)] hover:bg-[var(--lime-strong)] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Star className="w-3.5 h-3.5 fill-[var(--ink)] text-[var(--ink)]" />
                        Rate & Review
                      </button>
                    )}
                  </div>

                  {/* Owner/Leader Accept & Decline Actions */}
                  {isOwnerOrLeader && b.status === 'requested' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          isRental
                            ? handleRentalAction(b.id, 'declined')
                            : handleLabourAction(b.id, 'declined')
                        }
                        className="text-xs font-bold text-[var(--danger)] cursor-pointer"
                      >
                        Decline
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          isRental
                            ? handleRentalAction(b.id, 'confirmed')
                            : handleLabourAction(b.id, 'confirmed')
                        }
                        className="text-xs font-bold cursor-pointer"
                      >
                        Accept Request
                      </Button>
                    </div>
                  )}

                  {/* Owner mark complete */}
                  {isOwnerOrLeader && b.status === 'confirmed' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        isRental
                          ? handleRentalAction(b.id, 'completed')
                          : handleLabourAction(b.id, 'completed')
                      }
                      className="text-xs font-bold cursor-pointer"
                    >
                      Mark Completed
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Chat Thread Modal */}
      {chatTarget && (
        <BookingChatModal
          isOpen={Boolean(chatTarget)}
          onClose={() => setChatTarget(null)}
          bookingId={chatTarget.id}
          bookingType={chatTarget.type}
          title={chatTarget.title}
          counterpartyName={chatTarget.counterparty}
          status={chatTarget.status}
        />
      )}

      {/* Review Modal */}
      {reviewTarget && (
        <ReviewModal
          isOpen={Boolean(reviewTarget)}
          onClose={() => setReviewTarget(null)}
          bookingId={reviewTarget.bookingId}
          bookingType={reviewTarget.type}
          listingId={reviewTarget.listingId}
          title={reviewTarget.title}
        />
      )}
    </div>
  )
}
