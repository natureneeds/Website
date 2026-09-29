import React, { useState } from 'react'
import { Calculator, Shield, ShieldCheck } from 'lucide-react'

export const LoanEmiCalculatorCard: React.FC = () => {
  // Loan Calculator State
  const [loanType, setLoanType] = useState<'kcc' | 'term'>('kcc')
  const [principal, setPrincipal] = useState<number>(200000)
  const [rate, setRate] = useState<number>(4.0) // 4% default for KCC
  const [tenureYears, setTenureYears] = useState<number>(1) // 1 year default for KCC

  // Insurance Estimator State
  const [cropType, setCropType] = useState<'wheat' | 'mustard' | 'rice' | 'cotton'>('wheat')
  const [acres, setAcres] = useState<number>(4)
  const [sumInsuredPerAcre, setSumInsuredPerAcre] = useState<number>(48000)

  // Calculations - Loan EMI
  const monthlyRate = rate / 12 / 100
  const totalMonths = tenureYears * 12
  const emi =
    monthlyRate > 0
      ? Math.round(
          (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        )
      : Math.round(principal / totalMonths)
  const totalPayable = emi * totalMonths
  const totalInterest = Math.max(0, totalPayable - principal)

  // Calculations - PMFBY Insurance Premium
  const premiumRates: Record<string, { farmerRate: number; name: string; season: string }> = {
    wheat: { farmerRate: 1.5, name: 'Wheat (गेहूँ)', season: 'Rabi' },
    mustard: { farmerRate: 1.5, name: 'Mustard (सरसों)', season: 'Rabi' },
    rice: { farmerRate: 2.0, name: 'Rice (धान)', season: 'Kharif' },
    cotton: { farmerRate: 5.0, name: 'Cotton (कपास)', season: 'Commercial' },
  }

  const selectedCropInfo = premiumRates[cropType]
  const totalSumInsured = acres * sumInsuredPerAcre
  const farmerShareAmount = Math.round((totalSumInsured * selectedCropInfo.farmerRate) / 100)
  // Actual actuarial rate ~12-15%, remainder covered by Gov
  const totalActuarialCost = Math.round((totalSumInsured * 12.0) / 100)
  const govSubsidyAmount = Math.max(0, totalActuarialCost - farmerShareAmount)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LOAN / EMI CALCULATOR */}
        <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-xs font-bold uppercase tracking-wider text-[var(--forest)]">
                <Calculator className="w-3.5 h-3.5" />
                Agri Credit & Loan Calculator
              </div>
              <span className="text-[11px] font-semibold text-[var(--forest)]">Interactive</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[var(--ink)] tracking-tight">
              KCC & Farm Loan EMI Calculator
            </h3>

            {/* Loan Preset Pills */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoanType('kcc')
                  setRate(4.0)
                  setTenureYears(1)
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  loanType === 'kcc'
                    ? 'bg-[var(--lime)] text-[var(--ink)] border-[var(--lime-strong)] shadow-xs'
                    : 'bg-[var(--surface-alt)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]'
                }`}
              >
                KCC Crop Loan (4% Net)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoanType('term')
                  setRate(8.5)
                  setTenureYears(5)
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  loanType === 'term'
                    ? 'bg-[var(--lime)] text-[var(--ink)] border-[var(--lime-strong)] shadow-xs'
                    : 'bg-[var(--surface-alt)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]'
                }`}
              >
                Tractor / Agri Term Loan
              </button>
            </div>

            {/* Principal Amount */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[var(--ink)]">Loan Amount (Principal)</span>
                <span className="text-[var(--forest)] font-black text-sm">
                  ₹{principal.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="25000"
                max="1500000"
                step="25000"
                value={principal}
                onChange={(e) => setPrincipal(parseInt(e.target.value))}
                className="w-full accent-[var(--forest)] cursor-pointer"
              />
            </div>

            {/* Interest Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[var(--ink)]">Annual Interest Rate</span>
                <span className="text-[var(--forest)] font-black text-sm">{rate}% p.a.</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="12.0"
                step="0.5"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full accent-[var(--forest)] cursor-pointer"
              />
            </div>

            {/* Tenure */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[var(--ink)]">Loan Tenure</span>
                <span className="text-[var(--forest)] font-black text-sm">
                  {tenureYears} {tenureYears === 1 ? 'Year' : 'Years'} ({totalMonths} Months)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(parseInt(e.target.value))}
                className="w-full accent-[var(--forest)] cursor-pointer"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)]">Monthly EMI:</span>
              <span className="text-base font-black text-[var(--ink)]">
                ₹{emi.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)]">Total Interest Payable:</span>
              <span className="font-bold text-[var(--forest)]">
                ₹{totalInterest.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[var(--line)]">
              <span className="font-bold text-[var(--ink)]">Total Repayment Amount:</span>
              <span className="font-black text-sm text-[var(--ink)]">
                ₹{totalPayable.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* PMFBY CROP INSURANCE ESTIMATOR */}
        <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--ink)] text-[var(--white)] space-y-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[var(--surface-alt)]/10 border border-[var(--line)]/20 text-xs font-bold uppercase tracking-wider text-[var(--lime)]">
                <Shield className="w-3.5 h-3.5" />
                PMFBY Premium Estimator
              </div>
              <span className="text-[11px] font-semibold text-[var(--lime)]">Govt Subsidized</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[var(--white)] tracking-tight">
              Crop Insurance Premium Estimator
            </h3>

            {/* Crop Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--white)]/90">
                Select Insured Crop
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(premiumRates).map(([k, v]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setCropType(k as any)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      cropType === k
                        ? 'border-[var(--lime)] bg-[var(--surface-alt)]/20 ring-1 ring-[var(--lime)]'
                        : 'border-[var(--line)]/20 bg-[var(--surface-alt)]/5 hover:border-[var(--line)]'
                    }`}
                  >
                    <div className="font-bold text-[var(--white)]">{v.name}</div>
                    <div className="text-[10px] text-[var(--lime)]">
                      {v.farmerRate}% Farmer Share &bull; {v.season}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Acreage Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[var(--white)]">Total Land Insured</span>
                <span className="text-[var(--lime)] font-black text-sm">{acres} Acres</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="25"
                step="0.5"
                value={acres}
                onChange={(e) => setAcres(parseFloat(e.target.value))}
                className="w-full accent-[var(--lime)] cursor-pointer"
              />
            </div>

            {/* Scale of Finance / Sum Insured */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[var(--white)]">Sum Insured Per Acre</span>
                <span className="text-[var(--lime)] font-black text-sm">
                  ₹{sumInsuredPerAcre.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="25000"
                max="85000"
                step="5000"
                value={sumInsuredPerAcre}
                onChange={(e) => setSumInsuredPerAcre(parseInt(e.target.value))}
                className="w-full accent-[var(--lime)] cursor-pointer"
              />
            </div>
          </div>

          {/* Insurance Results Box */}
          <div className="p-4 rounded-xl bg-[var(--surface-alt)]/10 border border-[var(--line)]/20 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)]">Total Insurance Coverage (Sum Insured):</span>
              <span className="text-sm font-black text-[var(--white)]">
                ₹{totalSumInsured.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)]">Govt Premium Subsidy (Central + State):</span>
              <span className="font-bold text-[var(--lime)]">
                ₹{govSubsidyAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[var(--line)]/20">
              <span className="font-bold text-[var(--white)]">
                Farmer Out-of-Pocket Premium ({selectedCropInfo.farmerRate}%):
              </span>
              <span className="font-black text-base text-[var(--lime)]">
                ₹{farmerShareAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--warning)] shrink-0" />
          <span className="font-semibold">
            Information only. Verify with the bank or official portal
          </span>
        </div>
        <span className="text-[11px] text-[var(--muted)] hidden sm:inline-block">
          Calculations are indicative based on RBI/NABARD & Ministry guidelines.
        </span>
      </div>
    </div>
  )
}
