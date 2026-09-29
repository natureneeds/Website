import React, { useState } from 'react'
import { LayoutShell } from '@/components/ui/LayoutShell'
import { Button } from '@/components/ui/Button'
import { MandiPricesTable } from '@/components/sell/MandiPricesTable'
import { ListProduceModal } from '@/components/sell/ListProduceModal'
import { SendOfferModal } from '@/components/sell/SendOfferModal'
import { ProduceOffersModal } from '@/components/sell/ProduceOffersModal'
import { useProduceListings } from '@/lib/api/sellStorage'
import { useAuth } from '@/context/AuthContext'
import type { ProduceListingItem } from '@/lib/data/seedSellStorage'
import {
  TrendingUp,
  Package,
  PlusCircle,
  Warehouse,
  ArrowRight,
  MapPin,
  Sparkles,
  ShoppingBag,
  Clock,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export const SellPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'mandi' | 'listings'>('mandi')
  const [districtFilter, setDistrictFilter] = useState('all')

  const { data: listings = [], isLoading: isLoadingListings } = useProduceListings(
    districtFilter === 'all' ? undefined : districtFilter
  )

  const [isListModalOpen, setIsListModalOpen] = useState(false)
  const [offerListing, setOfferListing] = useState<ProduceListingItem | null>(null)
  const [viewOffersListing, setViewOffersListing] = useState<ProduceListingItem | null>(null)

  const districts = ['all', 'Hisar', 'Karnal', 'Sirsa', 'Ludhiana']

  return (
    <LayoutShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Hero Section */}
        <div className="p-6 sm:p-10 rounded-3xl bg-[var(--surface)] border border-[var(--line)] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-xs font-bold uppercase tracking-wider text-[var(--forest)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--forest)]" />
                Mandi Intelligence & Direct Trading
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-[var(--ink)] tracking-tight">
                Mandi Prices & Direct Produce Sales
              </h1>
              <p className="text-xs sm:text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
                Track live APMC modal prices, analyze 30-day price trajectories with AI sell-timing hints, and post crop lots directly to verified grain aggregators and millers with zero middlemen fee.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                onClick={() => setIsListModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List Produce for Sale</span>
              </Button>

              <Link to="/storage">
                <Button
                  variant="secondary"
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold"
                >
                  <Warehouse className="w-4 h-4 text-[var(--forest)]" />
                  <span>Reserve Storage / Silo</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex border-b border-[var(--line)] gap-2 pt-2">
            <button
              onClick={() => setActiveTab('mandi')}
              className={`pb-3 px-4 text-xs font-bold tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'mandi'
                  ? 'border-[var(--forest)] text-[var(--forest)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Live Mandi Prices & 30-Day Trends</span>
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`pb-3 px-4 text-xs font-bold tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'listings'
                  ? 'border-[var(--forest)] text-[var(--forest)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Active Farmer Listings ({listings.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Live Mandi Prices */}
        {activeTab === 'mandi' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <MandiPricesTable />

            {/* Hint to Storage if waiting for better rates */}
            <div className="p-6 rounded-2xl bg-[var(--ink)] border border-[var(--line)] text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lime)]">
                  Price Protection Strategy
                </span>
                <h3 className="text-lg font-bold">Rates trending up next month? Don't sell in distress.</h3>
                <p className="text-xs text-white/70 max-w-xl">
                  Store your grains safely in e-NWR accredited silos and state cold warehouses. Get up to 75% bank pledge loans while waiting for peak market rates.
                </p>
              </div>
              <Link to="/storage" className="shrink-0 w-full md:w-auto">
                <Button
                  variant="primary"
                  className="w-full md:w-auto flex items-center justify-center gap-2"
                >
                  <span>Explore Storage Hubs</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Tab 2: Direct Produce Listings */}
        {activeTab === 'listings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter and CTA header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--ink)]">Filter District:</span>
                <div className="flex flex-wrap gap-1.5">
                  {districts.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDistrictFilter(d)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize cursor-pointer transition-all ${
                        districtFilter === d
                          ? 'bg-[var(--forest)] text-white shadow-sm'
                          : 'bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--ink)]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => setIsListModalOpen(true)}
                className="flex items-center gap-1.5 text-xs py-2"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Post New Lot</span>
              </Button>
            </div>

            {/* Listings Grid */}
            {isLoadingListings ? (
              <div className="py-16 text-center text-xs text-[var(--muted)]">
                Loading produce listings...
              </div>
            ) : listings.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
                <Package className="w-12 h-12 text-[var(--muted)] mx-auto" />
                <h3 className="text-base font-bold text-[var(--ink)]">No Produce Listed in this District</h3>
                <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                  Be the first farmer to list your crop harvest here to receive instant purchase offers from millers.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setIsListModalOpen(true)}
                  className="mt-2 text-xs"
                >
                  List Your Produce
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((item, idx) => {
                  const isDark = idx % 2 === 1
                  const isMyListing = item.farmer_id === user?.id || item.farmer_id === 'mock_farmer_hisar'

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                        isDark
                          ? 'bg-[var(--ink)] border-[var(--line)] text-white'
                          : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink)]'
                      }`}
                    >
                      <div>
                        {/* Photo Banner */}
                        {item.photos && item.photos.length > 0 && (
                          <div className="relative h-44 w-full overflow-hidden bg-black/10">
                            <img
                              src={item.photos[0]}
                              alt={item.crop_name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                  item.status === 'sold'
                                    ? 'bg-[var(--danger)] text-white'
                                    : 'bg-[var(--forest)] text-[var(--lime)]'
                                }`}
                              >
                                {item.status === 'sold' ? 'Sold' : 'Active Lot'}
                              </span>
                            </div>
                            <div className="absolute top-3 right-3">
                              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[var(--lime)]" />
                                {item.district}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="p-5 space-y-3">
                          <div>
                            <h3 className="text-base font-bold line-clamp-1">{item.crop_name}</h3>
                            <p className={`text-xs mt-0.5 ${isDark ? 'text-white/60' : 'text-[var(--muted)]'}`}>
                              By {item.farmer_name} &bull; {item.farmer_phone}
                            </p>
                          </div>

                          <div className={`p-3 rounded-xl border ${isDark ? 'bg-black/30 border-white/10' : 'bg-[var(--bg-page)] border-[var(--line)]'} grid grid-cols-2 gap-2 text-xs`}>
                            <div>
                              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-white/60' : 'text-[var(--muted)]'}`}>
                                Lot Quantity
                              </span>
                              <div className="font-mono font-bold text-sm">
                                {item.qty_quintals} Quintals
                              </div>
                            </div>
                            <div>
                              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-white/60' : 'text-[var(--muted)]'}`}>
                                Asking Price
                              </span>
                              <div className="font-mono font-bold text-sm text-[var(--lime)]">
                                ₹{item.ask_price_per_quintal}/Q
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className={isDark ? 'text-white/60' : 'text-[var(--muted)]'}>Grade Quality:</span>
                              <span className="font-medium">{item.quality_grade}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isDark ? 'text-white/60' : 'text-[var(--muted)]'}>Moisture Level:</span>
                              <span className="font-medium">{item.moisture_pct}%</span>
                            </div>
                          </div>

                          {item.description && (
                            <p className={`text-xs line-clamp-2 italic ${isDark ? 'text-white/70' : 'text-[var(--muted)]'}`}>
                              "{item.description}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-[var(--line)]'} flex items-center justify-between gap-2`}>
                        {isMyListing ? (
                          <Button
                            variant={isDark ? 'primary' : 'secondary'}
                            onClick={() => setViewOffersListing(item)}
                            className="w-full flex items-center justify-center gap-1.5 text-xs py-2"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Manage / View Offers</span>
                          </Button>
                        ) : (
                          <Button
                            variant={isDark ? 'primary' : 'secondary'}
                            disabled={item.status === 'sold'}
                            onClick={() => setOfferListing(item)}
                            className="w-full flex items-center justify-center gap-1.5 text-xs py-2"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{item.status === 'sold' ? 'Sold Out' : 'Submit Buy Offer'}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <ListProduceModal
          isOpen={isListModalOpen}
          onClose={() => setIsListModalOpen(false)}
        />

        <SendOfferModal
          isOpen={Boolean(offerListing)}
          onClose={() => setOfferListing(null)}
          listing={offerListing}
        />

        <ProduceOffersModal
          isOpen={Boolean(viewOffersListing)}
          onClose={() => setViewOffersListing(null)}
          listing={viewOffersListing}
        />
      </div>
    </LayoutShell>
  )
}
export default SellPage
