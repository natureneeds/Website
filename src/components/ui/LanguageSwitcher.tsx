import React from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

export interface LanguageSwitcherProps {
  className?: string
  variant?: 'pill' | 'compact'
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'pill',
}) => {
  const { i18n } = useTranslation()
  const currentLang = i18n.language.startsWith('hi') ? 'hi' : 'en'

  const setLanguage = (lang: 'en' | 'hi') => {
    i18n.changeLanguage(lang)
  }

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={`inline-flex items-center p-0.5 sm:p-1 rounded-pill bg-surface border border-line select-none shrink-0 ${className}`}
    >
      {variant === 'pill' && (
        <span className="hidden sm:inline-flex pl-2.5 pr-1 text-forest">
          <Globe className="w-3.5 h-3.5" />
        </span>
      )}

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`min-h-touch px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-pill transition-all duration-200 focus:outline-none flex items-center justify-center ${
          currentLang === 'en'
            ? 'bg-lime text-ink shadow-sm'
            : 'text-muted hover:text-ink'
        }`}
      >
        <span className="sm:hidden">EN</span>
        <span className="hidden sm:inline">English</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`min-h-touch px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-pill transition-all duration-200 focus:outline-none flex items-center justify-center ${
          currentLang === 'hi'
            ? 'bg-lime text-ink shadow-sm'
            : 'text-muted hover:text-ink'
        }`}
      >
        हिंदी
      </button>
    </div>
  )
}
