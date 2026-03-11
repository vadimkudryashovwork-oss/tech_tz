import { useEffect, type PropsWithChildren } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon } from '@/shared/ui/icons'

interface ModalProps extends PropsWithChildren {
  isOpen: boolean
  title: string
  description?: string
  onClose: () => void
}

function Modal({ children, description, isOpen, onClose, title }: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="modal__backdrop" onClick={onClose} aria-label="Закрыть окно" />
      <div className="modal__panel">
        <div className="modal__header">
          <div>
            <h2 id="modal-title" className="modal__title">
              {title}
            </h2>
            {description ? <p className="modal__description">{description}</p> : null}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Закрыть окно">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export { Modal }
