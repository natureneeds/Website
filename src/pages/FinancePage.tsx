import React, { useState } from 'react'
import {
  Coins,
  CreditCard,
  Shield,
  Layers,
  Sparkles,
  Calculator,
  ExternalLink,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react'
import { LayoutShell } from '@/components/ui/LayoutShell'
import { Button } from '@/components/ui/Button'
import { SEEDED_SCHEMES } from '@/lib/data/seedSchemes'
import { EligibilityCheckerCard } from '@/components/finance/EligibilityCheckerCard'
import { LoanEmiCalculatorCard } from '@/components/finance/LoanEmiCalculatorCard'
import { ApplyHelpModal } from '@/components/finance/ApplyHelpModal'
import type { SchemeData } from '@/lib/data/seedSchemes'

export const FinancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'eligibility' | 'loans_kcc' | 'insurance' | 'subsidies' | 'calculator'>('eligibility')
  const [selectedSchemeForHelp, setSelectedSchemeForHelp] = useState<SchemeData | null>(null)

  const loansList = SEEDED_SCHEMES.filter((s) => s.section === 'loans_kcc')
  const insuranceList = SEEDED_SCHEMES.filter((s) => s.section === 'insurance')
  const subsidiesList = SEEDED_SCHEMES.filter((s) => s.section === 'subsidies_schemes')

  return (
    <LayoutShell>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Hero Header */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-xs font-bold uppercase tracking-wider text-[var(--forest)]">
              <Coins className="w-3.5 h-3.5" />
              Krishi Finance & Insurance Hub &bull; Phase 11
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--ink)] tracking-tight">
              Agricultural Credit, Insurance & Subsidies
            </h1>
            <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
              Explore subsidized Kisan Credit Card (KCC) loans, PMFBY natural risk coverage, machinery capital subsidies, and check your farm's instant document eligibility.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-xs text-[var(--ink)] max-w-xs space-y-1 relative z-10">
            <div className="font-bold flex items-center gap-1.5 text-[var(--forest)]">
              <ShieldCheck className="w-4 h-4 text-[var(--warning)]" />
              Official Portal Disclaimer
            </div>
            <p className="text-[11px] text-[var(--muted)] leading-snug">
              Information only. Verify with the bank or official portal. All scheme benefits are disbursed directly through government DBT portals.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--surface-alt)] border border-[var(--line)] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('eligibility')}
            className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'eligibility'
                ? 'bg-[var(--lime)] text-[var(--ink)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Eligibility Checker</span>
          </button>

          <button
            onClick={() => setActiveTab('loans_kcc')}
            className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'loans_kcc'
                ? 'bg-[var(--lime)] text-[var(--ink)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Loans & KCC</span>
          </button>

          <button
            onClick={() => setActiveTab('insurance')}
            className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'insurance'
                ? 'bg-[var(--lime)] text-[var(--ink)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Crop Insurance (PMFBY)</span>
          </button>

          <button
            onClick={() => setActiveTab('subsidies')}
            className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'subsidies'
                ? 'bg-[var(--lime)] text-[var(--ink)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Subsidies & Schemes</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-[var(--lime)] text-[var(--ink)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>EMI & Premium Calculator</span>
          </button>
        </div>

        {/* Tab 1: Eligibility Checker */}
        {activeTab === 'eligibility' && (
          <div className="animate-in fade-in duration-200">
            <EligibilityCheckerCard />
          </div>
        )}

        {/* Tab 2: Loans and KCC */}
        {activeTab === 'loans_kcc' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <div>
                <h3 className="text-xl font-bold text-[var(--ink)]">Agricultural Credit & KCC Loans</h3>
                <p className="text-xs text-[var(--muted)]">Subsidized working capital and long-term farm development credit.</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--line)]">
                {loansList.length} Credit Programs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loansList.map((scheme, idx) => {
                const isCream = idx % 2 === 0
                return (
                  <div
                    key={scheme.id}
                    className={`p-6 rounded-2xl border border-[var(--line)] flex flex-col justify-between space-y-4 shadow-sm ${
                      isCream ? 'bg-[var(--surface)] text-[var(--ink)]' : 'bg-[var(--ink)] text-[var(--white)]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--lime)] text-[var(--ink)]">
                          {scheme.type.replace('_', ' ')}
                        </span>
                        <a
                          href={scheme.official_portal_url}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-xs font-semibold hover:underline inline-flex items-center gap-1 ${
                            isCream ? 'text-[var(--forest)]' : 'text-[var(--lime)]'
                          }`}
                        >
                          Official Portal <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <h4 className="text-lg font-black leading-snug">{scheme.title}</h4>
                      <p className={`text-xs leading-relaxed ${isCream ? 'text-[var(--ink)]/80' : 'text-[var(--white)]/80'}`}>
                        {scheme.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--line)]/20 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Benefit</span>
                        <span className="text-xs font-bold">{scheme.max_benefit}</span>
                      </div>
                      <Button
                        variant={isCream ? 'primary' : 'accent'}
                        size="sm"
                        onClick={() => setSelectedSchemeForHelp(scheme)}
                        className="cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 mr-1" />
                        Checklist
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Insurance (PMFBY) */}
        {activeTab === 'insurance' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <div>
                <h3 className="text-xl font-bold text-[var(--ink)]">PMFBY & Weather-Based Crop Insurance</h3>
                <p className="text-xs text-[var(--muted)]">Guaranteed yield protection against hail, drought, and natural pests.</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--line)]">
                {insuranceList.length} Insurance Covers
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insuranceList.map((scheme, idx) => {
                const isCream = idx % 2 === 0
                return (
                  <div
                    key={scheme.id}
                    className={`p-6 rounded-2xl border border-[var(--line)] flex flex-col justify-between space-y-4 shadow-sm ${
                      isCream ? 'bg-[var(--surface)] text-[var(--ink)]' : 'bg-[var(--ink)] text-[var(--white)]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--lime)] text-[var(--ink)]">
                          {scheme.type}
                        </span>
                        <a
                          href={scheme.official_portal_url}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-xs font-semibold hover:underline inline-flex items-center gap-1 ${
                            isCream ? 'text-[var(--forest)]' : 'text-[var(--lime)]'
                          }`}
                        >
                          Official Portal <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <h4 className="text-lg font-black leading-snug">{scheme.title}</h4>
                      <p className={`text-xs leading-relaxed ${isCream ? 'text-[var(--ink)]/80' : 'text-[var(--white)]/80'}`}>
                        {scheme.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--line)]/20 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Coverage</span>
                        <span className="text-xs font-bold">{scheme.max_benefit}</span>
                      </div>
                      <Button
                        variant={isCream ? 'primary' : 'accent'}
                        size="sm"
                        onClick={() => setSelectedSchemeForHelp(scheme)}
                        className="cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 mr-1" />
                        Checklist
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Subsidies & Schemes */}
        {activeTab === 'subsidies' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <div>
                <h3 className="text-xl font-bold text-[var(--ink)]">Government Subsidies & Capital Grants</h3>
                <p className="text-xs text-[var(--muted)]">Direct benefit transfers for solar pumps, drip systems, machinery, and income support.</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--line)]">
                {subsidiesList.length} Subsidy Schemes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subsidiesList.map((scheme, idx) => {
                const isCream = idx % 2 === 0
                return (
                  <div
                    key={scheme.id}
                    className={`p-6 rounded-2xl border border-[var(--line)] flex flex-col justify-between space-y-4 shadow-sm ${
                      isCream ? 'bg-[var(--surface)] text-[var(--ink)]' : 'bg-[var(--ink)] text-[var(--white)]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--lime)] text-[var(--ink)]">
                          {scheme.type}
                        </span>
                        <a
                          href={scheme.official_portal_url}
                          target="_blank"
                          rel="noreferrer"
                          className={`text-xs font-semibold hover:underline inline-flex items-center gap-1 ${
                            isCream ? 'text-[var(--forest)]' : 'text-[var(--lime)]'
                          }`}
                        >
                          Official Portal <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <h4 className="text-lg font-black leading-snug">{scheme.title}</h4>
                      <p className={`text-xs leading-relaxed ${isCream ? 'text-[var(--ink)]/80' : 'text-[var(--white)]/80'}`}>
                        {scheme.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--line)]/20 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Subsidy Rate</span>
                        <span className="text-xs font-bold">{scheme.max_benefit}</span>
                      </div>
                      <Button
                        variant={isCream ? 'primary' : 'accent'}
                        size="sm"
                        onClick={() => setSelectedSchemeForHelp(scheme)}
                        className="cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 mr-1" />
                        Checklist
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 5: EMI & Premium Calculator */}
        {activeTab === 'calculator' && (
          <div className="animate-in fade-in duration-200">
            <LoanEmiCalculatorCard />
          </div>
        )}

        {/* Apply Help Modal */}
        <ApplyHelpModal
          isOpen={Boolean(selectedSchemeForHelp)}
          onClose={() => setSelectedSchemeForHelp(null)}
          scheme={selectedSchemeForHelp}
        />
      </main>
    </LayoutShell>
  )
}
