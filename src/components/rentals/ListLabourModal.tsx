import React, { useState } from 'react'
import { Users, X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreateLabourListing } from '@/lib/api/rentals'
import { useAuth } from '@/context/AuthContext'

interface ListLabourModalProps {
  isOpen: boolean
  onClose: () => void
}

const SAMPLE_LABOUR_PHOTOS = [
  'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
]

const SKILL_OPTIONS = [
  'Manual Harvesting',
  'Paddy Transplanting',
  'Manual Weeding',
  'Foliar Spraying',
  'Cotton Picking',
  'Bundle Tying',
  'Thresher Feeding',
  'Vegetable Grading',
]

export const ListLabourModal: React.FC<ListLabourModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, farm } = useAuth()
  const createListing = useCreateLabourListing()

  const [title, setTitle] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Manual Harvesting',
    'Bundle Tying',
  ])
  const [groupSize, setGroupSize] = useState(8)
  const [dailyRate, setDailyRate] = useState(5000)
  const [district, setDistrict] = useState(farm?.district || 'Hisar')
  const [areaServed, setAreaServed] = useState(`${district} & adjoining villages (20 km)`)
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !user?.id) return

    await createListing.mutateAsync({
      leader_id: user.id,
      leader_name: profile?.full_name || 'Crew Leader',
      leader_phone: user.phone || profile?.phone || '+91 98765 00000',
      title: title.trim(),
      description: description.trim() || 'Experienced and reliable agricultural workforce.',
      skills: selectedSkills,
      group_size: groupSize,
      daily_rate: dailyRate,
      district,
      area_served: areaServed.trim(),
      photos: [SAMPLE_LABOUR_PHOTOS[0]],
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
            <h3 className="text-2xl font-black text-[var(--ink)]">Labour Group Listed!</h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
              Your crew of {groupSize} workers is now listed on Kisan OS. Nearby farmers can check your skills, rates, and request bookings.
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
                Labour Leader Portal
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight mt-1.5">
                Register Your Labour Group
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Secure continuous work for your agricultural workers directly with local farmers.
              </p>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Crew Name / Group Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kisan Veer Harvesting & Sowing Crew"
                className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
              />
            </div>

            {/* Group Size & Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[var(--forest)]" />
                  Group Size (Workers)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={groupSize}
                  onChange={(e) => setGroupSize(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Total Daily Rate (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                />
              </div>
            </div>

            {/* Skills Multi-Select Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] block">
                Work Specializations & Skills
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_OPTIONS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill)
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--forest)] text-[var(--white)]'
                          : 'bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
                      }`}
                    >
                      {skill}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* District & Coverage */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Base District
                </label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value)
                    setAreaServed(`${e.target.value} & nearby villages (20 km)`)
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
                  Coverage Area
                </label>
                <input
                  type="text"
                  value={areaServed}
                  onChange={(e) => setAreaServed(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Crew Experience & Terms
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention working hours (e.g. 8 AM to 5 PM), tools brought by crew, transport preferences..."
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
                Publish Labour Group
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
