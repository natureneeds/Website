import React, { useState } from 'react'
import {
  Users,
  Calendar,
  MapPin,
  Star,
  PlusCircle,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { LayoutShell } from '@/components/ui/LayoutShell'
import { Button } from '@/components/ui/Button'
import { useLabourListings } from '@/lib/api/rentals'
import { LabourBookingModal } from '@/components/rentals/LabourBookingModal'
import { ListLabourModal } from '@/components/rentals/ListLabourModal'
import { BookingsTrackerCard } from '@/components/rentals/BookingsTrackerCard'
import type { LabourListing } from '@/lib/supabase/types'

export const LabourPage: React.FC = () => {
  const [districtFilter, setDistrictFilter] = useState('all')
  const [skillFilter, setSkillFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'browse' | 'bookings'>('browse')

  const [bookingModalListing, setBookingModalListing] = useState<LabourListing | null>(null)
  const [isListModalOpen, setIsListModalOpen] = useState(false)

  const { data: listings = [], isLoading } = useLabourListings({
    district: districtFilter,
    skill: skillFilter,
    date: dateFilter,
  })

  const skillOptions = [
    { id: 'all', label: 'All Work Skills' },
    { id: 'Harvesting', label: 'Harvesting & Threshing' },
    { id: 'Transplanting', label: 'Paddy Transplanting' },
    { id: 'Spraying', label: 'Foliar Spraying' },
    { id: 'Weeding', label: 'Manual Weeding' },
    { id: 'Cotton', label: 'Cotton Picking' },
  ]

  const districts = ['all', 'Hisar', 'Ludhiana', 'Karnal', 'Bathinda', 'Rohtak']

  return (
    <LayoutShell>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Hero Header */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-xs font-bold uppercase tracking-wider text-[var(--forest)]">
              <Users className="w-3.5 h-3.5" />
              Skilled Farm Labour Crews &bull; Phase 10
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--ink)] tracking-tight">
              Agricultural Labour Groups
            </h1>
            <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
              Book verified agricultural labour groups for harvesting, transplanting, weeding, and foliar spraying with fixed transparent daily rates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
            <Button
              variant="secondary"
              onClick={() => setIsListModalOpen(true)}
              className="cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 mr-1.5 text-[var(--forest)]" />
              List Labour Group
            </Button>
            <Button
              variant={activeTab === 'bookings' ? 'accent' : 'primary'}
              onClick={() => setActiveTab(activeTab === 'browse' ? 'bookings' : 'browse')}
              className="cursor-pointer"
            >
              <Clock className="w-4 h-4 mr-1.5 text-[var(--ink)]" />
              {activeTab === 'browse' ? 'My Bookings & Requests' : 'Browse Labour Groups'}
            </Button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        {activeTab === 'bookings' ? (
          <BookingsTrackerCard />
        ) : (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* District Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-[var(--muted)] shrink-0">
                    District:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {districts.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDistrictFilter(d)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          districtFilter === d
                            ? 'bg-[var(--forest)] text-[var(--white)]'
                            : 'bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
                        }`}
                      >
                        {d === 'all' ? 'All Districts' : d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-[var(--muted)] shrink-0 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[var(--forest)]" />
                    Available On:
                  </span>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                  />
                  {dateFilter && (
                    <button
                      onClick={() => setDateFilter('')}
                      className="text-xs text-[var(--muted)] hover:underline font-semibold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Skill Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-[var(--line)]">
                {skillOptions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSkillFilter(s.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      skillFilter === s.id
                        ? 'bg-[var(--lime)] text-[var(--ink)] shadow-xs'
                        : 'bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Labour Grid */}
            {isLoading ? (
              <div className="p-8 text-center rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--lime)] border-t-transparent animate-spin mx-auto mb-2" />
                <p className="text-xs text-[var(--muted)]">Loading labour groups...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] space-y-2">
                <Users className="w-10 h-10 text-[var(--line)] mx-auto" />
                <p className="text-base font-bold text-[var(--ink)]">No labour groups match your filter</p>
                <p className="text-xs">
                  Try adjusting the district or skill filter, or register your labour group.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((item, idx) => {
                  const isCreamCard = idx % 2 === 0
                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border border-[var(--line)] overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 shadow-sm ${
                        isCreamCard
                          ? 'bg-[var(--surface)] text-[var(--ink)]'
                          : 'bg-[var(--ink)] text-[var(--white)]'
                      }`}
                    >
                      {/* Photo & Badges */}
                      <div className="relative aspect-[16/10] bg-[var(--surface-alt)] overflow-hidden">
                        <img
                          src={item.photos[0]}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--lime)] text-[var(--ink)] shadow-xs flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {item.group_size} Workers
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--bg-page)]/90 backdrop-blur-sm text-[var(--ink)] flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-[var(--warning)] text-[var(--warning)]" />
                          <span>{item.rating}</span>
                          <span className="text-[10px] text-[var(--muted)]">({item.review_count})</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                            <MapPin className="w-3.5 h-3.5 text-[var(--forest)] shrink-0" />
                            <span className="truncate">{item.district} District &bull; {item.area_served}</span>
                          </div>

                          <h3
                            className={`text-base sm:text-lg font-black leading-snug ${
                              isCreamCard ? 'text-[var(--ink)]' : 'text-[var(--white)]'
                            }`}
                          >
                            {item.title}
                          </h3>

                          {item.description && (
                            <p
                              className={`text-xs line-clamp-2 leading-relaxed ${
                                isCreamCard ? 'text-[var(--ink)]/80' : 'text-[var(--white)]/80'
                              }`}
                            >
                              {item.description}
                            </p>
                          )}

                          {/* Skills Chips */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {item.skills.slice(0, 3).map((sk) => (
                              <span
                                key={sk}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                  isCreamCard
                                    ? 'bg-[var(--surface-alt)] border-[var(--line)] text-[var(--forest)]'
                                    : 'bg-[var(--surface-alt)]/10 border-[var(--line)]/20 text-[var(--lime)]'
                                }`}
                              >
                                {sk}
                              </span>
                            ))}
                            {item.skills.length > 3 && (
                              <span className="text-[10px] text-[var(--muted)]">
                                +{item.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Leader Card Pill */}
                        <div
                          className={`p-3 rounded-xl border text-xs space-y-1 ${
                            isCreamCard
                              ? 'bg-[var(--surface-alt)] border-[var(--line)]'
                              : 'bg-[var(--surface-alt)]/10 border-[var(--line)]/20'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-[var(--muted)]">
                              Leader / Mukadam
                            </span>
                            <span className="font-bold">{item.leader_name}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-[var(--muted)]">
                            <span>Availability:</span>
                            <span className="text-[var(--forest)] font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Ready for Field Work
                            </span>
                          </div>
                        </div>

                        {/* Price & Book Button */}
                        <div className="pt-3 border-t border-[var(--line)]/30 flex items-center justify-between">
                          <div>
                            <div className="text-xl font-black">
                              ₹{item.daily_rate}{' '}
                              <span className="text-xs font-normal text-[var(--muted)]">
                                / day ({item.group_size} workers)
                              </span>
                            </div>
                          </div>

                          <Button
                            variant={isCreamCard ? 'primary' : 'accent'}
                            size="sm"
                            onClick={() => setBookingModalListing(item)}
                            className="font-bold cursor-pointer"
                          >
                            Book Crew
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Labour Booking Modal */}
        <LabourBookingModal
          isOpen={Boolean(bookingModalListing)}
          onClose={() => setBookingModalListing(null)}
          listing={bookingModalListing}
        />

        {/* List Labour Modal */}
        <ListLabourModal
          isOpen={isListModalOpen}
          onClose={() => setIsListModalOpen(false)}
        />
      </main>
    </LayoutShell>
  )
}
