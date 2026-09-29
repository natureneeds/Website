import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-line rounded-card p-6 md:p-8 text-ink shadow-2xl relative transition-all transform animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 id="modal-title" className="text-xl md:text-2xl font-semibold text-ink">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-muted mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-10 h-10 min-h-touch min-w-touch rounded-pill bg-surface-alt hover:bg-surface text-forest hover:text-ink flex items-center justify-center transition-colors focus:outline-none shrink-0 border border-line"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {children && <div className="py-2 text-ink/90">{children}</div>}

        {/* Footer */}
        {footer && <div className="mt-6 pt-4 border-t border-line flex items-center justify-end gap-3 flex-wrap">{footer}</div>}
      </div>
    </div>
  )
}
