import React, { useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreateProduceListing } from '@/lib/api/sellStorage'
import { useAuth } from '@/context/AuthContext'

interface ListProduceModalProps {
  isOpen: boolean
  onClose: () => void
}

const SAMPLE_PRODUCE_PHOTOS = [
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&w=800&q=80',
]

export const ListProduceModal: React.FC<ListProduceModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, farm } = useAuth()
  const createListing = useCreateProduceListing()

  const [cropName, setCropName] = useState('Wheat HD-3086 (Sharbati Quality)')
  const [qty, setQty] = useState(50)
  const [askPrice, setAskPrice] = useState(2400)
  const [district, setDistrict] = useState(farm?.district || 'Hisar')
  const [qualityGrade, setQualityGrade] = useState('Grade A1 (Machine Cleaned)')
  const [moisture, setMoisture] = useState(11.5)
  const [description, setDescription] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_PRODUCE_PHOTOS[0])
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !cropName.trim()) return

    await createListing.mutateAsync({
      farmer_id: user.id,
      farmer_name: profile?.full_name || 'Farmer Seller',
      farmer_phone: user.phone || profile?.phone || '+91 98765 00000',
      crop_name: cropName.trim(),
      qty_quintals: qty,
      ask_price_per_quintal: askPrice,
      district,
      quality_grade: qualityGrade,
      moisture_pct: moisture,
      photos: [selectedPhoto],
      description: description.trim() || 'Harvested produce in dry storage ready for immediate pickup.',
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
            <h3 className="text-2xl font-black text-[var(--ink)]">Produce Lot Published!</h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
              Your produce lot ({qty} Quintals of {cropName}) is now live. Millers, traders, and bulk buyers across the district can send purchase offers.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSubmitted(false)
                onClose()
              }}
            >
              Done & View Produce Lots
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--forest)] px-2.5 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--line)]">
                Direct Farmer Sales
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight mt-1.5">
                List Harvested Produce for Sale
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Sell directly to verified buyers, millers, and institutional aggregators without middlemen commission.
              </p>
            </div>

            {/* Crop Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Crop & Variety Title
              </label>
              <input
                type="text"
                required
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Wheat PBW-550 / Mustard 45S46"
                className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
              />
            </div>

            {/* Qty & Ask Price */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Available Quantity (Quintals)
                </label>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                  className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Expected Price (₹/Quintal)
                </label>
                <input
                  type="number"
                  min="100"
                  value={askPrice}
                  onChange={(e) => setAskPrice(parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                />
              </div>
            </div>

            {/* District & Grade */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Mandi District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                >
                  <option value="Hisar">Hisar</option>
                  <option value="Karnal">Karnal</option>
                  <option value="Ludhiana">Ludhiana</option>
                  <option value="Sirsa">Sirsa</option>
                  <option value="Bathinda">Bathinda</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Quality Grade
                </label>
                <input
                  type="text"
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                />
              </div>
            </div>

            {/* Moisture % */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Moisture Percentage (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={moisture}
                onChange={(e) => setMoisture(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
              />
            </div>

            {/* Photo Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Grain / Produce Photo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_PRODUCE_PHOTOS.map((img, i) => (
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
                    <img src={img} alt="grain" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Description & Pickup Logistics
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention storage condition (bagged / loose), farm pickup location, or road access..."
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
                disabled={createListing.isPending || !cropName.trim()}
                loading={createListing.isPending}
              >
                Publish Produce Lot
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
