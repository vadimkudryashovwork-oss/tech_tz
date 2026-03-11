import type { ToastItem } from '@/shared/types/toast'

interface ToastViewportProps {
  toasts: ToastItem[]
  onClose: (id: number) => void
}

function ToastViewport({ onClose, toasts }: ToastViewportProps) {
  if (!toasts.length) {
    return null
  }

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <article key={toast.id} className="toast">
          <div className="toast__content">
            <strong>{toast.title}</strong>
            <span>{toast.description}</span>
          </div>
          <button className="toast__close" onClick={() => onClose(toast.id)} aria-label="Скрыть">
            ×
          </button>
        </article>
      ))}
    </div>
  )
}

export { ToastViewport }
