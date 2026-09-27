import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from './Primitives.jsx'

const WIDTHS = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }

export function Modal({ open, onClose, title, subtitle, width = 'md', footer, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="no-print fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-ink/45 p-4 backdrop-blur-sm sm:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${WIDTHS[width]} rounded-panel bg-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.5)]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-ink-3">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-ink-3 transition hover:bg-mist hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-line bg-mist/50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onCancel, onConfirm, title, message, confirmLabel = 'Delete', busy }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      width="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working...' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink-2">{message}</p>
    </Modal>
  )
}
