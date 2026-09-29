import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'input' | 'circle' | 'button'
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  className = '',
  ...props
}) => {
  const variantClasses = {
    text: 'h-4 w-full rounded-pill',
    card: 'h-48 w-full rounded-card',
    input: 'h-11 min-h-touch w-full rounded-input',
    button: 'h-11 min-h-touch w-36 rounded-pill',
    circle: 'w-12 h-12 rounded-pill shrink-0',
  }[variant]

  return (
    <div
      aria-hidden="true"
      className={`bg-line/70 animate-pulse select-none ${variantClasses} ${className}`}
      {...props}
    />
  )
}
