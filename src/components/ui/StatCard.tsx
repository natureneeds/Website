import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    direction?: 'up' | 'down' | 'neutral'
  }
  icon?: React.ReactNode
  variant?: 'ink' | 'cream' | 'surface' | 'lime'
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  trend,
  icon,
  variant = 'surface',
  className = '',
  ...props
}) => {
  const isLight = variant === 'cream' || variant === 'surface'
  const isLime = variant === 'lime'

  const containerClasses = {
    ink: 'bg-ink text-white border border-forest/60 shadow-md',
    cream: 'bg-surface text-ink border border-line shadow-md',
    surface: 'bg-surface text-ink border border-line shadow-md',
    lime: 'bg-lime text-ink border border-lime-strong shadow-md',
  }[variant]

  const labelColor = isLime ? 'text-ink/80' : 'text-muted'
  const valueColor = isLime ? 'text-ink' : isLight ? 'text-ink' : 'text-white'
  const subColor = isLime ? 'text-ink/75' : 'text-muted'

  return (
    <div
      className={`rounded-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${containerClasses} ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs uppercase tracking-wider font-semibold ${labelColor}`}>
          {label}
        </span>
        {icon && (
          <div
            className={`w-10 h-10 rounded-pill flex items-center justify-center ${
              isLime
                ? 'bg-ink text-lime'
                : isLight
                ? 'bg-surface-alt text-forest border border-line'
                : 'bg-forest text-white'
            }`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className={`text-3xl font-semibold tracking-tight mb-2 ${valueColor}`}>
        {value}
      </div>

      <div className="flex items-center justify-between text-sm flex-wrap gap-2">
        {subtitle && <span className={subColor}>{subtitle}</span>}

        {trend && (
          <span
            className={`inline-flex items-center gap-1 font-semibold text-xs px-2.5 py-1 rounded-pill ${
              trend.direction === 'up'
                ? isLime
                  ? 'bg-ink text-white'
                  : isLight
                  ? 'bg-forest text-white'
                  : 'bg-lime text-ink'
                : trend.direction === 'down'
                ? 'bg-danger text-white'
                : 'bg-surface-alt text-muted border border-line'
            }`}
          >
            {trend.direction === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
            {trend.direction === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
            {trend.direction === 'neutral' && <Minus className="w-3.5 h-3.5" />}
            <span>{trend.value}</span>
          </span>
        )}
      </div>
    </div>
  )
}
