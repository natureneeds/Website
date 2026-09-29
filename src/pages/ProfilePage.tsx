import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  User,
  MapPin,
  Trees,
  Lock,
  Edit3,
  Check,
  X,
  ShieldCheck,
  ShieldAlert,
  LogOut,
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

export const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { profile, farm, user, updateProfile, testRls, signOut } = useAuth()

  // Editing state
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<{
    variant: 'success' | 'danger'
    title: string
    description: string
  } | null>(null)

  // Form Fields
  const [editName, setEditName] = useState('')
  const [editLang, setEditLang] = useState<'en' | 'hi'>('en')
  const [editState, setEditState] = useState('')
  const [editDistrict, setEditDistrict] = useState('')
  const [editVillage, setEditVillage] = useState('')
  const [editLandSize, setEditLandSize] = useState<number>(1.0)
  const [editLandUnit, setEditLandUnit] = useState<'acre' | 'bigha'>('acre')
  const [editSoilType, setEditSoilType] = useState('')
  const [editWaterSource, setEditWaterSource] = useState('')
  const [editCrops, setEditCrops] = useState<string[]>([])

  // RLS Probe State
  const [targetUserId, setTargetUserId] = useState('usr_foreign_test_9999')
  const [isProbing, setIsProbing] = useState(false)
  const [rlsResult, setRlsResult] = useState<{ blocked: boolean; message: string } | null>(null)

  // Sync state with active profile & farm
  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || '')
      setEditLang(profile.language || 'en')
    }
    if (farm) {
      setEditState(farm.state || '')
      setEditDistrict(farm.district || '')
      setEditVillage(farm.village || '')
      setEditLandSize(farm.land_size || 1.0)
      setEditLandUnit(farm.land_unit || 'acre')
      setEditSoilType(farm.soil_type || 'Loamy')
      setEditWaterSource(farm.water_source || 'Canal')
      setEditCrops(farm.crops || [])
    }
  }, [profile, farm])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const res = await updateProfile(
        {
          full_name: editName.trim(),
          language: editLang,
        },
        farm
          ? {
              state: editState,
              district: editDistrict,
              village: editVillage.trim(),
              land_size: editLandSize,
              land_unit: editLandUnit,
              soil_type: editSoilType,
              water_source: editWaterSource,
              crops: editCrops,
            }
          : undefined
      )

      if (res.success) {
        setIsEditing(false)
        setToastMessage({
          variant: 'success',
          title: t('profilePage.updateSuccess'),
          description: 'Profile & Farm parameters synchronized to database.',
        })
      } else {
        setToastMessage({
          variant: 'danger',
          title: 'Update Failed',
          description: res.error || 'Could not update profile',
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleRunRlsProbe = async () => {
    setIsProbing(true)
    setRlsResult(null)
    try {
      const res = await testRls(targetUserId.trim())
      setRlsResult(res)
    } finally {
      setIsProbing(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const stateOptions = SEEDED_STATES.map((s) => ({ value: s.state, label: s.state }))
  const districtOptions = (
    SEEDED_STATES.find((s) => s.state === editState)?.districts || []
  ).map((d) => ({ value: d.name, label: d.name }))
  const soilOptions = SOIL_TYPES.map((s) => ({ value: s, label: s }))
  const waterOptions = WATER_SOURCES.map((w) => ({ value: w, label: w }))

  return (
    <LayoutShell>
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 md:py-16 flex flex-col gap-10">
        {/* Header with Title and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-line">
          <SectionTitle
            size="lg"
            title={t('profilePage.title')}
            subtitle={t('profilePage.subtitle')}
            contrast="light"
          />

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {!isEditing ? (
              <Button
                variant="accent"
                size="md"
                onClick={() => setIsEditing(true)}
                icon={<Edit3 className="w-4 h-4" />}
              >
                {t('profilePage.editProfile')}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  icon={<X className="w-4 h-4" />}
                >
                  {t('profilePage.cancel')}
                </Button>
                <Button
                  variant="accent"
                  size="md"
                  onClick={handleSaveProfile}
                  loading={isSaving}
                  icon={<Check className="w-4 h-4" />}
                >
                  {t('profilePage.saveChanges')}
                </Button>
              </div>
            )}

            <Button
              variant="secondary"
              size="md"
              onClick={handleSignOut}
              icon={<LogOut className="w-4 h-4" />}
              aria-label={t('profilePage.signOut')}
            >
              <span className="hidden sm:inline">{t('profilePage.signOut')}</span>
            </Button>
          </div>
        </div>

        {/* Floating Notification */}
        {toastMessage && (
          <div className="animate-in fade-in duration-200">
            <Toast
              variant={toastMessage.variant}
              title={toastMessage.title}
              description={toastMessage.description}
              onClose={() => setToastMessage(null)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ==================================================================
              CARD 1: FARMER CREDENTIALS & IDENTITY (SURFACE CARD)
              ================================================================== */}
          <Card variant="surface" className="flex flex-col gap-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-pill bg-surface-alt border border-line flex items-center justify-center text-forest">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-medium text-ink">
                  {t('profilePage.farmerInfo')}
                </h3>
              </div>
              <Badge variant="lime" dot>
                Verified ID
              </Badge>
            </div>

            {isEditing ? (
              <div className="flex flex-col gap-4">
                <Input
                  label={t('profilePage.fullName')}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-muted">
                    {t('profilePage.language')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditLang('en')
                        i18n.changeLanguage('en')
                      }}
                      className={`min-h-touch px-4 py-2 text-sm font-semibold rounded-pill border transition-all ${
                        editLang === 'en'
                          ? 'bg-lime text-ink border-lime shadow-sm'
                          : 'bg-surface-alt text-forest border-line'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditLang('hi')
                        i18n.changeLanguage('hi')
                      }}
                      className={`min-h-touch px-4 py-2 text-sm font-semibold rounded-pill border transition-all ${
                        editLang === 'hi'
                          ? 'bg-lime text-ink border-lime shadow-sm'
                          : 'bg-surface-alt text-forest border-line'
                      }`}
                    >
                      हिंदी
                    </button>
                  </div>
                </div>

                <Select
                  label={t('profilePage.state')}
                  options={stateOptions}
                  value={editState}
                  onChange={(e) => {
                    setEditState(e.target.value)
                    setEditDistrict('')
                  }}
                />

                <Select
                  label={t('profilePage.district')}
                  options={districtOptions}
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                  disabled={!editState}
                />

                <Input
                  label={t('profilePage.village')}
                  value={editVillage}
                  onChange={(e) => setEditVillage(e.target.value)}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-sm divide-y divide-line">
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted">{t('profilePage.fullName')}</span>
                  <span className="text-body font-medium text-ink">
                    {profile?.full_name || 'Agri-Partner'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-muted">{t('profilePage.phone')}</span>
                  <span className="text-body font-mono text-forest font-semibold">
                    +91 {profile?.phone || user?.phone || '9999999999'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-muted">{t('profilePage.language')}</span>
                  <span className="capitalize font-medium text-ink">
                    {profile?.language === 'hi' ? 'हिंदी (Hindi)' : 'English'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-muted">{t('profilePage.location')}</span>
                  <span className="font-medium text-ink text-right">
                    {farm?.village ? `${farm.village}, ` : ''}
                    {farm?.district ? `${farm.district}, ` : ''}
                    {farm?.state || 'Punjab'}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* ==================================================================
              CARD 2: FARM PROFILE & CROPS (INK CARD)
              ================================================================== */}
          <Card variant="ink" className="flex flex-col gap-6 border-forest/60 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-forest/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-pill bg-forest flex items-center justify-center text-white">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-medium text-white">
                  {t('profilePage.farmInfo')}
                </h3>
              </div>
              <Badge variant="forest">Active Land</Badge>
            </div>

            {isEditing ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted">
                      {t('profilePage.acreage')}
                    </label>
                    <div className="inline-flex items-center p-0.5 rounded-pill bg-forest/40 border border-forest">
                      <button
                        type="button"
                        onClick={() => setEditLandUnit('acre')}
                        className={`min-h-touch px-3 py-1 text-xs font-semibold rounded-pill ${
                          editLandUnit === 'acre' ? 'bg-lime text-ink shadow-sm' : 'text-muted'
                        }`}
                      >
                        Acre
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditLandUnit('bigha')}
                        className={`min-h-touch px-3 py-1 text-xs font-semibold rounded-pill ${
                          editLandUnit === 'bigha' ? 'bg-lime text-ink shadow-sm' : 'text-muted'
                        }`}
                      >
                        Bigha
                      </button>
                    </div>
                  </div>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={editLandSize}
                    onChange={(e) => setEditLandSize(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <Select
                  label={t('profilePage.soil')}
                  options={soilOptions}
                  value={editSoilType}
                  onChange={(e) => setEditSoilType(e.target.value)}
                />

                <Select
                  label={t('profilePage.water')}
                  options={waterOptions}
                  value={editWaterSource}
                  onChange={(e) => setEditWaterSource(e.target.value)}
                />

                {/* Crops Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-muted">
                    {t('profilePage.crops')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CROP_OPTIONS.map((crop) => {
                      const isSelected = editCrops.includes(crop.id)
                      return (
                        <button
                          key={crop.id}
                          type="button"
                          onClick={() => {
                            setEditCrops((prev) =>
                              prev.includes(crop.id)
                                ? prev.filter((c) => c !== crop.id)
                                : [...prev, crop.id]
                            )
                          }}
                          className={`min-h-touch px-3 py-2 rounded-pill text-xs font-semibold border flex items-center justify-between ${
                            isSelected
                              ? 'bg-lime text-ink border-lime shadow-sm'
                              : 'bg-forest/20 text-white border-forest'
                          }`}
                        >
                          <span className="truncate">{crop.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 ml-1 text-ink" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-sm divide-y divide-forest/40">
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted">{t('profilePage.landHolding')}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-white">
                      {farm?.land_size || 5}
                    </span>
                    <span className="text-muted uppercase text-xs">
                      {farm?.land_unit || 'Acre'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-muted">{t('profilePage.soil')}</span>
                  <Badge variant="forest">{farm?.soil_type || 'Alluvial'}</Badge>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-muted">{t('profilePage.water')}</span>
                  <Badge variant="forest">{farm?.water_source || 'Canal + Borewell'}</Badge>
                </div>

                <div className="flex flex-col gap-2 py-2">
                  <span className="text-muted">{t('profilePage.crops')}</span>
                  <div className="flex flex-wrap gap-2">
                    {(farm?.crops && farm.crops.length > 0
                      ? farm.crops
                      : ['Wheat', 'Mustard', 'Basmati Rice']
                    ).map((c: string) => (
                      <Badge key={c} variant="lime">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* ====================================================================
            ROW LEVEL SECURITY (RLS) VERIFICATION PROBE PANEL (SURFACE CARD)
            ==================================================================== */}
        <Card variant="surface" className="flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-line">
            <div className="w-10 h-10 rounded-pill bg-surface-alt border border-line flex items-center justify-center text-forest">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-medium text-ink">
                  {t('profilePage.rlsSectionTitle')}
                </h3>
                <Badge variant="forest" dot>
                  Security Gate
                </Badge>
              </div>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {t('profilePage.rlsSectionDesc')}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full flex-1">
              <Input
                label={t('profilePage.targetUser')}
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="usr_foreign_test_9999"
              />
            </div>

            <div className="sm:self-end w-full sm:w-auto">
              <Button
                variant="accent"
                size="md"
                onClick={handleRunRlsProbe}
                loading={isProbing}
                icon={<Trees className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                {t('profilePage.runProbe')}
              </Button>
            </div>
          </div>

          {/* RLS Output Display */}
          {rlsResult && (
            <div
              className={`p-4 rounded-card border flex items-start gap-3 animate-in fade-in duration-200 ${
                rlsResult.blocked
                  ? 'bg-surface-alt border-line text-ink'
                  : 'bg-warning/20 border-warning text-ink'
              }`}
            >
              {rlsResult.blocked ? (
                <ShieldCheck className="w-6 h-6 text-forest shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-warning shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tracking-wide text-ink">
                    {rlsResult.blocked
                      ? 'RLS Enforcement Verified'
                      : 'RLS Advisory'}
                  </span>
                  <Badge variant={rlsResult.blocked ? 'forest' : 'warning'}>
                    {rlsResult.blocked ? 'ISOLATED' : 'CHECK'}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-muted leading-relaxed">
                  {rlsResult.message}
                </p>
              </div>
            </div>
          )}
        </Card>
      </main>
    </LayoutShell>
  )
}
