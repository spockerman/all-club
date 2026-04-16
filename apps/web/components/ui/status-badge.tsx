type Variant = 'green' | 'yellow' | 'gray' | 'red'

const VARIANT_CLASS: Record<Variant, string> = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  gray: 'bg-gray-100 text-gray-600',
  red: 'bg-red-100 text-red-800',
}

type Props = {
  label: string
  variant: Variant
}

export function StatusBadge({ label, variant }: Props) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${VARIANT_CLASS[variant]}`}>
      {label}
    </span>
  )
}
