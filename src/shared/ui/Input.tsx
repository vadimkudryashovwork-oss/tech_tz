import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  trailing?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, hint, icon, trailing, id, ...props },
  ref,
) {
  return (
    <label className="field">
      {label ? <span className="field__label">{label}</span> : null}
      <span className={cn('field__control', error && 'field__control--error')}>
        {icon ? <span className="field__icon">{icon}</span> : null}
        <input ref={ref} id={id} className={cn('input', className)} {...props} />
        {trailing ? <span className="field__trailing">{trailing}</span> : null}
      </span>
      {error ? <span className="field__message field__message--error">{error}</span> : null}
      {!error && hint ? <span className="field__message">{hint}</span> : null}
    </label>
  )
})

export { Input }
