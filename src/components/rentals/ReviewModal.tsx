import React, { useState } from 'react'
import { Star, X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAddBookingReview } from '@/lib/api/rentals'
import { useAuth } from '@/context/AuthContext'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  bookingType: 'rental' | 'labour'
  listingId: string
  title: string
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  bookingType,
  listingId,
  title,
}) => {
  const { user, profile } = useAuth()
  const addReview = useAddBookingReview()
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    await addReview.mutateAsync({
      booking_id: bookingId,
      booking_type: bookingType,
      listing_id: listingId,
      reviewer_id: user.id,
      reviewer_name: profile?.full_name || 'Farmer',
      rating,
      comment: comment.trim(),
    })
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]">
      <div className="relative w-full max-w-md rounded-2xl bg-[var(--bg-page)] border border-[var(--line)] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--surface-alt)] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[var(--surface)] text-[var(--forest)] flex items-center justify-center mx-auto border border-[var(--line)]">
              <CheckCircle2 className="w-8 h-8 text-[var(--forest)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--ink)]">Review Published!</h3>
            <p className="text-xs text-[var(--muted)] max-w-xs mx-auto">
              Thank you for sharing your experience. Your feedback helps farmers across the district book reliable machinery & labour.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSubmitted(false)
                onClose()
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--forest)] px-2.5 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--line)]">
                Completed Work Feedback
              </span>
              <h3 className="text-xl font-black text-[var(--ink)] mt-2">Rate & Review</h3>
              <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-1">{title}</p>
            </div>

            {/* Star Selector */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-center space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] block">
                Overall Satisfaction
              </label>
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || rating)
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          isFilled
                            ? 'text-[var(--warning)] fill-[var(--warning)]'
                            : 'text-[var(--line)]'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
              <div className="text-xs font-semibold text-[var(--forest)]">
                {rating === 5 && 'Outstanding Performance & Punctuality'}
                {rating === 4 && 'Very Good Service'}
                {rating === 3 && 'Average'}
                {rating <= 2 && 'Needs Improvement'}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Detailed Feedback (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Mention operator skill, diesel consumption, punctuality, or equipment condition..."
                rows={3}
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
                disabled={addReview.isPending}
                loading={addReview.isPending}
              >
                Submit Review
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
