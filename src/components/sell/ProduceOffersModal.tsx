import React from 'react'
import { Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useProduceOffers, useUpdateProduceOfferStatus } from '@/lib/api/sellStorage'
import type { ProduceListingItem } from '@/lib/data/seedSellStorage'

interface ProduceOffersModalProps {
  isOpen: boolean
  onClose: () => void
  listing: ProduceListingItem | null
}

export const ProduceOffersModal: React.FC<ProduceOffersModalProps> = ({
  isOpen,
  onClose,
  listing,
}) => {
  const { data: offers = [] } = useProduceOffers(isOpen ? listing?.id : undefined)
  const updateOfferStatus = useUpdateProduceOfferStatus()

  if (!isOpen || !listing) return null

  const handleAccept = async (offerId: string) => {
    await updateOfferStatus.mutateAsync({ offerId, status: 'accepted' })
  }

  const handleDecline = async (offerId: string) => {
    await updateOfferStatus.mutateAsync({ offerId, status: 'declined' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--bg-page)] border border-[var(--line)] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-150 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--surface-alt)] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--forest)] px-2.5 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--line)]">
            Buyer Offer Negotiation
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight mt-1.5 line-clamp-1">
            Offers for {listing.crop_name}
          </h3>
          <p className="text-xs text-[var(--muted)]">
            Lot Size: {listing.qty_quintals} Quintals &bull; Asking: ₹{listing.ask_price_per_quintal}/Q
          </p>
        </div>

        <div className="space-y-3">
          {offers.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] text-xs">
              <Clock className="w-8 h-8 text-[var(--line)] mx-auto mb-2" />
              <p className="font-semibold text-[var(--ink)]">No buyer offers yet</p>
              <p className="text-[11px] mt-0.5">
                Local grain dealers, millers, and aggregators will send bids here once your listing is reviewed.
              </p>
            </div>
          ) : (
            offers.map((offer) => {
              const totalVal = offer.offer_price * offer.qty
              const isAccepted = offer.status === 'accepted'
              const isDeclined = offer.status === 'declined'

              return (
                <div
                  key={offer.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    isAccepted
                      ? 'border-[var(--forest)] bg-[var(--surface)] ring-1 ring-[var(--forest)]'
                      : isDeclined
                      ? 'border-[var(--line)] bg-[var(--surface-alt)] opacity-60'
                      : 'border-[var(--line)] bg-[var(--surface)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-sm text-[var(--ink)]">
                          {offer.buyer_name}
                        </span>
                        <span className="text-xs text-[var(--muted)]">({offer.buyer_phone})</span>
                        {isAccepted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[var(--forest)] text-[var(--white)]">
                            Accepted Deal
                          </span>
                        )}
                        {isDeclined && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[var(--danger)] text-[var(--white)]">
                            Declined
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        Offered: <strong className="text-base text-[var(--ink)] font-black">₹{offer.offer_price}</strong> / Quintal for {offer.qty} Quintals
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-[var(--forest)]">
                        ₹{totalVal.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-[var(--muted)]">
                        {new Date(offer.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {offer.notes && (
                    <p className="text-xs text-[var(--ink)]/80 bg-[var(--surface-alt)] p-2.5 rounded-lg border border-[var(--line)] leading-relaxed">
                      "{offer.notes}"
                    </p>
                  )}

                  {/* Actions */}
                  {offer.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--line)]">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDecline(offer.id)}
                        className="text-xs font-bold text-[var(--danger)] cursor-pointer"
                      >
                        Decline
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAccept(offer.id)}
                        className="text-xs font-bold cursor-pointer"
                      >
                        Accept Offer
                      </Button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
