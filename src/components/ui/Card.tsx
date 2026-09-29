import React from 'react'

export type CardVariant = 'surface' | 'cream' | 'ink' | 'lime'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  as?: React.ElementType
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  as: Component = 'div',
  className = '',
  ...props
}) => {
  const variantClasses: Record<CardVariant, string> = {
    // Cream = --surface with --ink text
    surface: 'bg-surface text-ink border border-line shadow-sm',
    cream: 'bg-surface text-ink border border-line shadow-sm',
    // Ink = --ink with --white text and muted-light secondary text (white at 70% opacity)
    ink: 'bg-ink text-white border border-forest/60 shadow-sm [&_.text-muted]:text-white/70',
    // Lime accent card with ink text
    lime: 'bg-lime text-ink border border-lime-strong shadow-sm',
  }

  return (
    <Component
      className={`rounded-card p-6 md:p-8 transition-all duration-200 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
