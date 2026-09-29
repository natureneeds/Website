import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sprout, Phone, ShieldCheck } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'

export const Footer: React.FC = () => {
  const { t } = useTranslation()

  const moduleLinks = [
    { href: '/marketplace', label: t('modules.marketplaceTitle') },
    { href: '/crop-planner', label: t('modules.cropPlannerTitle') },
    { href: '/crop-care', label: t('modules.cropCareTitle') },
    { href: '/rent-labour', label: t('modules.rentLabourTitle') },
    { href: '/finance', label: t('modules.financeTitle') },
    { href: '/sell', label: t('modules.sellProfitTitle') },
    { href: '/design-system', label: t('nav.designSystem') },
  ]

  return (
    <footer className="w-full bg-ink border-t border-forest/60 text-white pt-12 pb-24 lg:pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Brand Col */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/nature-needs-logo.png"
                alt="Nature Needs Logo"
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-forest/80 group-hover:scale-105 transition-transform"
              />
              <span className="text-xl font-bold tracking-tight text-white">
                {t('app.title')}
              </span>
            </Link>

            <p className="text-sm text-white/70 max-w-sm leading-relaxed">
              {t('footer.tagline')}
            </p>

            <div className="pt-2">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Module Links Col */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-wider text-forest font-bold">
              {t('footer.quickLinks')}
            </span>
            <ul className="flex flex-col gap-2">
              {moduleLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Support Col */}
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-wider text-forest font-bold">
              {t('footer.legal')}
            </span>

            <div className="flex items-center gap-3 text-sm text-white/70">
              <Phone className="w-4 h-4 text-forest shrink-0" />
              <span>{t('footer.contact')}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-white/70">
              <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
              <span>ISO 27001 • Agri-Stack Certified</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-white/70 pt-2">
              <span className="hover:text-white cursor-pointer transition-colors">
                {t('footer.privacy')}
              </span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer transition-colors">
                {t('footer.terms')}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-forest/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <span>{t('footer.rights')}</span>
          <span className="font-mono text-forest font-semibold">KISAN OS • DESIGN LOCKED</span>
        </div>
      </div>
    </footer>
  )
}
