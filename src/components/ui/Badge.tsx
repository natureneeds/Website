import React from 'react'

export type BadgeVariant = 'lime' | 'forest' | 'warning' | 'danger' | 'neutral' | 'ink'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
  pulsing?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'lime',
  dot = false,
  pulsing = false,
  className = '',
  ...props
}) => {
  const variantClasses: Record<BadgeVariant, string> = {
    lime: 'bg-lime text-ink font-semibold',
    forest: 'bg-forest text-white font-medium',
    warning: 'bg-warning text-ink font-semibold',
    danger: 'bg-danger text-white font-semibold',
    neutral: 'bg-surface-alt text-ink border border-line font-medium',
    ink: 'bg-ink text-white border border-forest/40 font-medium',
  }

  const dotClasses: Record<BadgeVariant, string> = {
    lime: 'bg-ink',
    forest: 'bg-white',
    warning: 'bg-ink',
    danger: 'bg-white',
    neutral: 'bg-muted',
    ink: 'bg-lime',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs tracking-wide rounded-pill select-none ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-2 h-2 rounded-pill shrink-0 ${dotClasses[variant]} ${
            pulsing ? 'animate-pulse' : ''
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  )
}
