import { BookingsTable } from '@/components/bookings/bookings-table'
import { PageHeader } from '@/components/ui/page-header'
import { api } from '@/lib/api'
import type { Area, Member } from '@all-club/shared'

export const dynamic = 'force-dynamic'

type Reservation = {
  id: string
  date: string
  period: string
  area: { id: string; name: string }
  reservation: {
    id: string
    status: string
    member: { id: string; name: string; email?: string }
    createdAt: string
  } | null
}

export default async function BookingsPage() {
  const [reservations, members, areas] = await Promise.all([
    api.get<Reservation[]>('/agendas?status=RESERVED').catch(() => [] as Reservation[]),
    api.get<Member[]>('/members').catch(() => [] as Member[]),
    api.get<Area[]>('/areas').catch(() => [] as Area[]),
  ])

  const memberOptions = members.map((m) => ({ id: m.id, name: m.name }))
  const areaOptions = areas.map((a) => ({ id: a.id, name: a.name, description: a.description }))

  return (
    <div>
      <PageHeader
        title="Agendamentos"
        subtitle={`Total reservados: ${reservations.length}`}
      />
      <BookingsTable reservations={reservations} members={memberOptions} areas={areaOptions} />
    </div>
  )
}
