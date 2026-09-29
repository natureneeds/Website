import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Sprout,
  Layers,
  ShieldAlert,
  Wrench,
  Droplets,
  HelpCircle,
  Mic,
  MicOff,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Check,
  AlertTriangle,
  Scale,
  ExternalLink,
} from 'lucide-react'
import {
  LayoutShell,
  SectionTitle,
  Card,
  Button,
  Badge,
  Modal,
} from '@/components/ui'
import {
  getProductRecommendations,
  type GuidedAnswers,
  type RankedProduct,
} from '@/lib/api/recommendations'

export const FindWhatINeedPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  // Stepper state (1 to 6) or 'results'
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Guided Form Answers
  const [answers, setAnswers] = useState<GuidedAnswers>({
    need: 'not_sure',
    crop: 'Wheat',
    farmSize: '2 - 5 Acres',
    problemOrGoal: '',
    budgetRange: 'any',
    preference: 'any',
    freeText: '',
  })

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false)
  const [speechError, setSpeechError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  // Results & Comparison State
  const [rankedResults, setRankedResults] = useState<RankedProduct[]>([])
  const [isLlmActive, setIsLlmActive] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)

  // Web Speech API Initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = i18n.language.startsWith('hi') ? 'hi-IN' : 'en-IN'

      recognition.onstart = () => {
        setIsListening(true)
        setSpeechError(null)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setAnswers((prev) => ({
          ...prev,
          freeText: prev.freeText ? `${prev.freeText} ${transcript}` : transcript,
        }))
        setIsListening(false)
      }

      recognition.onerror = (event: any) => {
        setIsListening(false)
        if (event.error !== 'no-speech') {
          setSpeechError(`Speech recognition error: ${event.error}`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [i18n.language])

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setSpeechError(t('find.voiceNotSupported'))
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      try {
        recognitionRef.current.lang = i18n.language.startsWith('hi') ? 'hi-IN' : 'en-IN'
        recognitionRef.current.start()
      } catch (err) {
        console.warn('Voice restart notice:', err)
      }
    }
  }

  // Handle option selection with auto-advance feel
  const handleSelectOption = <K extends keyof GuidedAnswers>(key: K, value: GuidedAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  // Execute recommendation query
  const handleGenerateRecommendations = async () => {
    setIsSubmitting(true)
    try {
      const response = await getProductRecommendations(answers)
      if (response.success && response.results) {
        setRankedResults(response.results)
        setIsLlmActive(response.llm_rerank_active)
        setCurrentStep(7) // Step 7 is Results
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Toggle compare selection (up to 3 products)
  const toggleCompare = (productId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      }
      if (prev.length >= 3) {
        return prev
      }
      return [...prev, productId]
    })
  }

  const restartFlow = () => {
    setCurrentStep(1)
    setRankedResults([])
    setSelectedForCompare([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Check if pesticide warning is needed
  const hasPesticideResults =
    answers.need === 'pest_control' ||
    rankedResults.some((p) => p.category_id === 'c3')

  // Total conversational questions
  const totalQuestions = 6
  const progressPercent = Math.min(100, Math.round((currentStep / totalQuestions) * 100))

  return (
    <LayoutShell>
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-14 flex flex-col gap-8">
        {/* ====================================================================
            HEADER & STEP PROGRESS BAR
            ==================================================================== */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <Badge variant="forest">
              {currentStep <= 6 ? t('find.step', { current: currentStep, total: totalQuestions }) : 'Personalized Recommendations'}
            </Badge>

            {currentStep <= 6 && (
              <span className="text-xs text-muted font-mono uppercase tracking-wider">
                {progressPercent}% Complete
              </span>
            )}
          </div>

          <SectionTitle
            size="lg"
            title={currentStep <= 6 ? t('find.title') : t('find.resultsTitle')}
            subtitle={currentStep <= 6 ? t('find.subtitle') : t('find.resultsSubtitle')}
            contrast="light"
          />

          {/* Lime Progress Bar */}
          {currentStep <= 6 && (
            <div className="w-full bg-surface-alt h-2 rounded-pill overflow-hidden border border-line mt-2">
              <div
                className="bg-lime h-full rounded-pill transition-all duration-300 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* ====================================================================
            CONVERSATIONAL QUESTIONS (STEPS 1 - 6)
            ==================================================================== */}
        {currentStep <= 6 && (
          <div className="flex flex-col gap-8">
            {/* STEP 1: What do you need? */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-2xl font-medium tracking-tight text-ink mb-1">
                    {t('find.step1Title')}
                  </h3>
                  <p className="text-sm text-muted">
                    {t('find.step1Subtitle')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { id: 'seeds', label: 'Seeds (बीज)', icon: Sprout, desc: 'Certified wheat, rice, mustard, hybrid seeds' },
                    { id: 'fertilizer', label: 'Fertilizer (उर्वरक)', icon: Layers, desc: 'NPK, Urea, DAP, bio-fertilizers & micronutrients' },
                    { id: 'pest_control', label: 'Pest Control (कीटनाशक)', icon: ShieldAlert, desc: 'Fungicides, insecticides, weedicides & bio-spray' },
                    { id: 'tool', label: 'Tools & Sprayers (उपकरण)', icon: Wrench, desc: 'Knapsack battery sprayers, pruning, farm tools' },
                    { id: 'irrigation', label: 'Irrigation (सिंचाई)', icon: Droplets, desc: 'Drip lines, sprinkler nozzles, booster pumps' },
                    { id: 'not_sure', label: 'Not Sure (निदान सहायता)', icon: HelpCircle, desc: 'Describe symptoms and let AI agronomist decide' },
                  ].map((item) => {
                    const Icon = item.icon
                    const isSelected = answers.need === item.id
                    return (
                      <Card
                        key={item.id}
                        variant={isSelected ? 'surface' : 'surface'}
                        onClick={() => handleSelectOption('need', item.id as any)}
                        className={`flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
                          isSelected
                            ? 'border-2 border-forest shadow-md bg-surface scale-[1.02]'
                            : 'border border-line hover:border-forest/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-12 h-12 rounded-pill flex items-center justify-center ${
                            isSelected ? 'bg-forest text-white' : 'bg-surface-alt text-forest border border-line'
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          {isSelected && <Badge variant="lime" dot>Selected</Badge>}
                        </div>
                        <h4 className="text-lg font-medium text-ink">{item.label}</h4>
                        <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Which crop? */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-2xl font-medium tracking-tight text-ink mb-1">
                    {t('find.step2Title')}
                  </h3>
                  <p className="text-sm text-muted">
                    {t('find.step2Subtitle')}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    'Wheat (गेहूँ)',
                    'Basmati Rice (धान)',
                    'Mustard (सरसों)',
                    'Bt Cotton (कपास)',
                    'Soybean (सोयाबीन)',
                    'Sugarcane (गन्ना)',
                    'Potato (आलू)',
                    'Onion (प्याज)',
                    'Maize (मक्का)',
                    'Vegetables (सब्जियां)',
                    'Pulses (दालें)',
                    'Other / Multiple',
                  ].map((cropName) => {
                    const isSelected = answers.crop === cropName
                    return (
                      <button
                        key={cropName}
                        type="button"
                        onClick={() => handleSelectOption('crop', cropName)}
                        className={`min-h-touch p-4 rounded-card border text-left transition-all flex items-center justify-between select-none ${
                          isSelected
                            ? 'bg-lime text-ink font-semibold border-lime shadow-md scale-[1.02]'
                            : 'bg-surface-alt text-ink border-line hover:border-forest hover:bg-surface'
                        }`}
                      >
                        <span className="text-sm font-medium">{cropName}</span>
                        {isSelected && <Check className="w-4 h-4 text-ink shrink-0 ml-2" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Farm size? */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-2xl font-medium tracking-tight text-ink mb-1">
                    {t('find.step3Title')}
                  </h3>
                  <p className="text-sm text-muted">
                    {t('find.step3Subtitle')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: '< 2 Acres', title: 'Smallholding', desc: 'Under 2 Acres (1-5 Bigha). Single pack dosage.' },
                    { id: '2 - 5 Acres', title: 'Medium Farm', desc: '2 - 5 Acres. Multi-pack or 20kg bulk units.' },
                    { id: '5 - 10 Acres', title: 'Large Field', desc: '5 - 10 Acres. High-capacity battery spray scale.' },
                    { id: '> 10 Acres', title: 'Commercial', desc: 'Above 10 Acres. Wholesale bulk farm supply.' },
                  ].map((item) => {
                    const isSelected = answers.farmSize === item.id
                    return (
                      <Card
                        key={item.id}
                        variant="surface"
                        onClick={() => handleSelectOption('farmSize', item.id)}
                        className={`flex flex-col justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-2 border-forest shadow-md bg-surface scale-[1.02]'
                            : 'border border-line hover:border-forest/40'
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-mono font-semibold text-forest uppercase">
                            {item.title}
                          </span>
                          <h4 className="text-2xl font-bold text-ink">{item.id}</h4>
                          <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="pt-4 mt-4 border-t border-line flex items-center justify-end">
                            <Badge variant="lime" dot>Selected</Badge>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: Problem or Goal? */}
            {currentStep === 4 && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-2xl font-medium tracking-tight text-ink mb-1">
                    {t('find.step4Title')}
                  </h3>
                  <p className="text-sm text-muted">
                    {t('find.step4Subtitle')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: 'Yellow Leaves & Chlorosis', desc: 'Nitrogen, zinc or iron deficiency in foliage' },
                    { id: 'Aphids, Jassids & Sucking Pests', desc: 'Insects attacking leaf undersides and shoots' },
                    { id: 'Rust, Blight & Fungal Spots', desc: 'Brown/black fungal blotches or powdery mildew' },
                    { id: 'Low Tillering & Weak Roots', desc: 'Slow vegetative growth and weak stems' },
                    { id: 'Sowing & Seed Inoculation', desc: 'Germination boost, seed treatment before planting' },
                    { id: 'Weed Competition', desc: 'Fast post-emergent or pre-emergent weed suppression' },
                  ].map((item) => {
                    const isSelected = answers.problemOrGoal === item.id
                    return (
                      <Card
                        key={item.id}
                        variant="surface"
                        onClick={() => handleSelectOption('problemOrGoal', item.id)}
                        className={`flex flex-col gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-2 border-forest shadow-md bg-surface scale-[1.02]'
                            : 'border border-line hover:border-forest/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-semibold text-ink">{item.id}</h4>
                          {isSelected && <Check className="w-4 h-4 text-forest shrink-0" />}
                        </div>
                        <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: Budget Range? */}
            {currentStep === 5 && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-2xl font-medium tracking-tight text-ink mb-1">
                    {t('find.step5Title')}
                  </h3>
                  <p className="text-sm text-muted">
                    {t('find.step5Subtitle')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: 'under_1000', label: 'Under ₹1,000', desc: 'Budget-friendly bio-inputs, trial packs & supplements.' },
                    { id: '1000_3000', label: '₹1,000 – ₹3,000', desc: 'Standard acre treatments, certified seed bags & DAP.' },
                    { id: '3000_7000', label: '₹3,000 – ₹7,000', desc: 'Multi-acre spray combos, knapsack battery pumps.' },
                    { id: 'any', label: 'No Limit / Best Efficacy', desc: 'Prioritize highest efficacy, top yield & durability.' },
                  ].map((item) => {
                    const isSelected = answers.budgetRange === item.id
                    return (
                      <Card
                        key={item.id}
                        variant="surface"
                        onClick={() => handleSelectOption('budgetRange', item.id as any)}
                        className={`flex flex-col justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-2 border-forest shadow-md bg-surface scale-[1.02]'
                            : 'border border-line hover:border-forest/40'
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                          <h4 className="text-xl font-bold text-ink">{item.label}</h4>
                          <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="pt-4 mt-4 border-t border-line flex items-center justify-end">
                            <Badge variant="lime" dot>Selected</Badge>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 6: Preference? */}
            {currentStep === 6 && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-2xl font-medium tracking-tight text-ink mb-1">
                    {t('find.step6Title')}
                  </h3>
                  <p className="text-sm text-muted">
                    {t('find.step6Subtitle')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'organic', label: 'Bio / Organic (जैविक)', desc: 'Zero toxic chemical residues, neem-based, earthworm safe.' },
                    { id: 'chemical', label: 'Conventional / Chemical (रासायनिक)', desc: 'Fast-acting synthetic active ingredients for severe infestations.' },
                    { id: 'any', label: 'Any / Best Agronomic Match', desc: 'Recommend highest yield and efficacy regardless of formulation.' },
                  ].map((item) => {
                    const isSelected = answers.preference === item.id
                    return (
                      <Card
                        key={item.id}
                        variant="surface"
                        onClick={() => handleSelectOption('preference', item.id as any)}
                        className={`flex flex-col justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-2 border-forest shadow-md bg-surface scale-[1.02]'
                            : 'border border-line hover:border-forest/40'
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                          <h4 className="text-lg font-bold text-ink">{item.label}</h4>
                          <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="pt-4 mt-4 border-t border-line flex items-center justify-end">
                            <Badge variant="lime" dot>Selected</Badge>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ================================================================
                FREE-TEXT BOX & VOICE INPUT CONTAINER (Requirement 2)
                ================================================================ */}
            <Card variant="surface" className="flex flex-col gap-4 border border-line shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="text-sm font-semibold text-ink">
                  {t('find.freeTextLabel')}
                </label>

                {/* Voice Input Button (Web Speech API) */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill text-xs font-semibold transition-all border select-none ${
                    isListening
                      ? 'bg-danger text-white border-danger animate-pulse'
                      : 'bg-surface-alt text-forest border-line hover:border-forest'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>{t('find.voiceBtnListening')}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-forest" />
                      <span>{t('find.voiceBtnDefault')}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <textarea
                  rows={2}
                  value={answers.freeText || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, freeText: e.target.value }))}
                  placeholder={t('find.freeTextPlaceholder')}
                  className="w-full rounded-input bg-surface-alt border border-line px-4 py-3 text-body text-ink placeholder:text-muted focus:outline-none focus:border-forest resize-none"
                />
              </div>

              {speechError && (
                <p className="text-xs text-danger font-medium">{speechError}</p>
              )}
            </Card>

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-line">
              {currentStep > 1 ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  {t('find.prevBtn')}
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 6 ? (
                <Button
                  variant="accent"
                  size="md"
                  onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1))}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  {t('find.nextBtn')}
                </Button>
              ) : (
                <Button
                  variant="accent"
                  size="lg"
                  loading={isSubmitting}
                  onClick={handleGenerateRecommendations}
                  icon={<Sparkles className="w-5 h-5" />}
                >
                  {t('find.findResultsBtn')}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================
            RESULTS PAGE (Requirement 4 & 5)
            ==================================================================== */}
        {currentStep === 7 && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            {/* Top Toolbar: Re-run & Comparison status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-card bg-surface border border-line shadow-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="lime" dot>
                  {rankedResults.length} Matched Products
                </Badge>
                {isLlmActive && (
                  <Badge variant="forest">AI Rerank Active</Badge>
                )}
                <span className="text-xs text-muted font-mono">
                  Crop: {answers.crop} • Need: {answers.need}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {selectedForCompare.length > 1 && (
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => setIsCompareOpen(true)}
                    icon={<Scale className="w-4 h-4" />}
                  >
                    {t('find.compareBtn', { count: selectedForCompare.length })}
                  </Button>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={restartFlow}
                  icon={<RotateCcw className="w-4 h-4" />}
                >
                  {t('find.restartBtn')}
                </Button>
              </div>
            </div>

            {/* PESTICIDE SAFETY NOTE (Requirement 5: Lime-outlined Card) */}
            {hasPesticideResults && (
              <Card
                variant="surface"
                className="border-2 border-lime flex items-start gap-4 p-5 md:p-6 shadow-md"
              >
                <div className="w-10 h-10 rounded-pill bg-surface-alt border border-lime flex items-center justify-center text-forest shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-forest" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-forest">
                      {t('find.pesticideWarningTitle')}
                    </span>
                    <Badge variant="lime">MANDATORY PROTOCOL</Badge>
                  </div>
                  <h4 className="text-lg font-bold text-ink tracking-tight">
                    {t('find.pesticideWarningText')}
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    {t('find.pesticideWarningDesc')}
                  </p>
                </div>
              </Card>
            )}

            {/* Ranked Products Grid (Top 6) */}
            {rankedResults.length === 0 ? (
              <Card variant="surface" className="flex flex-col items-center justify-center p-12 text-center gap-4">
                <h3 className="text-2xl font-medium text-ink">{t('find.noResultsTitle')}</h3>
                <p className="text-body text-muted max-w-md">{t('find.noResultsDesc')}</p>
                <Button variant="accent" size="sm" onClick={restartFlow}>
                  {t('find.restartBtn')}
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rankedResults.map((product) => {
                  const isChecked = selectedForCompare.includes(product.id)
                  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100)

                  return (
                    <Card
                      key={product.id}
                      variant="surface"
                      className="flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl relative overflow-hidden"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Top Rank Badge & Compare Checkbox */}
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="forest">
                            No. {product.rank} Recommended
                          </Badge>

                          {/* Compare Toggle Pill */}
                          <button
                            type="button"
                            onClick={() => toggleCompare(product.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-pill transition-all border select-none ${
                              isChecked
                                ? 'bg-lime text-ink border-lime shadow-sm'
                                : 'bg-surface-alt text-muted border-line hover:text-ink hover:border-forest'
                            }`}
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>{isChecked ? 'Comparing' : 'Compare'}</span>
                          </button>
                        </div>

                        {/* Image Container */}
                        <div
                          className="relative w-full h-44 rounded-input bg-surface-alt overflow-hidden flex items-center justify-center border border-line cursor-pointer"
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          <img
                            src={product.images[0] || '/images/marketplace.bmp'}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 text-xs rounded-pill bg-ink/80 text-white font-medium backdrop-blur-sm">
                            {product.brand}
                          </span>
                          {discountPercent > 0 && (
                            <div className="absolute top-2.5 right-2.5">
                              <Badge variant="lime">{discountPercent}% OFF</Badge>
                            </div>
                          )}
                        </div>

                        {/* Product Title */}
                        <div>
                          <h4
                            onClick={() => navigate(`/product/${product.id}`)}
                            className="text-lg font-medium tracking-tight text-ink group-hover:text-forest transition-colors line-clamp-2 cursor-pointer"
                          >
                            {product.name}
                          </h4>
                          <span className="text-xs text-muted block mt-1">
                            Unit: {product.unit}
                          </span>
                        </div>

                        {/* "Why This Fits" Callout */}
                        <div className="p-3 rounded-input bg-surface-alt border border-line flex flex-col gap-1">
                          <span className="text-[11px] font-semibold text-forest uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-forest" />
                            {t('find.whyFitsLabel')}
                          </span>
                          <p className="text-xs text-ink/85 leading-relaxed">
                            {product.why_fits}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Pricing & Navigation Link */}
                      <div className="pt-4 mt-4 border-t border-line flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold tracking-tight text-ink">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          {product.mrp > product.price && (
                            <span className="text-xs text-muted line-through">
                              ₹{product.mrp.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/product/${product.id}`)}
                          icon={<ExternalLink className="w-3.5 h-3.5" />}
                        >
                          View
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            SPEC COMPARISON TABLE MODAL (Requirement 4)
            ==================================================================== */}
        <Modal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          title={t('find.compareModalTitle')}
          description="Direct side-by-side comparison of selected agronomic inputs."
          footer={
            <Button variant="secondary" size="sm" onClick={() => setIsCompareOpen(false)}>
              Close Comparison
            </Button>
          }
        >
          <div className="overflow-x-auto no-scrollbar py-2">
            <table className="w-full text-left text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-line">
                  <th className="py-3 px-3 text-xs uppercase tracking-wider text-muted font-semibold w-1/4">
                    Attribute
                  </th>
                  {selectedForCompare.map((id) => {
                    const prod = rankedResults.find((p) => p.id === id)
                    if (!prod) return null
                    return (
                      <th key={id} className="py-3 px-3 w-1/3">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-ink line-clamp-1">
                            {prod.name}
                          </span>
                          <span className="text-xs text-forest font-mono">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr>
                  <td className="py-2.5 px-3 text-xs text-muted font-semibold">Brand</td>
                  {selectedForCompare.map((id) => (
                    <td key={id} className="py-2.5 px-3 font-medium text-ink">
                      {rankedResults.find((p) => p.id === id)?.brand}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-xs text-muted font-semibold">Packaging Unit</td>
                  {selectedForCompare.map((id) => (
                    <td key={id} className="py-2.5 px-3 text-ink">
                      {rankedResults.find((p) => p.id === id)?.unit}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-xs text-muted font-semibold">Stock Status</td>
                  {selectedForCompare.map((id) => (
                    <td key={id} className="py-2.5 px-3 text-ink">
                      <Badge variant="lime" dot>In Stock</Badge>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-xs text-muted font-semibold">Crop Compatibility</td>
                  {selectedForCompare.map((id) => (
                    <td key={id} className="py-2.5 px-3 text-xs text-ink">
                      {(rankedResults.find((p) => p.id === id)?.crop_tags || []).join(', ')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-xs text-muted font-semibold">Agronomic Specs</td>
                  {selectedForCompare.map((id) => {
                    const p = rankedResults.find((prod) => prod.id === id)
                    return (
                      <td key={id} className="py-2.5 px-3 text-xs text-ink/90">
                        {p?.specs && Object.entries(p.specs).slice(0, 3).map(([k, v]) => (
                          <div key={k} className="capitalize">
                            <strong>{k.replace(/_/g, ' ')}:</strong> {v}
                          </div>
                        ))}
                      </td>
                    )
                  })}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-xs text-muted font-semibold">Why Recommended</td>
                  {selectedForCompare.map((id) => (
                    <td key={id} className="py-2.5 px-3 text-xs text-forest font-medium">
                      {rankedResults.find((p) => p.id === id)?.why_fits}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Modal>
      </main>
    </LayoutShell>
  )
}
