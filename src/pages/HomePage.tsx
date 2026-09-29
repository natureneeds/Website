import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ShoppingBag,
  Calendar,
  Activity,
  Tractor,
  Coins,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Droplets,
  DollarSign,
  Package,
  Sprout,
} from 'lucide-react'
import {
  LayoutShell,
  SectionTitle,
  Card,
  Button,
  Badge,
  IconArrowButton,
} from '@/components/ui'
import { ProductCard } from '@/components/marketplace/ProductCard'

const HeroNotchedCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 500, h: 180 })

  useEffect(() => {
    if (!cardRef.current) return
    const el = cardRef.current
    const update = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setSize({ w: Math.round(rect.width), h: Math.round(rect.height) })
      }
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { w, h } = size
  const R = 32 // Outer corner radius
  const notchR = 30 // Concentric arc radius around button
  const fillet = 16 // Smooth concave fillet radius

  const pathData = `
    M ${R} 0
    H ${Math.max(R, w - 32 - notchR - fillet)}
    A ${fillet} ${fillet} 0 0 0 ${w - 32 - notchR} ${fillet}
    V 32
    A ${notchR} ${notchR} 0 0 0 ${w - 32} ${32 + notchR}
    H ${w - fillet}
    A ${fillet} ${fillet} 0 0 0 ${w} ${32 + notchR + fillet}
    V ${Math.max(32 + notchR + fillet, h - R)}
    A ${R} ${R} 0 0 1 ${w - R} ${h}
    H ${R}
    A ${R} ${R} 0 0 1 0 ${h - R}
    V ${R}
    A ${R} ${R} 0 0 1 ${R} 0
    Z
  `

  return (
    <div
      ref={cardRef}
      className="relative w-full min-h-[175px] p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 group transition-all"
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-xs"
        viewBox={`0 0 ${w} ${h}`}
      >
        <path
          d={pathData}
          fill="var(--surface)"
          stroke="var(--line)"
          strokeWidth="1"
        />
      </svg>
      {children}
    </div>
  )
}

