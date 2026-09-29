import React, { useState } from 'react'
import { X, CheckCircle2, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreateCommunityPost } from '@/lib/api/supportCommunity'
import { useAuth } from '@/context/AuthContext'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
}

const SAMPLE_COMMUNITY_PHOTOS = [
  'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1592417817098-8f3d6910a514?auto=format&fit=crop&w=800&q=80',
]

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, farm } = useAuth()
  const createPost = useCreateCommunityPost()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [cropTag, setCropTag] = useState('Wheat HD-3086')
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(SAMPLE_COMMUNITY_PHOTOS[0])
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !title.trim() || !content.trim()) return

    await createPost.mutateAsync({
      author_id: user.id,
      author_name: profile?.full_name || 'Farmer Contributor',
      author_district: farm?.district ? `${farm.district}, ${farm.state || 'India'}` : 'Haryana, India',
      crop_tag: cropTag,
      title: title.trim(),
      content: content.trim(),
      photos: selectedPhoto ? [selectedPhoto] : [],
    })

    setSubmitted(true)
  }

  const handleResetAndClose = () => {
    setSubmitted(false)
    setTitle('')
    setContent('')
    onClose()
  }

  const crops = ['Wheat HD-3086', 'Mustard Pusa Bold', 'Paddy Basmati 1121', 'Cotton', 'Potato', 'General Farming']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[var(--bg-page)] border border-[var(--line)] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-150 space-y-5">
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--surface-alt)] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--surface)] text-[var(--forest)] flex items-center justify-center mx-auto border border-[var(--line)]">
              <CheckCircle2 className="w-10 h-10 text-[var(--forest)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--ink)]">Community Post Published!</h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
              Your farming insight has been shared with thousands of verified farmers across your region.
            </p>
            <div className="pt-2">
              <Button variant="primary" onClick={handleResetAndClose} className="w-full">
                View in Community
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-[10px] font-bold uppercase tracking-wider text-[var(--forest)] mb-1">
                <Users className="w-3.5 h-3.5 text-[var(--forest)]" />
                Farmer Community Feed
              </div>
              <h3 className="text-xl font-black text-[var(--ink)] tracking-tight">
                Share Farming Experience or Tip
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Share field results, tillage techniques, pesticide outcomes, or ask fellow farmers for advice.
              </p>
            </div>

            <div className="space-y-3">
              {/* Crop Tag */}
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                  Crop Tag
                </label>
                <select
                  value={cropTag}
                  onChange={(e) => setCropTag(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] cursor-pointer"
                >
                  {crops.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                  Headline / Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Laser levelling reduced our irrigation time by 40%!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] font-bold"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                  Your Story or Observation
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detail what variety you sowed, what inputs you used, cost savings, or any challenges faced..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] resize-none"
                />
              </div>

              {/* Photo Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--ink)]">
                  Add Crop Photo (Optional)
                </label>
                <div className="flex items-center gap-2">
                  {SAMPLE_COMMUNITY_PHOTOS.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPhoto(selectedPhoto === img ? null : img)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        selectedPhoto === img
                          ? 'border-[var(--forest)] ring-2 ring-[var(--forest)]'
                          : 'border-[var(--line)] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="sample" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={handleResetAndClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createPost.isPending || !title.trim() || !content.trim()}
                loading={createPost.isPending}
              >
                Post to Community
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
