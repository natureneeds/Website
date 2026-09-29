import React from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  helperText?: string
  error?: string
  options: SelectOption[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, options, className = '', id, disabled, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-ink/80 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={`w-full min-h-touch rounded-input bg-surface-alt border transition-colors duration-200 px-4 py-3 pr-10 text-body text-ink appearance-none focus:outline-none focus:border-forest disabled:opacity-50 disabled:cursor-not-allowed ${
              error ? 'border-danger focus:border-danger' : 'border-line'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-white text-ink py-2"
              >
                {opt.label}
              </option>
            ))}
          </select>

          <span className="absolute right-4 text-forest pointer-events-none flex items-center">
            <ChevronDown className="w-4 h-4" />
          </span>
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

Select.displayName = 'Select'
