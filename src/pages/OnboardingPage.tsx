import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  User,
  MapPin,
  Trees,
  Check,
  Globe,
} from 'lucide-react'
import {
  LayoutShell,
  SectionTitle,
  Card,
  Input,
  Select,
  Button,
  Badge,
  Toast,
} from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import {
  SEEDED_STATES,
  SOIL_TYPES,
  WATER_SOURCES,
  CROP_OPTIONS,
} from '@/lib/data/locations'

export const OnboardingPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { saveOnboarding, profile, farm } = useAuth()

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Form State initialized from existing profile or defaults
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>(
    (profile?.language as 'en' | 'hi') || (i18n.language.startsWith('hi') ? 'hi' : 'en')
  )

  const [selectedState, setSelectedState] = useState(farm?.state || 'Punjab')
  const [selectedDistrict, setSelectedDistrict] = useState(farm?.district || 'Ludhiana')
  const [selectedVillage, setSelectedVillage] = useState(farm?.village || 'Samrala')

  const [landSize, setLandSize] = useState(farm?.land_size ? String(farm.land_size) : '5.0')
  const [landUnit, setLandUnit] = useState<'acre' | 'bigha'>(farm?.land_unit || 'acre')
  const [soilType, setSoilType] = useState(farm?.soil_type || SOIL_TYPES[0])
  const [waterSource, setWaterSource] = useState(farm?.water_source || WATER_SOURCES[0])

  const [selectedCrops, setSelectedCrops] = useState<string[]>(
    farm?.crops && farm.crops.length > 0 ? farm.crops : ['wheat', 'rice']
  )

  // Derived location dropdown options
  const stateOptions = useMemo(
    () => SEEDED_STATES.map((s) => ({ value: s.state, label: s.state })),
    []
  )

  const activeStateData = useMemo(
    () => SEEDED_STATES.find((s) => s.state === selectedState) || SEEDED_STATES[0],
    [selectedState]
  )

  const districtOptions = useMemo(
    () => activeStateData.districts.map((d) => ({ value: d.name, label: d.name })),
    [activeStateData]
  )

  const activeDistrictData = useMemo(
    () => activeStateData.districts.find((d) => d.name === selectedDistrict) || activeStateData.districts[0],
    [activeStateData, selectedDistrict]
  )

  const villageOptions = useMemo(
    () => (activeDistrictData ? activeDistrictData.villages.map((v) => ({ value: v, label: v })) : []),
    [activeDistrictData]
  )

  const soilOptions = useMemo(
    () => SOIL_TYPES.map((s) => ({ value: s, label: s })),
    []
  )

  const waterOptions = useMemo(
    () => WATER_SOURCES.map((w) => ({ value: w, label: w })),
    []
  )

  // Step 1 Validation
  const validateStep1 = () => {
    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMessage(t('onboarding.nameError'))
      return false
    }
    setErrorMessage('')
    return true
  }

  // Step 2 Validation
  const validateStep2 = () => {
    if (!selectedState || !selectedDistrict || !selectedVillage) {
      setErrorMessage('Please select state, district, and village')
      return false
    }
    setErrorMessage('')
    return true
  }

  // Step 3 Validation
  const validateStep3 = () => {
    const num = parseFloat(landSize)
    if (isNaN(num) || num <= 0) {
      setErrorMessage(t('onboarding.landSizeError'))
      return false
    }
    setErrorMessage('')
    return true
  }

  // Step 4 Validation & Finish
  const validateStep4 = () => {
    if (selectedCrops.length === 0) {
      setErrorMessage(t('onboarding.cropsError'))
      return false
    }
    setErrorMessage('')
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    if (step === 3 && !validateStep3()) return
    setStep((prev) => Math.min(4, prev + 1))
  }

  const handlePrev = () => {
    setErrorMessage('')
    setStep((prev) => Math.max(1, prev - 1))
  }

  const handleToggleCrop = (cropId: string) => {
    setSelectedCrops((prev) =>
      prev.includes(cropId) ? prev.filter((id) => id !== cropId) : [...prev, cropId]
    )
  }

  const handleFinish = async () => {
    if (!validateStep4()) return

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const res = await saveOnboarding(
        {
          full_name: fullName.trim(),
          language: selectedLanguage,
        },
        {
          state: selectedState,
          district: selectedDistrict,
          village: selectedVillage,
          land_size: parseFloat(landSize),
          land_unit: landUnit,
          soil_type: soilType,
          water_source: waterSource,
          crops: selectedCrops,
        }
      )

      if (res.success) {
        navigate('/profile', { replace: true })
      } else {
        setErrorMessage(res.error || 'Calibration save failed')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Progress percentage calculation
  const progressPercent = (step / 4) * 100

  return (
    <LayoutShell showFooter={false}>
      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-16 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-4 text-center items-center">
          <Badge variant="lime" dot pulsing>
            {t('onboarding.stepBadge', { current: step, total: 4 })}
          </Badge>

          <SectionTitle
            size="lg"
            title={t('onboarding.title')}
            subtitle={t('onboarding.subtitle')}
            contrast="light"
            align="center"
          />

          {/* Lime Progress Bar */}
          <div className="w-full max-w-md bg-surface-alt h-2.5 rounded-pill overflow-hidden border border-line">
            <div
              className="bg-lime h-full rounded-pill transition-all duration-300 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Wizard Card Container */}
        <Card variant="ink" className="flex flex-col gap-8 border-forest shadow-2xl">
          {errorMessage && (
            <Toast
              variant="danger"
              title="Calibration Notice"
              description={errorMessage}
              onClose={() => setErrorMessage('')}
            />
          )}

          {/* ==================================================================
              STEP 1: PERSONAL & LANGUAGE
              ================================================================== */}
          {step === 1 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-forest">
                <div className="w-10 h-10 rounded-pill bg-forest flex items-center justify-center text-lime">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">
                    {t('onboarding.step1Title')}
                  </h3>
                  <p className="text-xs text-muted">
                    {t('onboarding.step1Desc')}
                  </p>
                </div>
              </div>

              <Input
                label={t('onboarding.nameLabel')}
                placeholder={t('onboarding.namePlaceholder')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoFocus
              />

              {/* Language Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-muted flex items-center gap-2">
                  <Globe className="w-4 h-4 text-lime" />
                  <span>{t('onboarding.langLabel')}</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLanguage('en')
                      i18n.changeLanguage('en')
                    }}
                    className={`min-h-touch p-4 rounded-input border transition-all text-left flex items-center justify-between ${
                      selectedLanguage === 'en'
                        ? 'bg-lime text-ink font-semibold border-lime shadow-md'
                        : 'bg-forest/20 text-white border-forest hover:border-lime'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-base font-semibold">English</span>
                      <span className={`text-xs ${selectedLanguage === 'en' ? 'text-ink/80' : 'text-muted'}`}>
                        Latin Script Interface
                      </span>
                    </div>
                    {selectedLanguage === 'en' && <Check className="w-5 h-5 text-ink" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLanguage('hi')
                      i18n.changeLanguage('hi')
                    }}
                    className={`min-h-touch p-4 rounded-input border transition-all text-left flex items-center justify-between ${
                      selectedLanguage === 'hi'
                        ? 'bg-lime text-ink font-semibold border-lime shadow-md'
                        : 'bg-forest/20 text-white border-forest hover:border-lime'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-base font-semibold">हिंदी (Hindi)</span>
                      <span className={`text-xs ${selectedLanguage === 'hi' ? 'text-ink/80' : 'text-muted'}`}>
                        देवनागरी लिपि इंटरफ़ेस
                      </span>
                    </div>
                    {selectedLanguage === 'hi' && <Check className="w-5 h-5 text-ink" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================
              STEP 2: LOCATION (STATE, DISTRICT, VILLAGE)
              ================================================================== */}
          {step === 2 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-forest">
                <div className="w-10 h-10 rounded-pill bg-forest flex items-center justify-center text-lime">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">
                    {t('onboarding.step2Title')}
                  </h3>
                  <p className="text-xs text-muted">
                    {t('onboarding.step2Desc')}
                  </p>
                </div>
              </div>

              <Select
                label={t('onboarding.stateLabel')}
                options={stateOptions}
                value={selectedState}
                onChange={(e) => {
                  const newState = e.target.value
                  setSelectedState(newState)
                  const match = SEEDED_STATES.find((s) => s.state === newState)
                  if (match && match.districts.length > 0) {
                    setSelectedDistrict(match.districts[0].name)
                    setSelectedVillage(match.districts[0].villages[0] || '')
                  }
                }}
              />

              <Select
                label={t('onboarding.districtLabel')}
                options={districtOptions}
                value={selectedDistrict}
                onChange={(e) => {
                  const newDistrict = e.target.value
                  setSelectedDistrict(newDistrict)
                  const match = activeStateData.districts.find((d) => d.name === newDistrict)
                  if (match && match.villages.length > 0) {
                    setSelectedVillage(match.villages[0])
                  }
                }}
              />

              <Select
                label={t('onboarding.villageLabel')}
                options={villageOptions}
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
              />
            </div>
          )}

          {/* ==================================================================
              STEP 3: LAND SIZE, SOIL TYPE, WATER SOURCE
              ================================================================== */}
          {step === 3 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-forest">
                <div className="w-10 h-10 rounded-pill bg-forest flex items-center justify-center text-lime">
                  <Trees className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">
                    {t('onboarding.step3Title')}
                  </h3>
                  <p className="text-xs text-muted">
                    {t('onboarding.step3Desc')}
                  </p>
                </div>
              </div>

              {/* Land Size and Acre/Bigha Toggle */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted">
                    {t('onboarding.landSizeLabel')}
                  </label>

                  {/* Acre/Bigha Pill Toggle */}
                  <div className="inline-flex items-center p-1 rounded-pill bg-forest/40 border border-forest">
                    <button
                      type="button"
                      onClick={() => setLandUnit('acre')}
                      className={`min-h-touch px-4 py-1 text-xs font-semibold rounded-pill transition-all ${
                        landUnit === 'acre'
                          ? 'bg-lime text-ink shadow-sm'
                          : 'text-muted hover:text-white'
                      }`}
                    >
                      {t('onboarding.unitAcre')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLandUnit('bigha')}
                      className={`min-h-touch px-4 py-1 text-xs font-semibold rounded-pill transition-all ${
                        landUnit === 'bigha'
                          ? 'bg-lime text-ink shadow-sm'
                          : 'text-muted hover:text-white'
                      }`}
                    >
                      {t('onboarding.unitBigha')}
                    </button>
                  </div>
                </div>

                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder={t('onboarding.landSizePlaceholder')}
                  value={landSize}
                  onChange={(e) => setLandSize(e.target.value)}
                />
              </div>

              <Select
                label={t('onboarding.soilLabel')}
                options={soilOptions}
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
              />

              <Select
                label={t('onboarding.waterLabel')}
                options={waterOptions}
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value)}
              />
            </div>
          )}

          {/* ==================================================================
              STEP 4: MAIN CROPS CURRENTLY GROWN (MULTI-SELECT CHIPS)
              ================================================================== */}
          {step === 4 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-forest">
                <div>
                  <h3 className="text-xl font-medium text-white">
                    {t('onboarding.step4Title')}
                  </h3>
                  <p className="text-xs text-muted">
                    {t('onboarding.step4Desc')}
                  </p>
                </div>
                <Badge variant="lime">
                  {t('onboarding.cropsSelected', { count: selectedCrops.length })}
                </Badge>
              </div>

              {/* Multi-select Chips Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CROP_OPTIONS.map((crop) => {
                  const isSelected = selectedCrops.includes(crop.id)
                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => handleToggleCrop(crop.id)}
                      className={`min-h-touch px-4 py-3 rounded-pill border transition-all duration-200 flex items-center justify-between text-sm select-none ${
                        isSelected
                          ? 'bg-lime text-ink font-semibold border-lime shadow-md'
                          : 'bg-forest/20 text-white border-forest hover:border-lime hover:bg-forest/30'
                      }`}
                    >
                      <span className="truncate">{crop.label}</span>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-ink shrink-0 ml-1.5" />
                      ) : (
                        <span className="w-2 h-2 rounded-pill bg-forest shrink-0 ml-1.5" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Wizard Action Controls */}
          <div className="pt-6 border-t border-forest flex items-center justify-between gap-4">
            {step > 1 ? (
              <Button
                variant="secondary"
                size="md"
                onClick={handlePrev}
                disabled={isSubmitting}
              >
                {t('onboarding.prev')}
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
              >
                {t('onboarding.next')}
              </Button>
            ) : (
              <Button
                variant="accent"
                size="md"
                onClick={handleFinish}
                loading={isSubmitting}
              >
                {t('onboarding.finish')}
              </Button>
            )}
          </div>
        </Card>
      </main>
    </LayoutShell>
  )
}
