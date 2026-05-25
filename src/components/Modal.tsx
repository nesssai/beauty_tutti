import { useEffect, useRef, type ReactNode } from 'react'

export type ModalVariant = 'default' | 'success' | 'danger' | 'error'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  variant?: ModalVariant
  /** Закрытие по клику на затемнённый фон (по умолчанию true). */
  closeOnBackdrop?: boolean
  icon?: ReactNode
  size?: 'md' | 'lg'
}

const variantStyles: Record<
  ModalVariant,
  { header: string; iconBg: string; iconColor: string }
> = {
  default: {
    header: 'border-stone-200/60 bg-gradient-to-br from-white via-[var(--accent-soft)]/40 to-white',
    iconBg: 'bg-[var(--accent-soft)]',
    iconColor: 'text-[var(--accent-strong)]',
  },
  success: {
    header:
      'border-emerald-200/50 bg-gradient-to-br from-emerald-50/90 via-white to-[var(--accent-soft)]/30',
    iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    iconColor: 'text-white',
  },
  danger: {
    header: 'border-red-200/60 bg-gradient-to-br from-red-50 via-white to-white',
    iconBg: 'bg-gradient-to-br from-red-400 to-red-600',
    iconColor: 'text-white',
  },
  error: {
    header: 'border-red-200/60 bg-gradient-to-br from-red-50/90 via-white to-rose-50/50',
    iconBg: 'bg-gradient-to-br from-rose-500 to-red-600',
    iconColor: 'text-white',
  },
}

function DefaultIcon({ variant }: { variant: ModalVariant }) {
  const s = variantStyles[variant]
  if (variant === 'success') {
    return (
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg shadow-emerald-500/25 ${s.iconBg} ${s.iconColor}`}
        aria-hidden
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    )
  }
  if (variant === 'error' || variant === 'danger') {
    return (
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg shadow-red-500/20 ${s.iconBg} ${s.iconColor}`}
        aria-hidden
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
    )
  }
  return null
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  variant = 'default',
  closeOnBackdrop = true,
  icon,
  size = 'md',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const styles = variantStyles[variant]
  const maxW = size === 'lg' ? 'max-w-xl' : 'max-w-lg'

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="modal-overlay absolute inset-0 bg-stone-900/55 backdrop-blur-md"
        aria-label="Закрыть"
        onClick={closeOnBackdrop ? onClose : undefined}
        tabIndex={closeOnBackdrop ? 0 : -1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`modal-panel relative z-10 flex w-full flex-col ${maxW} max-h-[92dvh] overflow-hidden rounded-t-3xl border border-white/60 bg-white/95 shadow-2xl shadow-[var(--accent)]/10 ring-1 ring-white/80 backdrop-blur-xl sm:max-h-[min(90vh,640px)] sm:rounded-3xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`shrink-0 border-b px-5 py-5 sm:px-7 sm:py-6 ${styles.header}`}>
          <div className="flex items-start gap-4">
            {icon ?? <DefaultIcon variant={variant} />}
            <div className="min-w-0 flex-1 pt-1">
              <h2 id="modal-title" className="text-xl font-bold leading-tight text-stone-900 sm:text-2xl">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="modal-close-btn -mr-1 shrink-0 rounded-xl p-2 text-stone-500 transition hover:bg-white/80 hover:text-stone-800"
              aria-label="Закрыть окно"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 text-base text-stone-700 sm:px-7 sm:py-6">
          {children}
        </div>
        {footer && (
          <div className="modal-footer shrink-0 flex flex-col-reverse gap-3 border-t border-stone-100/80 bg-gradient-to-t from-stone-50/90 to-white/80 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
