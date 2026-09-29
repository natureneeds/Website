import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  Droplets,
  Plane,
  Gauge,
  CheckCircle2,
} from 'lucide-react'
import {
  Button,
  IconArrowButton,
  Card,
  StatCard,
  Input,
  Select,
  Badge,
  Modal,
  Toast,
  Skeleton,
  SectionTitle,
  TopNav,
  BottomNav,
} from '@/components/ui'

export const DesignSystemPage: React.FC = () => {
  const { t } = useTranslation()

  // Interactive state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeToast, setActiveToast] = useState<{
    title: string
    description: string
    variant: 'success' | 'warning' | 'danger' | 'info'
  } | null>(null)

  // Color tokens list for palette inspection (Exact Design Lock)
  const colorTokens = [
    { name: '--bg-page', bgClass: 'bg-bg-page', border: true, labelKey: 'tokens.bgPage' },
    { name: '--surface', bgClass: 'bg-surface', border: true, labelKey: 'tokens.surface' },
    { name: '--surface-alt', bgClass: 'bg-surface-alt', border: true, labelKey: 'tokens.surfaceAlt' },
    { name: '--ink', bgClass: 'bg-ink', border: false, labelKey: 'tokens.ink' },
    { name: '--forest', bgClass: 'bg-forest', border: false, labelKey: 'tokens.forest' },
    { name: '--lime', bgClass: 'bg-lime', border: false, labelKey: 'tokens.lime' },
    { name: '--lime-strong', bgClass: 'bg-lime-strong', border: false, labelKey: 'tokens.limeStrong' },
    { name: '--line', bgClass: 'bg-line', border: true, labelKey: 'tokens.line' },
    { name: '--muted', bgClass: 'bg-muted', border: false, labelKey: 'tokens.muted' },
    { name: '--white', bgClass: 'bg-white', border: true, labelKey: 'tokens.white' },
    { name: '--danger', bgClass: 'bg-danger', border: false, labelKey: 'tokens.danger' },
    { name: '--warning', bgClass: 'bg-warning', border: false, labelKey: 'tokens.warning' },
    { name: '--overlay', bgClass: 'bg-overlay', border: true, labelKey: 'tokens.overlay' },
  ]

  const cropOptions = [
    { value: 'wheat', label: t('forms.wheat') },
    { value: 'mustard', label: t('forms.mustard') },
    { value: 'rice', label: t('forms.rice') },
    { value: 'cotton', label: t('forms.cotton') },
  ]

  return (
    <div className="min-h-screen bg-bg-page text-ink font-sans pb-24 md:pb-16 selection:bg-lime selection:text-ink">
      {/* 1. Desktop Top Navigation */}
      <TopNav onQuickAction={() => setIsModalOpen(true)} />

      {/* Hero Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="lime" dot pulsing>
              {t('designSystem.badge')}
            </Badge>
            <span className="text-xs text-muted font-mono tracking-wider">
              DESIGN LOCK VERIFIED
            </span>
          </div>

          <SectionTitle
            size="hero"
            title={t('designSystem.title')}
            subtitle={t('designSystem.subtitle')}
            contrast="light"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-16">
        {/* ====================================================================
            SECTION 1: COLOR TOKENS
            ==================================================================== */}
        <section className="flex flex-col gap-6">
          <SectionTitle
            size="md"
            title={t('designSystem.tokensSection')}
            subtitle={t('designSystem.tokensDesc')}
            contrast="light"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {colorTokens.map((token) => (
              <div
                key={token.name}
                className="flex flex-col gap-2 p-4 rounded-card bg-surface border border-line transition-transform hover:-translate-y-1 shadow-sm"
              >
                <div
                  className={`w-full h-16 rounded-input ${token.bgClass} ${
                    token.border ? 'border border-line' : ''
                  } shadow-inner`}
                />
                <span className="text-xs font-mono font-semibold text-forest">
                  {token.name}
                </span>
                <span className="text-xs text-muted">
                  {t(token.labelKey)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================================
            SECTION 2: TYPOGRAPHY SCALE
            ==================================================================== */}
        <section className="flex flex-col gap-6">
          <SectionTitle
            size="md"
            title={t('designSystem.typographySection')}
            subtitle={t('designSystem.typographyDesc')}
            contrast="light"
          />

          <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-card bg-surface border border-line shadow-sm">
            <div className="flex flex-col gap-1 pb-4 border-b border-line">
              <span className="text-xs font-mono text-muted">hero-lg (72px) / light</span>
              <p className="text-hero-lg font-light text-ink leading-none">
                {t('typography.heroDisplay')}
              </p>
            </div>

            <div className="flex flex-col gap-1 pb-4 border-b border-line">
              <span className="text-xs font-mono text-muted">hero (64px) / light</span>
              <p className="text-hero font-light text-ink">
                {t('typography.sectionTitle')}
              </p>
            </div>

            <div className="flex flex-col gap-1 pb-4 border-b border-line">
              <span className="text-xs font-mono text-muted">2xl (24px) / medium</span>
              <p className="text-2xl font-medium text-ink">
                {t('typography.cardTitle')}
              </p>
            </div>

            <div className="flex flex-col gap-1 pb-4 border-b border-line">
              <span className="text-xs font-mono text-muted">body (16px) / regular</span>
              <p className="text-body text-ink/80 leading-relaxed max-w-3xl">
                {t('typography.bodyText')}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono text-muted">xs (12px) / mono</span>
              <p className="text-xs font-mono tracking-widest uppercase text-forest font-semibold">
                {t('typography.monoTag')}
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================================
            SECTION 3: DUAL CANVAS VERIFICATION (LIGHT VS INK)
            ==================================================================== */}
        <section className="flex flex-col gap-6">
          <SectionTitle
            size="md"
            title={t('designSystem.sideBySideTitle')}
            subtitle={t('designSystem.sideBySideDesc')}
            contrast="light"
          />

          {/* DUAL CANVAS CONTAINER */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* --------------------------------------------------------------
                CANVAS A: LIGHT CANVAS (--bg-page / --surface-alt)
                -------------------------------------------------------------- */}
            <div className="rounded-card bg-surface-alt border border-line p-6 sm:p-8 flex flex-col gap-12 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-line">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-pill bg-forest" />
                  <span className="text-sm font-semibold tracking-wide uppercase text-ink">
                    {t('designSystem.creamSurface')}
                  </span>
                </div>
                <Badge variant="forest">bg-bg-page</Badge>
              </div>

              {/* Buttons on Light */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-mono uppercase tracking-wider text-muted">
                  {t('designSystem.buttonsSection')}
                </span>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    {t('buttons.primary')}
                  </Button>
                  <Button variant="secondary">
                    {t('buttons.secondary')}
                  </Button>
                  <Button variant="accent">
                    {t('buttons.accent')}
                  </Button>
                  <IconArrowButton size="lg" aria-label="Micro Action" />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="primary" loading>
                    {t('buttons.loading')}
                  </Button>
                  <Button variant="secondary" disabled>
                    {t('buttons.disabled')}
                  </Button>
                </div>
              </div>

              {/* Cards on Light: Alternating Surface and Ink */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-mono uppercase tracking-wider text-muted">
                  {t('designSystem.cardsSection')}
                </span>
                <div className="flex flex-col gap-4">
                  <Card variant="surface">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase font-semibold text-forest">
                        {t('cards.creamMeta')}
                      </span>
                      <Badge variant="forest">{t('badges.active')}</Badge>
                    </div>
                    <h3 className="text-xl font-medium text-ink mb-1">
                      {t('cards.creamTitle')}
                    </h3>
                    <p className="text-sm text-ink/80 leading-relaxed">
                      {t('cards.creamText')}
                    </p>
                  </Card>

                  <Card variant="ink">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase font-semibold text-white/80">
                        {t('cards.inkMeta')}
                      </span>
                      <Badge variant="lime" dot>
                        {t('badges.active')}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-medium text-white mb-1">
                      {t('cards.inkTitle')}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {t('cards.inkText')}
                    </p>
                  </Card>
                </div>
              </div>

              {/* StatCards on Light */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-mono uppercase tracking-wider text-muted">
                  {t('designSystem.statCardsSection')}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard
                    variant="surface"
                    label={t('statCards.moisture')}
                    value="42.8%"
                    subtitle={t('statCards.optimalMoisture')}
                    icon={<Droplets className="w-5 h-5" />}
                    trend={{ value: '+3.2%', direction: 'up' }}
                  />
                  <StatCard
                    variant="lime"
                    label={t('statCards.droneSweep')}
                    value="100%"
                    subtitle={t('statCards.sensorsCalibrated')}
                    icon={<Plane className="w-5 h-5 text-ink fill-ink" />}
                    trend={{ value: 'ACTIVE', direction: 'neutral' }}
                  />
                </div>
              </div>

              {/* Form Controls on Light */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-mono uppercase tracking-wider text-muted">
                  {t('designSystem.formSection')}
                </span>
                <div className="flex flex-col gap-4">
                  <Input
                    label={t('forms.farmerName')}
                    placeholder={t('forms.farmerNamePlaceholder')}
                    helperText={t('forms.farmerNameHelper')}
                  />
                  <Select
                    label={t('forms.cropSelection')}
                    options={cropOptions}
                    helperText={t('forms.cropHelper')}
                  />
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------
                CANVAS B: INK CANVAS (--ink)
                -------------------------------------------------------------- */}
            <div className="rounded-card bg-ink border border-forest/60 p-6 sm:p-8 flex flex-col gap-12 shadow-xl text-white">
              <div className="flex items-center justify-between pb-4 border-b border-forest/60">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-pill bg-lime" />
                  <span className="text-sm font-semibold tracking-wide uppercase text-white">
                    {t('designSystem.darkSurface')}
                  </span>
                </div>
                <Badge variant="lime">bg-ink</Badge>
              </div>

              {/* Buttons on Dark */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-mono uppercase tracking-wider text-muted">
                  {t('designSystem.buttonsSection')}
                </span>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    {t('buttons.primary')}
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-white border-forest hover:border-white hover:text-white"
                  >
                    {t('buttons.secondary')}
                  </Button>
                  <Button variant="accent">
                    {t('buttons.accent')}
                  </Button>
                  <IconArrowButton size="lg" aria-label="Micro Action" />
                </div>
              </div>

              {/* Cards on Dark */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-mono uppercase tracking-wider text-muted">
                  {t('designSystem.cardsSection')}
                </span>
                <div className="flex flex-col gap-4">
                  <Card variant="surface">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase font-semibold text-forest">
                        {t('cards.creamMeta')}
                      </span>
                      <Badge variant="forest">{t('badges.active')}</Badge>
                    </div>
                    <h3 className="text-xl font-medium text-ink mb-1">
                      {t('cards.creamTitle')}
                    </h3>
                    <p className="text-sm text-ink/80 leading-relaxed">
                      {t('cards.creamText')}
                    </p>
                  </Card>

                  <Card variant="ink">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase font-semibold text-white/80">
                        {t('cards.inkMeta')}
                      </span>
                      <Badge variant="lime" dot>
                        {t('badges.active')}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-medium text-white mb-1">
                      {t('cards.inkTitle')}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {t('cards.inkText')}
                    </p>
                  </Card>
                </div>
              </div>

              {/* StatCards on Dark */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-mono uppercase tracking-wider text-muted">
                  {t('designSystem.statCardsSection')}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard
                    variant="ink"
                    label={t('statCards.nitrogenIndex')}
                    value="94.2"
                    subtitle={t('statCards.targetIndex')}
                    icon={<Activity className="w-5 h-5 text-white" />}
                    trend={{ value: '+5.4%', direction: 'up' }}
                  />
                  <StatCard
                    variant="lime"
                    label={t('statCards.canopyCoverage')}
                    value="88%"
                    subtitle={t('statCards.optimalBiomass')}
                    icon={<Gauge className="w-5 h-5 text-ink fill-ink" />}
                    trend={{ value: 'TARGET', direction: 'neutral' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            SECTION 4: BADGES & STATUS INDICATORS
            ==================================================================== */}
        <section className="flex flex-col gap-6">
          <SectionTitle
            size="md"
            title={t('designSystem.badgeSection')}
            subtitle={t('designSystem.badgeDesc')}
            contrast="light"
          />

          <div className="flex flex-wrap items-center gap-3 p-6 sm:p-8 rounded-card bg-surface border border-line shadow-sm">
            <Badge variant="lime" dot pulsing>
              {t('badges.active')}
            </Badge>
            <Badge variant="forest">
              {t('badges.pending')}
            </Badge>
            <Badge variant="warning" dot>
              {t('badges.warning')}
            </Badge>
            <Badge variant="danger" dot>
              {t('badges.danger')}
            </Badge>
            <Badge variant="neutral">
              {t('badges.neutral')}
            </Badge>
            <Badge variant="ink" dot>
              {t('badges.ink')}
            </Badge>
          </div>
        </section>

        {/* ====================================================================
            SECTION 5: FEEDBACK (MODAL & TOAST)
            ==================================================================== */}
        <section className="flex flex-col gap-6">
          <SectionTitle
            size="md"
            title={t('designSystem.feedbackSection')}
            subtitle={t('designSystem.feedbackDesc')}
            contrast="light"
          />

          <div className="flex flex-wrap items-center gap-4 p-6 sm:p-8 rounded-card bg-surface border border-line shadow-sm">
            <Button variant="accent" onClick={() => setIsModalOpen(true)}>
              {t('feedback.openModal')}
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                setActiveToast({
                  variant: 'success',
                  title: t('feedback.telemetrySynced'),
                  description: t('feedback.toastDesc'),
                })
              }
            >
              {t('feedback.triggerToast')}
            </Button>
          </div>

          {/* Active Toast Notification */}
          {activeToast && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <Toast
                variant={activeToast.variant}
                title={activeToast.title}
                description={activeToast.description}
                onClose={() => setActiveToast(null)}
              />
            </div>
          )}
        </section>

        {/* ====================================================================
            SECTION 6: SKELETON LOADERS
            ==================================================================== */}
        <section className="flex flex-col gap-6">
          <SectionTitle
            size="md"
            title={t('designSystem.skeletonSection')}
            subtitle={t('designSystem.skeletonDesc')}
            contrast="light"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 rounded-card bg-surface border border-line shadow-sm">
            <div className="flex flex-col gap-3">
              <Skeleton variant="circle" />
              <Skeleton variant="text" />
              <Skeleton variant="text" className="w-2/3" />
            </div>
            <div className="flex flex-col gap-3">
              <Skeleton variant="input" />
              <Skeleton variant="button" />
            </div>
            <Skeleton variant="card" className="h-32" />
          </div>
        </section>
      </main>

      {/* Accessible Interactive Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('modal.title')}
        description={t('modal.description')}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              {t('modal.cancel')}
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setIsModalOpen(false)
                setActiveToast({
                  variant: 'success',
                  title: t('modal.confirmed'),
                  description: t('modal.confirmedDesc'),
                })
              }}
            >
              {t('modal.proceed')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-3 p-3 rounded-input bg-surface-alt border border-line text-sm text-ink">
            <CheckCircle2 className="w-5 h-5 text-forest shrink-0" />
            <span>{t('modal.payloadStatus')}</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            {t('modal.footerNotice')}
          </p>
        </div>
      </Modal>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
