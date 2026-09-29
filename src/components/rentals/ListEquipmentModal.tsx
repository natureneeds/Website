import React, { useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreateRentalListing } from '@/lib/api/rentals'
import { useAuth } from '@/context/AuthContext'
import type { RentalListing } from '@/lib/supabase/types'

interface ListEquipmentModalProps {
  isOpen: boolean
  onClose: () => void
}

const SAMPLE_EQUIPMENT_PHOTOS = [
  'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
]

export const ListEquipmentModal: React.FC<ListEquipmentModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, farm } = useAuth()
  const createListing = useCreateRentalListing()

  const [title, setTitle] = useState('')
  const [type, setType] = useState<RentalListing['type']>('tractor')
  const [price, setPrice] = useState(600)
  const [priceUnit, setPriceUnit] = useState<RentalListing['price_unit']>('per_hour')
  const [district, setDistrict] = useState(farm?.district || 'Hisar')
  const [areaServed, setAreaServed] = useState(`${district} & nearby villages (25 km radius)`)
  const [description, setDescription] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_EQUIPMENT_PHOTOS[0])
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !user?.id) return

    await createListing.mutateAsync({
      owner_id: user.id,
      owner_name: profile?.full_name || 'Equipment Owner',
      owner_phone: user.phone || profile?.phone || '+91 98765 00000',
      type,
      title: title.trim(),
      description: description.trim() || 'Serviced and field-ready agricultural machinery.',
      price,
      price_unit: priceUnit,
      district,
      area_served: areaServed.trim(),
      images: [selectedPhoto],
      specs: {
        District: district,
        Operator: 'Included',
        Condition: 'Excellent',
      },
      availability: true,
      booked_dates: [],
    })
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--bg-page)] border border-[var(--line)] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-150">
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
            <h3 className="text-2xl font-black text-[var(--ink)]">Equipment Listed Successfully!</h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
              Your equipment is now live on the Kisan OS rental marketplace. Farmers in {district} can now view your availability and send booking requests.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSubmitted(false)
                onClose()
              }}
            >
              Done & View Listing
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--forest)] px-2.5 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--line)]">
                Equipment Owner Portal
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight mt-1.5">
                List Equipment for Rent
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Monetize your tractors, spray drones, and harvesters during idle periods.
              </p>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Equipment Model & Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sonalika DI 745 III 50HP with Cultivator"
                className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
              />
            </div>

            {/* Type & Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as RentalListing['type'])}
                  className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                >
                  <option value="tractor">Tractor</option>
                  <option value="drone">Drone Sprayer</option>
                  <option value="harvester">Combine Harvester</option>
                  <option value="power_tiller">Power Tiller</option>
                  <option value="rotavator">Rotavator</option>
                  <option value="laser_leveler">Laser Leveler</option>
                  <option value="planter">Seed Planter</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Hire Rate (₹)
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="w-24 text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                  />
                  <select
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value as RentalListing['price_unit'])}
                    className="flex-1 text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                  >
                    <option value="per_hour">/ hour</option>
                    <option value="per_acre">/ acre</option>
                    <option value="per_day">/ day</option>
                  </select>
                </div>
              </div>
            </div>

            {/* District & Area Served */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Base District
                </label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value)
                    setAreaServed(`${e.target.value} & nearby villages (25 km radius)`)
                  }}
                  className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                >
                  <option value="Hisar">Hisar</option>
                  <option value="Ludhiana">Ludhiana</option>
                  <option value="Karnal">Karnal</option>
                  <option value="Bathinda">Bathinda</option>
                  <option value="Rohtak">Rohtak</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Coverage Radius
                </label>
                <input
                  type="text"
                  value={areaServed}
                  onChange={(e) => setAreaServed(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                />
              </div>
            </div>

            {/* Photo Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Equipment Photo
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_EQUIPMENT_PHOTOS.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedPhoto(img)}
                    className={`aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedPhoto === img
                        ? 'border-[var(--lime)] ring-2 ring-[var(--lime)]'
                        : 'border-[var(--line)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="specimen" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Description & Operator Terms
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention condition, implements included, diesel responsibility, driver availability..."
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
                disabled={createListing.isPending || !title.trim()}
                loading={createListing.isPending}
              >
                Publish Listing
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
