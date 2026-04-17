/**
 * SVG icon components for club areas.
 * Source: stitch_urbn_dashboard/svgs_de_cones_para_next.js
 */

type IconProps = { className?: string }

export function PoolIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    </svg>
  )
}

export function GrillIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 10H18"/><path d="M6 14H18"/><path d="M8 20V18"/><path d="M16 20V18"/>
      <path d="M18 10V4H6V10"/><path d="M12 2V4"/>
      <path d="M4 10C4 14.4183 7.58172 18 12 18C16.4183 18 20 14.4183 20 10"/>
    </svg>
  )
}

export function TennisIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2C12 2 15 5 15 12C15 19 12 22 12 22"/>
      <path d="M12 2C12 2 9 5 9 12C9 19 12 22 12 22"/>
      <path d="M2 12H22"/>
    </svg>
  )
}

export function SportsCourtIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2C12 2 15 5 15 12C15 19 12 22 12 22"/>
      <path d="M2 12H22"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

export function GymIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6.5 6.5L17.5 17.5"/><path d="M2 9L9 2"/><path d="M15 22L22 15"/>
      <path d="M4.5 4.5L7.5 7.5"/><path d="M16.5 16.5L19.5 19.5"/>
    </svg>
  )
}

export function PartyHallIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5.8 11.3L2 22l10.7-3.8"/><path d="M4 18l2.5 2.5"/>
      <path d="M14 2c1.9 0 3.5 1.6 3.5 3.5S15.9 9 14 9s-3.5-1.6-3.5-3.5S12.1 2 14 2Z"/>
      <path d="M20 13c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2Z"/>
      <path d="M7 2c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1Z"/>
    </svg>
  )
}

export function DefaultAreaIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

/** Returns the matching SVG icon component for an area name */
export function getAreaIconComponent(name: string): React.ComponentType<IconProps> {
  const n = name.toLowerCase()
  if (n.includes('piscina') || n.includes('natação')) return PoolIcon
  if (n.includes('churrasco')) return GrillIcon
  if (n.includes('tênis') || n.includes('tenis')) return TennisIcon
  if (n.includes('basquete') || n.includes('basket') || n.includes('quadra') || n.includes('poliesport')) return SportsCourtIcon
  if (n.includes('futebol') || n.includes('campo')) return SportsCourtIcon
  if (n.includes('academia') || n.includes('ginásio') || n.includes('fitness')) return GymIcon
  if (n.includes('salão') || n.includes('festa') || n.includes('evento')) return PartyHallIcon
  return DefaultAreaIcon
}
