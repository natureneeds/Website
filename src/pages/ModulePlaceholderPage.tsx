import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutShell,
  SectionTitle,
  Card,
  Badge,
  Button,
  IconArrowButton,
} from '@/components/ui'

export interface ModulePlaceholderProps {
  titleKey: string
  descKey: string
  metaKey?: string
  moduleKey: string
}

export const ModulePlaceholderPage: React.FC<ModulePlaceholderProps> = ({
  titleKey,
  descKey,
  metaKey,
}) => {
  const { t } = useTranslation()

  return (
    <LayoutShell>
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-20 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <Badge variant="lime" dot>
            {t('placeholder.badge')}
          </Badge>
          {metaKey && (
            <span className="text-xs text-muted font-mono uppercase tracking-wider">
              {t(metaKey)}
            </span>
          )}
        </div>

        <SectionTitle
          size="hero"
          title={t(titleKey)}
          subtitle={t(descKey)}
          contrast="light"
        />

        <Card variant="surface" className="flex flex-col gap-6 max-w-2xl mt-4">
          <p className="text-body text-ink/80 leading-relaxed">
            {t('placeholder.comingSoon')}
          </p>

          <div className="flex items-center gap-4 flex-wrap pt-4 border-t border-line">
            <Link to="/">
              <Button variant="primary">
                {t('placeholder.backHome')}
              </Button>
            </Link>

            <Link to="/design-system">
              <Button variant="secondary">
                {t('nav.designSystem')}
              </Button>
            </Link>

            <IconArrowButton aria-label="Quick Action" />
          </div>
        </Card>
      </main>
    </LayoutShell>
  )
}
