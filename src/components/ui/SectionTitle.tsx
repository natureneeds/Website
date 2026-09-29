import React from 'react'

export interface SectionTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  overline?: string
  size?: 'hero' | 'lg' | 'md' | 'sm'
  align?: 'left' | 'center'
  contrast?: 'light' | 'dark' | 'cream'
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  overline,
  size = 'md',
  align = 'left',
  contrast = 'light',
  className = '',
  ...props
}) => {
  const isDark = contrast === 'dark'

  const titleSizes = {
    hero: 'text-hero-sm md:text-hero font-light tracking-tight',
    lg: 'text-3xl md:text-4xl font-light tracking-tight',
    md: 'text-2xl md:text-3xl font-medium tracking-tight',
    sm: 'text-xl md:text-2xl font-medium',
  }[size]

  const titleColor = isDark ? 'text-white' : 'text-ink'
  const subColor = 'text-muted'
  const overlineStyle = isDark
    ? 'text-white bg-forest border border-forest/60 font-medium'
    : 'text-forest bg-surface-alt border border-line font-bold'

  return (
    <div
      className={`flex flex-col gap-2 ${
        align === 'center' ? 'items-center text-center' : 'items-start text-left'
      } ${className}`}
      {...props}
    >
      {overline && (
        <span
          className={`text-xs uppercase tracking-widest px-3 py-1 rounded-pill ${overlineStyle}`}
        >
          {overline}
        </span>
      )}

      <h2 className={`${titleSizes} ${titleColor} leading-tight`}>{title}</h2>

      {subtitle && (
        <p className={`text-body md:text-lg max-w-2xl leading-relaxed ${subColor}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