export const HomePage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // 10-step journey state: show 4 cards visible at a time
  const [journeyIndex, setJourneyIndex] = useState(0)
  const totalSteps = 10
  const visibleStepsCount = 4
  const maxIndex = totalSteps - visibleStepsCount // 0 to 6

  // 6 Core Modules configuration alternating strictly between surface (cream) and ink
  const modules = [
    {
      id: 'marketplace',
      title: t('modules.marketplaceTitle'),
      desc: t('modules.marketplaceDesc'),
      icon: ShoppingBag,
      variant: 'surface' as const,
      badgeVariant: 'forest' as const,
      meta: 'Seed & Inputs',
      href: '/marketplace',
    },
    {
      id: 'planner',
      title: t('modules.cropPlannerTitle'),
      desc: t('modules.cropPlannerDesc'),
      icon: Calendar,
      variant: 'ink' as const,
      badgeVariant: 'lime' as const,
      meta: 'AI Advisory',
      href: '/crop-planner',
    },
    {
      id: 'care',
      title: t('modules.cropCareTitle'),
      desc: t('modules.cropCareDesc'),
      icon: Activity,
      variant: 'surface' as const,
      badgeVariant: 'forest' as const,
      meta: 'Drone & Spray',
      href: '/crop-care',
    },
    {
      id: 'rentals',
      title: t('modules.rentLabourTitle'),
      desc: t('modules.rentLabourDesc'),
      icon: Tractor,
      variant: 'ink' as const,
      badgeVariant: 'lime' as const,
      meta: 'Hourly / Daily',
      href: '/rent-labour',
    },
    {
      id: 'finance',
      title: t('modules.financeTitle'),
      desc: t('modules.financeDesc'),
      icon: Coins,
      variant: 'surface' as const,
      badgeVariant: 'forest' as const,
      meta: '0% Subsidy',
      href: '/finance',
    },
    {
      id: 'sell',
      title: t('modules.sellProfitTitle'),
      desc: t('modules.sellProfitDesc'),
      icon: TrendingUp,
      variant: 'ink' as const,
      badgeVariant: 'lime' as const,
      meta: 'Live Mandi',
      href: '/sell',
    },
  ]

  // Journey steps iconography
  const journeyIcons = [
    Search,
    Calendar,
    Droplets,
    ShoppingBag,
    Activity,
    Tractor,
    Coins,
    Package,
    TrendingUp,
    DollarSign,
  ]

  const handlePrevJourney = () => {
    setJourneyIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNextJourney = () => {
    setJourneyIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  // Active 4 visible steps
  const visibleStepIndices = Array.from(
    { length: visibleStepsCount },
    (_, i) => journeyIndex + i
  )

  return (
    <LayoutShell>
      {/* ====================================================================
          1. HERO SECTION WITH INTEGRATED FLOATING TOP BAR (DESKTOP VIEW)
          Matching exact reference layout:
          - Aerial terrace field background inside rounded container
          - Floating 3-pill top bar (Logo Pill, Nav + Search + Cart Pill, Contact Pill)
          - Display Headline: "Part of future Agriculture" with circular wheat emblem
          - "Shop All ──────>" button
          - Floating Lime 4.9★ rating card with overlapping avatars
          - Two bottom preview cards: DJI Agras T50 drone and DJI Agras T50 telemetry controller
          ==================================================================== */}
      <div className="w-full bg-[var(--bg-page)] px-3 sm:px-5 lg:px-6 pb-3 sm:pb-5 lg:pb-6 pt-[34px] sm:pt-[40px] lg:pt-[43px]">
        <section className="relative w-full rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] overflow-hidden min-h-[720px] lg:min-h-[820px] flex flex-col justify-between p-4 sm:p-6 lg:p-8 xl:p-10 shadow-lg border border-[var(--line)]">
          {/* Background Aerial Terraced Farm Field Photo */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/hero-aerial-terrace.jpg"
              alt="Lush Green Agricultural Terraced Farm Field"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-center filter contrast-105"
            />
            {/* Subtle scrim for crystal-clear readability */}
            <div className="absolute inset-0 bg-[var(--overlay)]/30 backdrop-blur-[0.5px]" />
          </div>

          {/* 2. HERO MIDDLE SECTION: HEADLINE & FLOATING LIME RATING CARD */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-24 sm:pt-28 lg:pt-32 pb-10 sm:pb-14 lg:pb-16">
            {/* Left Headline & Action Button */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px] font-normal tracking-tight text-white leading-[1.04]">
                Part of future <br />
                <span className="inline-flex items-center gap-3 sm:gap-4 flex-wrap">
                  Agriculture
                  <span className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full border border-white/70 backdrop-blur-xs text-white shrink-0">
                    <Sprout className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </span>
                </span>
              </h1>

              {/* Shop All Pill Button */}
              <div>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-4 px-7 py-3 rounded-full border border-white/70 text-white font-medium text-sm sm:text-base hover:bg-white hover:text-[var(--ink)] transition-all group backdrop-blur-xs"
                >
                  <span>Shop All</span>
                  <span className="w-12 sm:w-16 h-[1px] bg-white group-hover:bg-[var(--ink)] transition-colors relative after:absolute after:right-0 after:-top-1 after:w-2 after:h-2 after:border-t after:border-r after:border-current after:rotate-45" />
                </Link>
              </div>
            </div>

            {/* Right: Floating Lime Rating Card */}
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <div className="w-full max-w-[340px] rounded-[32px] bg-[var(--lime)] p-6 lg:p-7 shadow-2xl flex flex-col justify-between gap-6 relative overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
                {/* Top: 4.9★ and reviews text */}
                <div className="space-y-1">
                  <div className="text-4xl sm:text-5xl font-extrabold text-white flex items-center gap-1.5 tracking-tight">
                    <span>4.9</span>
                    <span className="text-3xl sm:text-4xl text-white">★</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-white/95">
                    1200+ Customers Review
                  </p>
                </div>

                {/* Overlapping Customer Avatars */}
                <div className="flex items-center -space-x-3 pt-1">
                  <img
                    src="/images/customer-avatars.jpg"
                    alt="Satisfied Customers"
                    className="w-28 h-10 object-cover rounded-full border-2 border-white shadow-sm"
                  />
                </div>

                {/* Bottom Row: Google 'G' Logo + Forest Spark Badge */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-3xl font-black text-white tracking-tighter">
                    G
                  </span>
                  <div className="w-12 h-12 rounded-full bg-[var(--forest)] text-[var(--lime)] flex items-center justify-center font-bold text-2xl shadow-md">
                    ✱
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. HERO BOTTOM PREVIEW CARDS */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4">
            {/* Card 1: DJI Agras T50 Drone with Top-Right Notched Cutout Button */}
            <HeroNotchedCard>
              {/* Scalloped Notched Action Button (Top-Right, Outside the box but still in the div) */}
              <Link
                to="/rent"
                className="absolute top-1.5 right-1.5 w-12 h-12 rounded-full bg-[var(--lime)] text-[var(--forest)] flex items-center justify-center font-black text-lg shadow-md hover:scale-110 transition-transform z-20"
                title="View Drone Details"
              >
                <span className="leading-none select-none">↗</span>
              </Link>

              {/* Drone Image container */}
              <div className="w-full sm:w-44 h-36 rounded-2xl bg-white border border-[var(--line)] overflow-hidden flex items-center justify-center shrink-0 p-2 z-10">
                <img
                  src="/images/agri-drone-t50.jpg"
                  alt="DJI Agras T50 Agricultural Drone"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Description & Pill Button */}
              <div className="flex flex-col gap-2 flex-1 sm:pr-14 z-10">
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--forest)]">
                  DJI Agras T50
                </h3>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  Fully automatic and manual operation orchard mode variable rate
                </p>
                <div className="pt-1">
                  <Link
                    to="/rent"
                    className="inline-flex items-center px-4 py-1.5 rounded-full border border-[var(--forest)] text-[var(--forest)] text-xs font-semibold hover:bg-[var(--forest)] hover:text-white transition-all tracking-wide"
                  >
                    VIEW DETAILS
                  </Link>
                </div>
              </div>
            </HeroNotchedCard>

            {/* Card 2: DJI Agras T50 Smart Controller with Attached Capsule Button */}
            <div className="bg-[var(--surface)] p-5 sm:p-6 rounded-[32px] border border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden group hover:shadow-xl transition-all min-h-[175px]">
              {/* Description & Attached Capsule Pill Button */}
              <div className="flex flex-col gap-2 flex-1 order-2 sm:order-1">
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--forest)]">
                  DJI Agras T50
                </h3>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  Fully automatic and manual operation orchard mode variable rate
                </p>
                <div className="pt-2">
                  <Link
                    to="/rent"
                    className="inline-flex items-center group/btn"
                  >
                    <span className="px-5 py-2 rounded-l-full bg-[var(--forest)] text-white text-xs font-semibold hover:bg-[var(--ink)] transition-colors shadow-xs">
                      Explore More
                    </span>
                    <span className="w-8 h-8 rounded-r-full bg-[var(--forest)] text-[var(--lime)] border-l border-white/20 flex items-center justify-center font-bold text-sm shadow-xs group-hover/btn:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </Link>
                </div>
              </div>

              {/* Remote Controller Image */}
              <div className="w-full sm:w-44 h-36 rounded-2xl bg-white border border-[var(--line)] overflow-hidden flex items-center justify-center shrink-0 p-2 order-1 sm:order-2">
                <img
                  src="/images/drone-remote-controller.jpg"
                  alt="DJI Agras T50 Smart Controller"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ====================================================================
          1.5 FEATURED AGRICULTURAL EQUIPMENT SHOWCASE
          Matching Reference Image 4:
          - 3 Product Cards with scalloped bottom-right cutout notch
          - Top-right discount badge (-30%, -25%)
          - Strikethrough pricing below cream image box
          - Pure token colors: var(--surface), var(--lime), var(--forest), var(--ink)
          ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-4 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--forest)] bg-[var(--surface-alt)] px-3 py-1 rounded-full border border-[var(--line)]">
              Machinery &amp; Precision Tech
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--ink)] mt-2">
              Featured Agricultural Equipment
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)]">
              Smart spraying drones, multispectral survey UAVs, and industrial field generators with verified warranty.
            </p>
          </div>
          <Link
            to="/market"
            className="inline-flex items-center gap-3 text-sm font-bold text-[var(--forest)] hover:text-[var(--ink)] transition-colors shrink-0 group"
          >
            <span>Shop All Equipment</span>
            <span className="w-8 h-[1px] bg-[var(--forest)] group-hover:w-12 transition-all relative after:absolute after:right-0 after:-top-1 after:w-2 after:h-2 after:border-t after:border-r after:border-current after:rotate-45" />
          </Link>
        </div>

        {/* 3 Featured Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <ProductCard
            id="agri-drone-t50"
            name="DJI Agras T50"
            image="/images/agri-drone-t50.jpg"
            price={1880}
            mrp={2100}
            badge="-30%"
            buttonVariant="lime"
            onClick={() => navigate('/market')}
          />
          <ProductCard
            id="dji-mavic-3m"
            name="DJI Mavic 3M"
            image="/images/dji-mavic-3m.jpg"
            price={1880}
            mrp={2100}
            badge="-25%"
            buttonVariant="surface"
            onClick={() => navigate('/market')}
          />
          <ProductCard
            id="generator-d6000i"
            name="Generator D6000i"
            image="/images/generator-d6000i.jpg"
            price={1880}
            mrp={2100}
            badge="-30%"
            buttonVariant="surface"
            onClick={() => navigate('/market')}
          />
        </div>
      </section>

      {/* ====================================================================
          2. MODULE CARDS SECTION: ROW OF 6 MODULES (INK & SURFACE VARIANTS)
          Cards alternate between --surface (cream) and --ink (black) only.
          ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 md:py-24 flex flex-col gap-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <SectionTitle
            size="lg"
            title={t('home.modulesTitle')}
            subtitle={t('home.modulesSubtitle')}
            contrast="light"
          />
          <Link to="/design-system" className="shrink-0">
            <Button variant="secondary" size="sm">
              {t('nav.designSystem')}
            </Button>
          </Link>
        </div>

        {/* 6 Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon
            const isSurface = mod.variant === 'surface'

            return (
              <Card
                key={mod.id}
                variant={mod.variant}
                className="flex flex-col justify-between group cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl relative overflow-hidden"
                onClick={() => navigate(mod.href)}
              >
                <div>
                  {/* Top Bar: Icon & Badge */}
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div
                      className={`w-12 h-12 rounded-pill flex items-center justify-center shrink-0 ${
                        isSurface
                          ? 'bg-surface-alt text-forest border border-line'
                          : 'bg-forest text-white'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <Badge variant={mod.badgeVariant}>{mod.meta}</Badge>
                  </div>

                  {/* Card Title */}
                  <h3
                    className={`text-2xl font-medium tracking-tight mb-2 ${
                      isSurface ? 'text-ink' : 'text-white'
                    }`}
                  >
                    {mod.title}
                  </h3>

                  {/* Card Description */}
                  <p
                    className={`text-body leading-relaxed ${
                      isSurface ? 'text-ink/80' : 'text-muted'
                    }`}
                  >
                    {mod.desc}
                  </p>
                </div>

                {/* Bottom Row: Micro Action Arrow Button */}
                <div
                  className={`pt-6 mt-6 border-t flex items-center justify-between ${
                    isSurface ? 'border-line' : 'border-forest/40'
                  }`}
                >
                  <span
                    className={`text-xs uppercase font-semibold tracking-wider ${
                      isSurface ? 'text-forest' : 'text-white/80'
                    }`}
                  >
                    {t('home.viewModule')}
                  </span>

                  <IconArrowButton
                    size="md"
                    aria-label={`Open ${mod.title}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(mod.href)
                    }}
                  />
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* ====================================================================
          3. HOW KISAN OS WORKS (10 STEPS, 4 VISIBLE AT A TIME)
          Page background is ALWAYS --bg-page (white). No dark page backgrounds.
          Cards alternate between --surface (cream) and --ink (black) only.
          ==================================================================== */}
      <section className="w-full bg-bg-page border-t border-line py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-10">
          {/* Header & Carousel Navigation Controls */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <SectionTitle
              size="lg"
              title={t('journey.title')}
              subtitle={t('journey.subtitle')}
              contrast="light"
            />

            {/* Prev / Next 4-Step Navigation */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-muted font-mono mr-2">
                {journeyIndex + 1}–{journeyIndex + visibleStepsCount} {t('journey.of')} {totalSteps}
              </span>

              <button
                type="button"
                onClick={handlePrevJourney}
                disabled={journeyIndex === 0}
                aria-label={t('journey.prev')}
                className="w-11 h-11 min-h-touch min-w-touch rounded-pill bg-surface-alt hover:bg-surface text-forest hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors focus:outline-none border border-line"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleNextJourney}
                disabled={journeyIndex >= maxIndex}
                aria-label={t('journey.next')}
                className="w-11 h-11 min-h-touch min-w-touch rounded-pill bg-lime hover:bg-lime-strong text-ink disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors focus:outline-none shadow-sm"
              >
                <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* 4 Cards Visible at a Time: Alternating between surface and ink */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleStepIndices.map((idx) => {
              const StepIcon = journeyIcons[idx]
              const stepNum = (idx + 1).toString().padStart(2, '0')
              const stepTitle = t(`journey.steps.${idx}.title`)
              const stepDesc = t(`journey.steps.${idx}.desc`)
              const isEven = idx % 2 === 0
              const cardVariant = isEven ? ('surface' as const) : ('ink' as const)

              return (
                <Card
                  key={idx}
                  variant={cardVariant}
                  className="flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-4">
                    {/* Step Number & Icon */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-mono font-bold px-3 py-1 rounded-pill ${
                          isEven
                            ? 'bg-forest text-white'
                            : 'bg-lime text-ink'
                        }`}
                      >
                        {stepNum}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-pill flex items-center justify-center ${
                          isEven
                            ? 'bg-surface-alt text-forest border border-line'
                            : 'bg-forest text-white'
                        }`}
                      >
                        <StepIcon className="w-4 h-4" />
                      </div>
                    </div>

                    <h4
                      className={`text-lg font-medium tracking-tight ${
                        isEven ? 'text-ink' : 'text-white'
                      }`}
                    >
                      {stepTitle}
                    </h4>

                    <p
                      className={`text-sm leading-relaxed ${
                        isEven ? 'text-muted' : 'text-muted'
                      }`}
                    >
                      {stepDesc}
                    </p>
                  </div>

                  <div
                    className={`pt-4 mt-4 border-t flex items-center justify-between text-xs ${
                      isEven ? 'border-line text-muted' : 'border-forest/40 text-muted'
                    }`}
                  >
                    <span>{t('journey.step')} {stepNum}</span>
                    <span className={`font-mono ${isEven ? 'text-forest font-semibold' : 'text-white'}`}>
                      Phase 1
                    </span>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Step Progress Indicators */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                aria-label={`Go to step window ${dotIdx + 1}`}
                onClick={() => setJourneyIndex(dotIdx)}
                className={`h-2 rounded-pill transition-all duration-200 ${
                  dotIdx === journeyIndex
                    ? 'w-8 bg-lime'
                    : 'w-2 bg-line hover:bg-forest/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </LayoutShell>
  )
}
