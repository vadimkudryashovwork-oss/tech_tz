import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '@/shared/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, PropsWithChildren {
  variant?: ButtonVariant
}

function Button({
  children,
  className,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={cn('button', `button--${variant}`, className)} {...props}>
      {children}
    </button>
  )
}

export { Button }
