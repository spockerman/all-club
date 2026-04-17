'use client'

import type { ReactNode } from 'react'

const SIZE_CLASS = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
}

const BG_CLASS = {
  white: 'bg-white',
  surface: 'bg-background',
}

type Props = {
  title: string
  onClose: () => void
  children: ReactNode
  size?: keyof typeof SIZE_CLASS
  scrollable?: boolean
  /** Background color of the modal panel. Defaults to 'white'. */
  background?: keyof typeof BG_CLASS
}

export function Modal({ title, onClose, children, size = 'md', scrollable = false, background = 'white' }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`${BG_CLASS[background]} rounded-2xl shadow-xl w-full ${SIZE_CLASS[size]} mx-4 p-6 ${
          scrollable ? 'max-h-[90vh] overflow-y-auto' : ''
        }`}
      >
        <h2 className="text-lg font-bold mb-5">{title}</h2>
        {children}
      </div>
    </div>
  )
}
