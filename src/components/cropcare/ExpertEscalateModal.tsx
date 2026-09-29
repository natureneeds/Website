import React, { useState } from 'react'
import { PhoneCall, ShieldCheck, CheckCircle2, MessageSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useEscalateDiagnosis } from '@/lib/api/cropCare'
import { useAuth } from '@/context/AuthContext'
import type { CropDiagnosis } from '@/lib/supabase/types'

interface ExpertEscalateModalProps {
  isOpen: boolean
  onClose: () => void
  diagnosis: CropDiagnosis | null
}

export const ExpertEscalateModal: React.FC<ExpertEscalateModalProps> = ({
  isOpen,
  onClose,
  diagnosis,
}) => {
  const { user, profile, farm } = useAuth()
  const escalate = useEscalateDiagnosis()
  const [submitted, setSubmitted] = useState(false)
  const [preferredContact, setPreferredContact] = useState<'call' | 'whatsapp'>('call')
  const [notes, setNotes] = useState('')

  if (!isOpen || !diagnosis) return null

  const handleEscalate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    await escalate.mutateAsync({
      userId: user.id,
      diagnosisId: diagnosis.id,
    })
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]">
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-page)] border border-[var(--line)] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
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
            <h3 className="text-2xl font-black text-[var(--ink)] tracking-tight">
              Consultation Scheduled!
            </h3>
            <p className="text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed">
              Your crop issue report for{' '}
              <strong className="text-[var(--ink)]">{diagnosis.issue_name}</strong> has been
              assigned to an ICAR/KVK-certified Senior Agronomist. An expert will reach out to{' '}
              <span className="font-semibold text-[var(--ink)]">
                {profile?.full_name || 'Farmer'} ({user?.phone || 'registered phone'})
              </span>{' '}
              within 15 minutes.
            </p>
            <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] text-left text-xs text-[var(--ink)] space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-[var(--forest)]">
                <ShieldCheck className="w-4 h-4" />
                Case ID: #EXP-{diagnosis.id.slice(-6).toUpperCase()}
              </div>
              <p className="text-[var(--muted)]">
                A confirmation advisory notification has also been placed in your in-app inbox.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                onClick={() => {
                  setSubmitted(false)
                  onClose()
                }}
              >
                Close & View Treatments
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEscalate} className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--line)] text-[var(--forest)] text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                Certified Agronomist Consultation
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
                Connect with a Krishi Expert
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                Verify AI scan results with agricultural university specialists before applying costly inputs.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Crop & Issue:</span>
                <span className="font-bold text-[var(--ink)]">
                  {diagnosis.crop_type} &bull; {diagnosis.issue_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">AI Confidence:</span>
                <span className="font-bold text-[var(--forest)]">{diagnosis.confidence}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">District Desk:</span>
                <span className="font-bold text-[var(--ink)]">
                  {farm?.district || 'Haryana Region'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Preferred Mode of Contact
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPreferredContact('call')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    preferredContact === 'call'
                      ? 'border-[var(--lime)] bg-[var(--surface)] text-[var(--ink)] ring-2 ring-[var(--lime)]'
                      : 'border-[var(--line)] bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  <PhoneCall className="w-4 h-4 text-[var(--forest)]" />
                  Phone Call (Direct)
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredContact('whatsapp')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    preferredContact === 'whatsapp'
                      ? 'border-[var(--lime)] bg-[var(--surface)] text-[var(--ink)] ring-2 ring-[var(--lime)]'
                      : 'border-[var(--line)] bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-[var(--forest)]" />
                  WhatsApp Advisory
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Additional Observations (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Leaf discoloration started 3 days ago after heavy morning dew. Approx 1 acre affected."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={escalate.isPending}
                loading={escalate.isPending}
              >
                Confirm Request
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
