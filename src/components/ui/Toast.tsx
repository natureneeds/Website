import React from 'react'
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react'

export type ToastVariant = 'success' | 'warning' | 'danger' | 'info'

export interface ToastProps {
  id?: string
  title: string
  description?: string
  variant?: ToastVariant
  onClose?: () => void
  className?: string
}

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = 'info',
  onClose,
  className = '',
}) => {
  const iconConfig = {
    success: <CheckCircle2 className="w-5 h-5 text-white" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    danger: <AlertOctagon className="w-5 h-5 text-danger" />,
    info: <Info className="w-5 h-5 text-white" />,
  }[variant]

  const borderVariant = {
    success: 'border-forest',
    warning: 'border-warning/60',
    danger: 'border-danger/60',
    info: 'border-forest/60',
  }[variant]

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 p-4 rounded-input bg-ink border text-white shadow-xl max-w-sm w-full transition-all duration-200 ${borderVariant} ${className}`}
    >
      <div className="shrink-0 mt-0.5">{iconConfig}</div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white tracking-wide">{title}</h4>
        {description && (
          <p className="text-xs text-white/70 mt-0.5 leading-normal">{description}</p>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="shrink-0 p-1 text-white/70 hover:text-white transition-colors focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
