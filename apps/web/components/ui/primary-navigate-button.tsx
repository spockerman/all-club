'use client'

import { primaryButtonClassName } from '@/lib/primary-button'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

type Props = {
  href: string
  children: ReactNode
  className?: string
}

/**
 * Botão primário do sistema que navega para uma rota (evita `<a>` com aparência de botão).
 */
export function PrimaryNavigateButton({ href, children, className }: Props) {
  const router = useRouter()
  return (
    <button
      type="button"
      className={className ?? primaryButtonClassName}
      onClick={() => router.push(href)}
    >
      {children}
    </button>
  )
}
