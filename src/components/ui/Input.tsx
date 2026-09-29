import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, icon, className = '', id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-ink/80 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-4 text-forest pointer-events-none flex items-center">
              {icon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`w-full min-h-touch rounded-input bg-surface-alt border transition-colors duration-200 px-4 py-3 text-body text-ink placeholder:text-muted focus:outline-none focus:border-forest disabled:opacity-50 disabled:cursor-not-allowed ${
              icon ? 'pl-11' : ''
            } ${error ? 'border-danger focus:border-danger' : 'border-line'} ${className}`}
            {...props}
          />
        </div>

        {error ? (
          <p className="text-xs text-danger font-medium mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted mt-0.5">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
