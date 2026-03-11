import type { HTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '@/shared/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement>, PropsWithChildren {}

function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  )
}

export { Card }
