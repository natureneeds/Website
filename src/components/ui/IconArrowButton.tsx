import React from 'react'
import { ArrowUpRight } from 'lucide-react'

export interface IconArrowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
  direction?: 'up-right' | 'right'
}

export const IconArrowButton: React.FC<IconArrowButtonProps> = ({
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12 min-h-touch min-w-touch',
  }[size]

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  }[size]

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-pill bg-lime text-ink hover:bg-lime-strong active:scale-95 transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${className}`}
      {...props}
    >
      <ArrowUpRight size={iconSizes} strokeWidth={2.5} />
    </button>
  )
}
