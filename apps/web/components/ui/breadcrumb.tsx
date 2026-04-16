import Link from 'next/link'

type Segment = {
  label: string
  href?: string
}

type Props = {
  segments: Segment[]
}

/**
 * Renders a breadcrumb trail where the first linked segment gets a ← prefix
 * and the last segment is rendered as the page <h1>.
 *
 * Usage:
 *   <Breadcrumb segments={[
 *     { label: 'Sócios', href: '/members' },
 *     { label: member.name },
 *   ]} />
 */
export function Breadcrumb({ segments }: Props) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1
        const isFirst = i === 0

        if (isLast) {
          return <h1 key={i} className="text-2xl font-bold">{seg.label}</h1>
        }

        return (
          <div key={i} className="flex items-center gap-3">
            {seg.href ? (
              <Link href={seg.href} className="text-sm text-gray-500 hover:text-gray-700">
                {isFirst ? `← ${seg.label}` : seg.label}
              </Link>
            ) : (
              <span className="text-sm text-gray-500">
                {isFirst ? `← ${seg.label}` : seg.label}
              </span>
            )}
            <span className="text-gray-300">/</span>
          </div>
        )
      })}
    </div>
  )
}
