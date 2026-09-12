import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface TermsModalProps {
  open: boolean
  onClose: () => void
  type: 'terms' | 'privacy'
}

export function TermsModal({ open, onClose, type }: TermsModalProps) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  // We intentionally use bg-slate-900/30 without backdrop-blur 
  // to avoid causing blurry text on the underlying page.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        role="button"
        tabIndex={-1}
        aria-label="Close modal overlay"
        className="absolute inset-0 bg-slate-900/30 transition-opacity"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
        className="relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="terms-modal-title" className="text-xl font-bold text-gray-900">
              {type === 'terms' ? t('auth.termsAndConditions') : t('auth.privacyPolicy')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="text-sm text-gray-600 leading-relaxed">
          <p>{type === 'terms' ? t('auth.termsNotice') : t('auth.privacyNotice')}</p>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#f05a24] text-white font-medium rounded-full hover:bg-[#d84d1c] transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
