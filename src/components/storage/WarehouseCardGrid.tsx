import React, { useState } from 'react'
import { Warehouse, Check, MapPin, ShieldCheck, ArrowRight, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useWarehouses, useWarehouseBookings } from '@/lib/api/sellStorage'
import { useAuth } from '@/context/AuthContext'
import { WarehouseBookingModal } from './WarehouseBookingModal'
import type { WarehouseItem } from '@/lib/data/seedSellStorage'

interface WarehouseCardGridProps {
  selectedDistrict: string
}

export const WarehouseCardGrid: React.FC<WarehouseCardGridProps> = ({ selectedDistrict }) => {
  const { user } = useAuth()
  const { data: warehouses = [], isLoading } = useWarehouses(selectedDistrict)
  const { data: bookings = [] } = useWarehouseBookings(user?.id)

  const [activeWarehouse, setActiveWarehouse] = useState<WarehouseItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenBooking = (wh: WarehouseItem) => {
    setActiveWarehouse(wh)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8">
      {/* Existing Bookings Tracker if user has any */}
      {bookings.length > 0 && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[var(--surface-alt)] text-[var(--forest)] border border-[var(--line)]">
                <Warehouse className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-[var(--ink)]">Your Active Storage Reservations</h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--lime)] text-[var(--forest-dark)] font-bold">
              {bookings.length} Registered
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((b: any) => (
              <div
                key={b.id}
                className="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--line)] flex flex-col justify-between text-xs space-y-2"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-[var(--ink)] text-sm">{b.crop_name}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold capitalize bg-[var(--surface-alt)] text-[var(--forest)] border border-[var(--line)]">
                      {b.status}
                    </span>
                  </div>
                  <p className="text-[var(--muted)] text-[11px] mt-0.5">
                    Quantity: <span className="font-medium text-[var(--ink)]">{b.qty_quintals} Quintals</span> &bull; {b.months_count} Months
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">
                    Inward Date: {b.start_date}
                  </p>
                </div>
                <div className="pt-2 border-t border-[var(--line)] flex justify-between items-center text-xs">
                  <span className="text-[var(--muted)]">Total Storage Rent:</span>
                  <span className="font-mono font-bold text-[var(--forest)]">₹{b.total_cost.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warehouse Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-[var(--muted)]">
          Loading warehouses and cold storage hubs...
        </div>
      ) : warehouses.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
          <Warehouse className="w-12 h-12 text-[var(--muted)] mx-auto mb-3" />
          <h4 className="text-base font-bold text-[var(--ink)]">No Warehouses Found</h4>
          <p className="text-xs text-[var(--muted)] mt-1">
            Try switching to "All Districts" to view facilities across the state.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {warehouses.map((wh, idx) => {
            const isDark = idx % 2 === 1
            const capacityPct = Math.round(((wh.total_capacity_mt - wh.available_capacity_mt) / wh.total_capacity_mt) * 100)

            return (
              <div
                key={wh.id}
                className={`p-6 sm:p-7 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isDark
                    ? 'bg-[var(--ink)] border-[var(--line)] text-white'
                    : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink)]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isDark
                              ? 'bg-[var(--forest-dark)] text-[var(--lime)] border border-[var(--lime)]/30'
                              : 'bg-[var(--surface-alt)] text-[var(--forest)] border border-[var(--line)]'
                          }`}
                        >
                          {wh.type === 'cold_storage'
                            ? 'Cold Storage'
                            : wh.type === 'grain_silo'
                            ? 'Steel Silo'
                            : 'Dry Warehouse'}
                        </span>
                        <span className={`text-[11px] flex items-center gap-1 ${isDark ? 'text-white/60' : 'text-[var(--muted)]'}`}>
                          <MapPin className="w-3.5 h-3.5" />
                          {wh.district}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold mt-1.5 leading-snug">
                        {wh.name}
                      </h3>
                      <p className={`text-xs mt-0.5 line-clamp-1 ${isDark ? 'text-white/70' : 'text-[var(--muted)]'}`}>
                        {wh.address}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-xl sm:text-2xl font-black text-[var(--lime)]">
                        ₹{wh.price_per_quintal_month}
                      </div>
                      <div className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-white/60' : 'text-[var(--muted)]'}`}>
                        / quintal / month
                      </div>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-black/40 border-white/10' : 'bg-[var(--bg-page)] border-[var(--line)]'}`}>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className={isDark ? 'text-white/80' : 'text-[var(--muted)]'}>
                        Capacity Utilisation:
                      </span>
                      <span className="font-mono font-bold text-xs">
                        {wh.available_capacity_mt.toLocaleString('en-IN')} MT Available ({100 - capacityPct}% Free)
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-[var(--surface-alt)]'}`}>
                      <div
                        className="h-full bg-[var(--lime)] transition-all duration-300"
                        style={{ width: `${capacityPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Amenities / Accreditation */}
                  <div className="space-y-1.5 pt-1">
                    <div className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-white/70' : 'text-[var(--forest)]'}`}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Accreditations & Amenities
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                      {wh.amenities.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Check className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[var(--lime)]' : 'text-[var(--forest)]'}`} />
                          <span className={`text-[11px] truncate ${isDark ? 'text-white/80' : 'text-[var(--ink)]'}`}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-[var(--line)]">
                  <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-white/70' : 'text-[var(--muted)]'}`}>
                    <Phone className="w-3.5 h-3.5" />
                    <span>{wh.contact_phone}</span>
                  </div>

                  <div className="w-full sm:w-auto">
                    <Button
                      variant={isDark ? 'primary' : 'secondary'}
                      onClick={() => handleOpenBooking(wh)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5"
                    >
                      <span>Book Space</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Booking Modal */}
      <WarehouseBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        warehouse={activeWarehouse}
      />
    </div>
  )
}
