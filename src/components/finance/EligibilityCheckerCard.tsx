import React, { useState } from 'react'
import {
  FileCheck2,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SEEDED_SCHEMES, type SchemeData } from '@/lib/data/seedSchemes'
import { filterEligibleSchemes } from '@/lib/api/finance'
import { ApplyHelpModal } from './ApplyHelpModal'
import { useAuth } from '@/context/AuthContext'

export const EligibilityCheckerCard: React.FC = () => {
  const { farm } = useAuth()

  const [state, setState] = useState(farm?.state || 'Haryana')
  const [landSize, setLandSize] = useState<number>(farm?.land_size || 3.0)
  const [crop, setCrop] = useState<string>(farm?.crops?.[0] || 'Wheat')
  const [category, setCategory] = useState<'marginal' | 'small' | 'medium' | 'large' | 'all'>('small')

  const [selectedSchemeForHelp, setSelectedSchemeForHelp] = useState<SchemeData | null>(null)
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null)

  const matchedSchemes = filterEligibleSchemes(SEEDED_SCHEMES, {
    state,
    landSize,
    crop,
    category,
  })

  const toggleExpand = (id: string) => {
    setExpandedSchemeId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-xs font-bold uppercase tracking-wider text-[var(--forest)] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--forest)]" />
            AI Scheme & Subsidy Eligibility Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)] tracking-tight">
            Check Your Farm's Scheme Eligibility
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Input your state, land holding, and crop to instantly unlock eligible subsidies, KCC limits, crop insurance rates, and document checklists.
          </p>
        </div>

        {/* Short Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)]">
          {/* State */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              State
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg-page)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
            >
              <option value="Haryana">Haryana</option>
              <option value="Punjab">Punjab</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
            </select>
          </div>

          {/* Land Size */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              Land Holding (Acres)
            </label>
            <input
              type="number"
              min="0.1"
              max="500"
              step="0.5"
              value={landSize}
              onChange={(e) => setLandSize(parseFloat(e.target.value) || 1)}
              className="w-full text-xs p-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg-page)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
            />
          </div>

          {/* Primary Crop */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              Primary Sown Crop
            </label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg-page)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
            >
              <option value="Wheat">Wheat (गेहूँ)</option>
              <option value="Mustard">Mustard (सरसों)</option>
              <option value="Rice">Rice (धान)</option>
              <option value="Cotton">Cotton (कपास)</option>
              <option value="Potato">Potato (आलू)</option>
              <option value="all">All Crops</option>
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              Farmer Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg-page)] text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
            >
              <option value="marginal">Marginal (&le; 2.5 Acres)</option>
              <option value="small">Small (2.5 &ndash; 5 Acres)</option>
              <option value="medium">Medium (5 &ndash; 10 Acres)</option>
              <option value="large">Large (&gt; 10 Acres)</option>
            </select>
          </div>
        </div>

        {/* Results Counter & Mandatory Disclaimer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[var(--line)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--forest)]" />
            <span className="text-sm font-bold text-[var(--ink)]">
              {matchedSchemes.length} Eligible Government Schemes & Credit Facilities Found
            </span>
          </div>

          <div className="p-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[11px] text-[var(--muted)] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--warning)] shrink-0" />
            <span className="font-semibold text-[var(--ink)]">
              Information only. Verify with the bank or official portal
            </span>
          </div>
        </div>
      </div>

      {/* Matched Schemes List with Document Checklists */}
      <div className="space-y-4">
        {matchedSchemes.map((scheme, idx) => {
          const isExpanded = expandedSchemeId === scheme.id || idx === 0 // first expanded by default
          const isCreamCard = idx % 2 === 0

          return (
            <div
              key={scheme.id}
              className={`rounded-2xl border border-[var(--line)] p-5 sm:p-6 transition-all shadow-sm ${
                isCreamCard ? 'bg-[var(--surface)] text-[var(--ink)]' : 'bg-[var(--ink)] text-[var(--white)]'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--lime)] text-[var(--ink)]">
                      {scheme.type.replace('_', ' ')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--surface-alt)]/20 border border-[var(--line)]/20">
                      {scheme.section.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <h3
                    className={`text-lg sm:text-xl font-black tracking-tight ${
                      isCreamCard ? 'text-[var(--ink)]' : 'text-[var(--white)]'
                    }`}
                  >
                    {scheme.title}
                  </h3>

                  <p
                    className={`text-xs leading-relaxed ${
                      isCreamCard ? 'text-[var(--ink)]/80' : 'text-[var(--white)]/80'
                    }`}
                  >
                    {scheme.description}
                  </p>

                  <div className="pt-1 text-xs">
                    <strong className="text-[var(--forest)] block">Maximum Benefit / Terms:</strong>
                    <span className="font-bold">{scheme.max_benefit}</span>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
                  <Button
                    variant={isCreamCard ? 'primary' : 'accent'}
                    size="sm"
                    onClick={() => setSelectedSchemeForHelp(scheme)}
                    className="font-bold cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 mr-1" />
                    Apply Help & Checklist
                  </Button>

                  <a
                    href={scheme.official_portal_url}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-xs font-semibold hover:underline inline-flex items-center gap-1 ${
                      isCreamCard ? 'text-[var(--forest)]' : 'text-[var(--lime)]'
                    }`}
                  >
                    Official Portal <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => toggleExpand(scheme.id)}
                    className="text-xs text-[var(--muted)] hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>{isExpanded ? 'Hide Checklist' : 'View Document Checklist'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Document Checklist */}
              {isExpanded && (
                <div
                  className={`mt-4 pt-4 border-t border-[var(--line)]/20 space-y-3 animate-in fade-in duration-200 ${
                    isCreamCard ? 'text-[var(--ink)]' : 'text-[var(--white)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[var(--forest)]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mandatory Application Document Checklist ({scheme.required_docs.length} Items)
                    </h4>
                    <span className="text-[11px] text-[var(--muted)]">Ready for Bank Verification</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {scheme.required_docs.map((doc, dIdx) => (
                      <div
                        key={dIdx}
                        className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                          isCreamCard
                            ? 'bg-[var(--surface-alt)] border-[var(--line)]'
                            : 'bg-[var(--surface-alt)]/10 border-[var(--line)]/20'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-[var(--lime)] text-[var(--ink)] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {dIdx + 1}
                        </span>
                        <span className="leading-snug">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Apply Help Modal */}
      <ApplyHelpModal
        isOpen={Boolean(selectedSchemeForHelp)}
        onClose={() => setSelectedSchemeForHelp(null)}
        scheme={selectedSchemeForHelp}
      />
    </div>
  )
}
