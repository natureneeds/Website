import React, { useState, useEffect } from 'react'
import {
  X,
  Mic,
  MicOff,
  Upload,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreateSupportTicket } from '@/lib/api/supportCommunity'
import { useAuth } from '@/context/AuthContext'
import type { TicketCategory } from '@/lib/data/seedSupportCommunity'

interface CreateTicketModalProps {
  isOpen: boolean
  onClose: () => void
  initialCategory?: TicketCategory
  onSuccessTicket?: (ticketId: string) => void
}

const SAMPLE_TICKET_PHOTOS = [
  'https://images.unsplash.com/photo-1592417817098-8f3d6910a514?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80',
]

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'crop',
  onSuccessTicket,
}) => {
  const { user, profile } = useAuth()
  const createTicket = useCreateSupportTicket()

  const [category, setCategory] = useState<TicketCategory>(initialCategory)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal')
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [voiceLang, setVoiceLang] = useState<'hi-IN' | 'en-IN'>('hi-IN')
  const [speechError, setSpeechError] = useState<string | null>(null)
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null)

  // Web Speech API Integration
  useEffect(() => {
    if (!isOpen) return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    let recognition: any = null

    if (isListening) {
      try {
        recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = voiceLang

        recognition.onstart = () => {
          setSpeechError(null)
        }

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript))
          setIsListening(false)
        }

        recognition.onerror = (event: any) => {
          setIsListening(false)
          if (event.error !== 'no-speech') {
            setSpeechError(`Voice input error: ${event.error}`)
          }
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.start()
      } catch (err: any) {
        setIsListening(false)
        setSpeechError(err.message || 'Microphone error')
      }
    }

    return () => {
      if (recognition) {
        try {
          recognition.abort()
        } catch {
          // ignore
        }
      }
    }
  }, [isListening, voiceLang, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !subject.trim() || !description.trim()) return

    const newTicket = await createTicket.mutateAsync({
      user_id: user.id,
      farmer_name: profile?.full_name || 'Farmer Client',
      farmer_phone: user.phone || profile?.phone || '+91 98765 00000',
      category,
      subject: subject.trim(),
      description: description.trim(),
      status: 'open',
      priority,
      photos: selectedPhoto ? [selectedPhoto] : [],
    })

    setCreatedTicketId(newTicket.id)
    if (onSuccessTicket) {
      onSuccessTicket(newTicket.id)
    }
  }

  const handleResetAndClose = () => {
    setCreatedTicketId(null)
    setSubject('')
    setDescription('')
    setSelectedPhoto(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[var(--bg-page)] border border-[var(--line)] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-150 space-y-5">
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-full hover:bg-[var(--surface-alt)] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {createdTicketId ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--surface)] text-[var(--forest)] flex items-center justify-center mx-auto border border-[var(--line)]">
              <CheckCircle2 className="w-10 h-10 text-[var(--forest)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--ink)]">Support Ticket Lodged!</h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
              Your inquiry #{createdTicketId.substring(4, 9)} has been assigned to our KVK agronomists and agri specialists.
            </p>
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Category:</span>
                <span className="font-semibold uppercase text-[var(--forest)]">{category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Status:</span>
                <span className="font-semibold text-[var(--ink)]">Assigned & Awaiting Expert</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Expected Response:</span>
                <span className="font-semibold text-[var(--forest)]">Under 15 minutes</span>
              </div>
            </div>
            <div className="pt-2 flex gap-2">
              <Button variant="primary" onClick={handleResetAndClose} className="w-full">
                View My Tickets
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-[10px] font-bold uppercase tracking-wider text-[var(--forest)] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[var(--forest)]" />
                Expert Assistance Desk
              </div>
              <h3 className="text-xl font-black text-[var(--ink)] tracking-tight">
                Talk to Agri Expert
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Ask about crop diseases, dosage, seed germination, or order status. Specialists respond directly to your ticket.
              </p>
            </div>

            {/* Category Select Buttons */}
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                Issue Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'crop', label: 'Crop & Pest', icon: '🌾' },
                  { key: 'product', label: 'Product & Dose', icon: '🧪' },
                  { key: 'order', label: 'Order & Delivery', icon: '📦' },
                  { key: 'finance', label: 'Loan & PMFBY', icon: '🏦' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setCategory(item.key as TicketCategory)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      category === item.key
                        ? 'border-[var(--forest)] bg-[var(--surface-alt)] text-[var(--forest)] shadow-sm'
                        : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-[11px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                Issue Title / Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Yellow leaves on wheat crop, or delay in fertilizer delivery"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] font-medium"
              />
            </div>

            {/* Description with Voice Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--ink)]">
                  Describe the Issue in Detail
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={voiceLang}
                    onChange={(e) => setVoiceLang(e.target.value as any)}
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--muted)] cursor-pointer"
                  >
                    <option value="hi-IN">हिन्दी (Hindi)</option>
                    <option value="en-IN">English (Indian)</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsListening(!isListening)}
                    className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                      isListening
                        ? 'bg-[var(--danger)] text-white animate-pulse'
                        : 'bg-[var(--surface-alt)] text-[var(--forest)] border border-[var(--line)] hover:bg-[var(--surface)]'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Listening...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        <span>Voice Speak</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Speak or type your symptoms, days since sowing, chemical applied, or question..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] resize-none"
              />

              {speechError && (
                <p className="text-[10px] text-[var(--danger)]">{speechError}</p>
              )}
            </div>

            {/* Photo Attach */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--ink)]">
                Attach Leaf / Problem Photo (Optional)
              </label>
              <div className="flex items-center gap-2">
                {SAMPLE_TICKET_PHOTOS.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedPhoto(selectedPhoto === img ? null : img)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      selectedPhoto === img
                        ? 'border-[var(--forest)] ring-2 ring-[var(--forest)]'
                        : 'border-[var(--line)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="sample leaf" className="w-full h-full object-cover" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(SAMPLE_TICKET_PHOTOS[0])}
                  className="w-14 h-14 rounded-xl border border-dashed border-[var(--line)] flex flex-col items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] text-[10px] cursor-pointer"
                >
                  <Upload className="w-4 h-4 mb-0.5" />
                  <span>Attach</span>
                </button>
              </div>
            </div>

            {/* Priority & Helpline Notice */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgentPriority"
                  checked={priority === 'urgent'}
                  onChange={(e) => setPriority(e.target.checked ? 'urgent' : 'normal')}
                  className="rounded border-[var(--line)] text-[var(--forest)] cursor-pointer"
                />
                <label htmlFor="urgentPriority" className="font-semibold text-[var(--ink)] cursor-pointer">
                  Mark as Urgent (Rapid Disease / Pest Spread)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={handleResetAndClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createTicket.isPending || !subject.trim() || !description.trim()}
                loading={createTicket.isPending}
              >
                Submit Ticket
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
