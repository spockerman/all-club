import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

/**
 * White card container used for detail/info sections.
 * Pair with <DetailField> for label+value rows.
 */
export function DetailCard({ children, className = '' }: Props) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 ${className}`}>
      {children}
    </div>
  )
}

type FieldProps = {
  label: string
  value: ReactNode
}

/**
 * A single label + value row for use inside <DetailCard>.
 */
export function DetailField({ label, value }: FieldProps) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  )
}
