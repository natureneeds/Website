import React, { useState } from 'react'
import { LayoutShell } from '@/components/ui/LayoutShell'
import { WarehouseCardGrid } from '@/components/storage/WarehouseCardGrid'
import { Warehouse, ShieldCheck, FileCheck, Coins, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export const StoragePage: React.FC = () => {
  const [districtFilter, setDistrictFilter] = useState('all')
  const districts = ['all', 'Hisar', 'Karnal', 'Ludhiana', 'Bathinda']

  return (
    <LayoutShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Hero Banner */}
        <div className="p-6 sm:p-10 rounded-3xl bg-[var(--surface)] border border-[var(--line)] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-xs font-bold uppercase tracking-wider text-[var(--forest)]">
                <Warehouse className="w-3.5 h-3.5 text-[var(--forest)]" />
                WDRA & e-NWR Certified Infrastructure
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-[var(--ink)] tracking-tight">
                Grains Silos & Cold Chain Storage
              </h1>
              <p className="text-xs sm:text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
                Protect your harvest from distress sales, pests, and moisture spoilage. Store wheat, paddy, mustard, and perishables in scientifically monitored warehouses with electronic warehouse receipts (e-NWR) eligible for bank pledge finance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/sell">
                <Button
                  variant="secondary"
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Mandi Prices</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Value Prop Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[var(--bg-page)] border border-[var(--line)] flex items-start gap-3">
              <span className="p-2 rounded-xl bg-[var(--surface)] text-[var(--forest)] shrink-0 border border-[var(--line)]">
                <FileCheck className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-[var(--ink)]">e-NWR Receipts</h4>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Instant negotiable electronic receipts directly in your DigiLocker/app.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-page)] border border-[var(--line)] flex items-start gap-3">
              <span className="p-2 rounded-xl bg-[var(--surface)] text-[var(--forest)] shrink-0 border border-[var(--line)]">
                <Coins className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-[var(--ink)]">Bank Pledge Loans</h4>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Borrow up to 75% market value against stored produce at 7% subsidized KCC rates.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-page)] border border-[var(--line)] flex items-start gap-3">
              <span className="p-2 rounded-xl bg-[var(--surface)] text-[var(--forest)] shrink-0 border border-[var(--line)]">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-[var(--ink)]">Zero Distress Selling</h4>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Hold inventory during post-harvest gluts and liquidate when prices rise.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* District Filter Bar */}
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

          <span className="text-xs text-[var(--muted)]">
            Showing facilities in <span className="font-semibold text-[var(--ink)] capitalize">{districtFilter}</span>
          </span>
        </div>

        {/* Warehouse Cards Grid */}
        <WarehouseCardGrid selectedDistrict={districtFilter === 'all' ? '' : districtFilter} />
      </div>
    </LayoutShell>
  )
}
export default StoragePage
