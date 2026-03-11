import type { InputHTMLAttributes } from 'react'
import { SquareIcon } from '@/shared/ui/icons'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <label className="checkbox">
      <span className="checkbox__input">
        <input type="checkbox" {...props} />
        <span className="checkbox__mark">
          <SquareIcon />
        </span>
      </span>
      <span className="checkbox__label">{label}</span>
    </label>
  )
}

export { Checkbox }
