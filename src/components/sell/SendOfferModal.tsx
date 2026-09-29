import React, { useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreateProduceOffer } from '@/lib/api/sellStorage'
import { useAuth } from '@/context/AuthContext'
import type { ProduceListingItem } from '@/lib/data/seedSellStorage'

interface SendOfferModalProps {
  isOpen: boolean
  onClose: () => void
  listing: ProduceListingItem | null
}

export const SendOfferModal: React.FC<SendOfferModalProps> = ({ isOpen, onClose, listing }) => {
  const { user, profile } = useAuth()
  const createOffer = useCreateProduceOffer()

  const [offerPrice, setOfferPrice] = useState(listing ? listing.ask_price_per_quintal - 50 : 2350)
  const [qty, setQty] = useState(listing ? listing.qty_quintals : 50)
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen || !listing) return null

  const totalOfferAmount = offerPrice * qty

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    await createOffer.mutateAsync({
      listing_id: listing.id,
      buyer_id: user.id,
      buyer_name: profile?.full_name || 'Buyer / Aggregator',
      buyer_phone: user.phone || profile?.phone || '+91 98120 00000',
      offer_price: offerPrice,
      qty,
      notes: notes.trim() || 'Prompt pickup and electronic payment on delivery.',
    })
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]">
      <div className="relative w-full max-w-md rounded-2xl bg-[var(--bg-page)] border border-[var(--line)] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-150 space-y-5">
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
            <h3 className="text-xl font-bold text-[var(--ink)]">Purchase Offer Sent!</h3>
            <p className="text-xs text-[var(--muted)] max-w-xs mx-auto">
              Your offer of ₹{offerPrice}/Q for {qty} Quintals has been transmitted to farmer{' '}
              <strong className="text-[var(--ink)]">{listing.farmer_name}</strong>.
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
                B2B Purchase Negotiation
              </span>
              <h3 className="text-xl font-black text-[var(--ink)] tracking-tight mt-1.5 line-clamp-1">
                Make an Offer: {listing.crop_name}
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Seller: {listing.farmer_name} &bull; Asking: ₹{listing.ask_price_per_quintal}/Q
              </p>
            </div>

            {/* Offer Price Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center justify-between">
                <span>Your Offer Price (₹/Quintal)</span>
                <span className="text-[11px] text-[var(--muted)]">Ask: ₹{listing.ask_price_per_quintal}</span>
              </label>
              <input
                type="number"
                min="100"
                value={offerPrice}
                onChange={(e) => setOfferPrice(parseInt(e.target.value) || 0)}
                className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] font-bold text-sm"
              />
            </div>

            {/* Quantity Wanted */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center justify-between">
                <span>Quantity Desired (Quintals)</span>
                <span className="text-[11px] text-[var(--muted)]">Available: {listing.qty_quintals} Q</span>
              </label>
              <input
                type="number"
                min="1"
                max={listing.qty_quintals}
                value={qty}
                onChange={(e) => setQty(Math.min(listing.qty_quintals, parseInt(e.target.value) || 1))}
                className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
              />
            </div>

            {/* Calculated Total Box */}
            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">Total Deal Value:</span>
              <span className="text-base font-black text-[var(--forest)]">
                ₹{totalOfferAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Notes / Logistics */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Payment & Pickup Logistics Terms
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Pickup via our truck on Thursday; RTGS transfer upon weighbridge certificate..."
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
                disabled={createOffer.isPending || offerPrice <= 0}
                loading={createOffer.isPending}
              >
                Submit Purchase Offer
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
