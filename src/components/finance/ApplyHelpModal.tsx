import React, { useState } from 'react'
import { Printer, PhoneCall, CheckCircle2, X, ExternalLink, ShieldCheck, FileCheck2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useRequestFinanceCallback } from '@/lib/api/finance'
import { useAuth } from '@/context/AuthContext'
import type { SchemeData } from '@/lib/data/seedSchemes'

interface ApplyHelpModalProps {
  isOpen: boolean
  onClose: () => void
  scheme: SchemeData | null
}

export const ApplyHelpModal: React.FC<ApplyHelpModalProps> = ({ isOpen, onClose, scheme }) => {
  const { user, profile } = useAuth()
  const requestCallback = useRequestFinanceCallback()

  const [phone, setPhone] = useState(user?.phone || profile?.phone || '+91 98765 00000')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen || !scheme) return null

  const handlePrint = () => {
    window.print()
  }

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    await requestCallback.mutateAsync({
      userId: user.id,
      schemeId: scheme.id,
      schemeTitle: scheme.title,
      farmerName: profile?.full_name || 'Farmer',
      phone,
      notes,
    })
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--bg-page)] border border-[var(--line)] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in duration-150 space-y-6">
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
            <h3 className="text-2xl font-black text-[var(--ink)]">Call-Back Scheduled!</h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed">
              Your assistance request for <strong className="text-[var(--ink)]">{scheme.title}</strong> has
              been logged as a priority finance ticket. An authorized Krishi Banking Counselor will contact{' '}
              <span className="font-semibold text-[var(--ink)]">{phone}</span> to guide your application and bank submission.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                onClick={() => {
                  setSubmitted(false)
                  onClose()
                }}
              >
                Close & Return
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--line)] text-xs font-bold uppercase tracking-wider text-[var(--forest)] mb-2">
                <FileCheck2 className="w-3.5 h-3.5" />
                Application & Document Checklist
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
                {scheme.title}
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                Official Portal: <a href={scheme.official_portal_url} target="_blank" rel="noreferrer" className="text-[var(--forest)] font-semibold underline inline-flex items-center gap-1">{scheme.portal_name} <ExternalLink className="w-3 h-3" /></a>
              </p>
            </div>

            {/* MANDATORY DISCLAIMER */}
            <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink)] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[var(--warning)] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--ink)] block">
                  Information only. Verify with the bank or official portal
                </strong>
                <span className="text-[var(--muted)]">
                  Interest subventions, subsidy caps, and eligibility are governed by central/state ministry guidelines and respective lending banks.
                </span>
              </div>
            </div>

            {/* Document Checklist for Printing */}
            <div className="space-y-3 p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Required Documents ({scheme.required_docs.length})
                </h4>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="text-xs font-semibold text-[var(--forest)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Checklist
                </button>
              </div>

              <div className="space-y-2">
                {scheme.required_docs.map((doc, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-[var(--ink)] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-0.5 rounded text-[var(--forest)] focus:ring-[var(--forest)]"
                    />
                    <span>{doc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Request Call-back Form */}
            <form onSubmit={handleCallbackSubmit} className="space-y-3.5 pt-2 border-t border-[var(--line)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-[var(--forest)]" />
                Need Application Help? Request Call-Back
              </h4>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--muted)]">
                  Farmer Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--muted)]">
                  Notes / Specific Questions (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g., Need assistance with Jamabandi verification or bank branch selection."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={requestCallback.isPending}
                  loading={requestCallback.isPending}
                >
                  Request Call-Back
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
