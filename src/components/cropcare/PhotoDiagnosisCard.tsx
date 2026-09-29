import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  Camera,
  Sparkles,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  ShoppingCart,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useDiagnoseCrop, type DiagnosisResult } from '@/lib/api/cropCare'
import { useAddToCart } from '@/lib/api/cart'
import { useAuth } from '@/context/AuthContext'
import { ExpertEscalateModal } from './ExpertEscalateModal'

// Pre-seeded high quality sample images for fast demoing & automated testing
const SAMPLE_LEAF_IMAGES = [
  {
    name: 'Wheat Yellow Rust',
    crop: 'Wheat',
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
    description: 'Yellow stripe powder pustules on wheat leaf',
  },
  {
    name: 'Mustard White Rust',
    crop: 'Mustard',
    url: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80',
    description: 'White blister patches on lower mustard canopy',
  },
  {
    name: 'Rice Stem Borer',
    crop: 'Rice',
    url: 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&w=800&q=80',
    description: 'Dead heart drying symptoms in paddy tillers',
  },
]

export const PhotoDiagnosisCard: React.FC = () => {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const diagnoseMutation = useDiagnoseCrop()
  const addToCart = useAddToCart()

  const [selectedCrop, setSelectedCrop] = useState('Wheat')
  const [previewUrl, setPreviewUrl] = useState<string | null>(SAMPLE_LEAF_IMAGES[0].url)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false)
  const [addedProductIds, setAddedProductIds] = useState<Record<string, boolean>>({})

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
      setDiagnosis(null)
    }
  }

  // Handle sample select
  const handleSelectSample = (sample: (typeof SAMPLE_LEAF_IMAGES)[0]) => {
    setSelectedFile(null)
    setPreviewUrl(sample.url)
    setSelectedCrop(sample.crop)
    setDiagnosis(null)
  }

  // Run Diagnosis
  const handleScan = async () => {
    if (!user?.id) return

    try {
      const res = await diagnoseMutation.mutateAsync({
        userId: user.id,
        imageBase64: previewUrl?.startsWith('data:') ? previewUrl : undefined,
        cropContext: selectedCrop,
      })
      setDiagnosis(res)
    } catch (err) {
      console.error('Diagnosis failed:', err)
    }
  }

  // Add treatment to cart
  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart.mutateAsync({ productId, qty: 1 })
      setAddedProductIds((prev) => ({ ...prev, [productId]: true }))
      setTimeout(() => {
        setAddedProductIds((prev) => ({ ...prev, [productId]: false }))
      }, 2500)
    } catch (err) {
      console.error('Failed to add to cart:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload and Scanner Box */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--forest)] text-xs font-bold uppercase tracking-wider mb-2">
              <Camera className="w-3.5 h-3.5" />
              AI Plant Doctor &bull; Leaf Health Scan
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)] tracking-tight">
              Instant Crop Disease & Pest Diagnosis
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              Snap or upload a clear photo of an infected leaf to identify pests, rusts, or deficiencies in seconds.
            </p>
          </div>

          {/* Crop Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--muted)] uppercase">Crop:</span>
            <div className="flex gap-1 bg-[var(--surface-alt)] p-1 rounded-xl border border-[var(--line)]">
              {['Wheat', 'Mustard', 'Rice'].map((crop) => (
                <button
                  key={crop}
                  onClick={() => {
                    setSelectedCrop(crop)
                    const match = SAMPLE_LEAF_IMAGES.find((s) => s.crop === crop)
                    if (match && !selectedFile) {
                      setPreviewUrl(match.url)
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCrop === crop
                      ? 'bg-[var(--lime)] text-[var(--ink)] shadow-sm'
                      : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Dropzone & Sample Picker */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-center">
          {/* Preview Box */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--line)] bg-[var(--ink)] flex items-center justify-center group">
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Leaf specimen for diagnosis"
                    className="w-full h-full object-cover"
                  />
                  {diagnoseMutation.isPending && (
                    <div className="absolute inset-0 bg-[var(--overlay)] flex flex-col items-center justify-center text-[var(--white)] space-y-3">
                      <div className="w-12 h-12 rounded-full border-4 border-[var(--lime)] border-t-transparent animate-spin" />
                      <p className="text-sm font-bold tracking-wide animate-pulse">
                        Analyzing foliar symptoms with Vision AI...
                      </p>
                    </div>
                  )}
                  {/* Subtle scanner laser line animation */}
                  {diagnoseMutation.isPending && (
                    <div className="absolute inset-x-0 h-1 bg-[var(--lime)] shadow-[0_0_15px_var(--lime)] top-1/2 animate-bounce" />
                  )}
                </>
              ) : (
                <div className="text-center p-6 text-[var(--muted)]">
                  <UploadCloud className="w-12 h-12 mx-auto mb-2 text-[var(--line)]" />
                  <p className="text-sm font-medium">No image selected</p>
                </div>
              )}

              {/* Click to change overlay button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[var(--ink)]/80 text-[var(--white)] text-xs font-semibold backdrop-blur-sm border border-[var(--line)]/20 hover:bg-[var(--ink)] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-[var(--lime)]" />
                Change Image
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Controls & Quick Samples */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] block">
                Quick Specimen Samples (Or upload your own):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_LEAF_IMAGES.map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer text-xs ${
                      previewUrl === sample.url
                        ? 'border-[var(--lime)] bg-[var(--surface)] ring-2 ring-[var(--lime)]'
                        : 'border-[var(--line)] bg-[var(--bg-page)] hover:border-[var(--forest)]'
                    }`}
                  >
                    <div className="font-bold text-[var(--ink)] truncate">{sample.name}</div>
                    <div className="text-[10px] text-[var(--muted)]">{sample.crop}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 px-4 rounded-full border border-[var(--line)] bg-[var(--bg-page)] text-xs font-bold text-[var(--ink)] hover:bg-[var(--surface-alt)] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-[var(--forest)]" />
                Upload from Phone / Camera
              </button>

              <Button
                variant="primary"
                onClick={handleScan}
                disabled={diagnoseMutation.isPending || !previewUrl}
                loading={diagnoseMutation.isPending}
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-1 text-[var(--ink)]" />
                Analyze Leaf Health
              </Button>
            </div>

            <div className="text-[11px] text-[var(--muted)] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-[var(--forest)] shrink-0" />
              <span>
                Works offline with local agronomist heuristic classification when internet bandwidth is limited.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DIAGNOSIS RESULTS CARD (When completed) */}
      {diagnosis && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--ink)] text-[var(--white)] p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--lime)] text-[var(--ink)]">
                  {diagnosis.confidence}% Confidence
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--danger)] text-[var(--white)]">
                  {diagnosis.severity} Severity
                </span>
                <span className="text-xs text-[var(--muted)]">
                  Identified in {diagnosis.crop_type}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[var(--white)] tracking-tight">
                {diagnosis.issue_name}
              </h3>
              {diagnosis.hindi_name && (
                <div className="text-sm font-semibold text-[var(--lime)]">
                  हिंदी नाम: {diagnosis.hindi_name}
                </div>
              )}
            </div>

            {/* MANDATORY EXPERT ESCALATION BUTTON */}
            <div className="flex sm:flex-col items-center sm:items-end gap-2">
              <Button
                variant="accent"
                onClick={() => setIsExpertModalOpen(true)}
                className="font-bold shadow-md cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 mr-1 text-[var(--ink)]" />
                Ask an expert
              </Button>
              {diagnosis.expert_review_requested && (
                <span className="text-[11px] text-[var(--lime)] font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Expert Dispatched
                </span>
              )}
            </div>
          </div>

          {/* MANDATORY DISCLAIMER BANNER (MUST BE ALWAYS SHOWN) */}
          <div className="p-4 rounded-xl border border-[var(--line)]/30 bg-[var(--surface-alt)]/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--warning)]/20 text-[var(--warning)]">
                <HelpCircle className="w-5 h-5 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--white)]">
                  AI guess, confirm with an expert
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Field conditions vary. Have an ICAR/KVK-certified agronomist review symptoms before taking action.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsExpertModalOpen(true)}
              className="text-xs font-bold text-[var(--lime)] hover:underline whitespace-nowrap hidden sm:inline-block cursor-pointer"
            >
              Verify with Doctor &rarr;
            </button>
          </div>

          {/* Symptoms & Cause */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[var(--surface-alt)]/5 border border-[var(--line)]/20 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--lime)]">
                Observed Symptoms
              </span>
              <p className="text-xs sm:text-sm text-[var(--white)]/90 leading-relaxed">
                {diagnosis.symptoms}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--surface-alt)]/5 border border-[var(--line)]/20 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--lime)]">
                Pathogen / Cause
              </span>
              <p className="text-xs sm:text-sm text-[var(--white)]/90 leading-relaxed">
                {diagnosis.cause}
              </p>
            </div>
          </div>

          {/* Treatment Options */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--white)] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[var(--lime)]" />
              Recommended Treatment Protocols
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Chemical */}
              <div className="p-4 rounded-xl bg-[var(--surface-alt)]/5 border border-[var(--line)]/20 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--surface-alt)]/20 text-[var(--lime)]">
                  Chemical (Foliar)
                </span>
                <p className="text-xs text-[var(--white)]/90 leading-relaxed">
                  {diagnosis.treatment_options.chemical}
                </p>
              </div>

              {/* Organic */}
              <div className="p-4 rounded-xl bg-[var(--surface-alt)]/5 border border-[var(--line)]/20 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--surface-alt)]/20 text-[var(--lime)]">
                  Organic Alternative
                </span>
                <p className="text-xs text-[var(--white)]/90 leading-relaxed">
                  {diagnosis.treatment_options.organic}
                </p>
              </div>

              {/* Preventive */}
              <div className="p-4 rounded-xl bg-[var(--surface-alt)]/5 border border-[var(--line)]/20 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--surface-alt)]/20 text-[var(--lime)]">
                  Preventive Care
                </span>
                <p className="text-xs text-[var(--white)]/90 leading-relaxed">
                  {diagnosis.treatment_options.preventive}
                </p>
              </div>
            </div>
          </div>

          {/* MANDATORY MARKETPLACE PRODUCT MAPPING SECTION: "Buy recommended treatment" */}
          <div className="pt-6 border-t border-[var(--line)]/20 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base sm:text-lg font-black text-[var(--white)] tracking-tight">
                  Buy recommended treatment
                </h4>
                <p className="text-xs text-[var(--muted)]">
                  Direct from verified agri-dealers with genuine batch certificates.
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-[var(--lime)] text-[var(--ink)]">
                {diagnosis.linked_products.length} Products Matched
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {diagnosis.linked_products.map((product) => {
                const isAdded = addedProductIds[product.id]
                return (
                  <div
                    key={product.id}
                    className="p-4 rounded-xl border border-[var(--line)]/20 bg-[var(--bg-page)] text-[var(--ink)] flex flex-col justify-between space-y-3 transition-transform hover:-translate-y-0.5 shadow-sm"
                  >
                    <div className="flex gap-3 items-start">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg border border-[var(--line)] bg-[var(--surface)] shrink-0"
                      />
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--forest)] block">
                          {product.brand}
                        </span>
                        <h5 className="text-xs sm:text-sm font-bold text-[var(--ink)] line-clamp-2 leading-tight">
                          {product.name}
                        </h5>
                        <div className="text-[11px] text-[var(--muted)]">{product.unit}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between">
                      <div>
                        <div className="text-sm font-black text-[var(--ink)]">
                          ₹{product.price}
                        </div>
                        {product.mrp > product.price && (
                          <div className="text-[10px] text-[var(--muted)] line-through">
                            ₹{product.mrp}
                          </div>
                        )}
                      </div>

                      <Button
                        variant={isAdded ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => handleAddToCart(product.id)}
                        disabled={addToCart.isPending || isAdded}
                        className="cursor-pointer"
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1 text-[var(--forest)]" />
                            Added
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Escalation Modal */}
      <ExpertEscalateModal
        isOpen={isExpertModalOpen}
        onClose={() => setIsExpertModalOpen(false)}
        diagnosis={diagnosis}
      />
    </div>
  )
}
