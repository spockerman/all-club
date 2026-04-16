'use client'

import type { ReactNode } from 'react'

const SIZE_CLASS = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-xl',
}

type Props = {
  title: string
  onClose: () => void
  children: ReactNode
  size?: keyof typeof SIZE_CLASS
  /** Whether clicking the backdrop closes the modal. Defaults to true. */
  scrollable?: boolean
}

export function Modal({ title, onClose, children, size = 'md', scrollable = false }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${SIZE_CLASS[size]} mx-4 p-6 ${
          scrollable ? 'max-h-[90vh] overflow-y-auto' : ''
        }`}
      >
        <h2 className="text-lg font-bold mb-5">{title}</h2>
        {children}
      </div>
    </div>
  )
}
