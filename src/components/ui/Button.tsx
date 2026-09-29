import React from 'react'
import { ArrowUpRight, Loader2 } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'accent'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  withArrow?: boolean
  icon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  withArrow,
  icon,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) => {
  // Primary variant includes circular lime arrow icon by default
  const showArrow = withArrow !== undefined ? withArrow : variant === 'primary'

  // Touch target >= 44px enforced
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'min-h-touch px-4 py-2 text-sm gap-2',
    md: 'min-h-touch px-6 py-3 text-body font-medium gap-3',
    lg: 'min-h-touch px-8 py-4 text-lg font-medium gap-4',
  }

  const variantClasses: Record<ButtonVariant, string> = {
    // Primary = ink bg + white text + circular lime arrow icon (fill: lime, text: ink)
    primary:
      'bg-ink text-white border border-ink hover:border-lime-strong active:bg-ink focus:outline-none shadow-sm',
    // Secondary = outlined pill with border-line and ink text
    secondary:
      'bg-transparent text-ink border border-line hover:border-forest hover:text-forest active:bg-surface-alt focus:outline-none',
    // Accent = lime bg fill + ink text
    accent:
      'bg-lime text-ink font-semibold border border-lime hover:bg-lime-strong hover:border-lime-strong active:scale-[0.98] focus:outline-none shadow-sm',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-pill transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-current" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}

      <span>{children}</span>

      {showArrow && !loading && (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-pill bg-lime text-ink shrink-0 -mr-1">
          <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
        </span>
      )}
    </button>
  )
}
