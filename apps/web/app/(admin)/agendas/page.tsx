import { AgendasTable } from '@/components/agendas/agendas-table'
import { PageHeader } from '@/components/ui/page-header'
import { api } from '@/lib/api'
import type { Agenda, Area } from '@all-club/shared'

export const dynamic = 'force-dynamic'

type AgendaListItem = Agenda & {
  area: { id: string; name: string }
  reservation: { member: { id: string; name: string } } | null
}

export default async function AgendasPage({
  searchParams,
}: {
  searchParams?: { areaId?: string; dateFrom?: string; dateTo?: string; status?: string; period?: string }
}) {
  const params = new URLSearchParams()
  if (searchParams?.areaId) params.set('areaId', searchParams.areaId)
  if (searchParams?.dateFrom) params.set('dateFrom', searchParams.dateFrom)
  if (searchParams?.dateTo) params.set('dateTo', searchParams.dateTo)
  if (searchParams?.status) params.set('status', searchParams.status)
  if (searchParams?.period) params.set('period', searchParams.period)

  const query = params.toString() ? `?${params.toString()}` : ''

  const [agendas, areas] = await Promise.all([
    api.get<AgendaListItem[]>(`/agendas${query}`).catch(() => [] as AgendaListItem[]),
    api.get<Area[]>('/areas').catch(() => [] as Area[]),
  ])

  return (
    <div>
      <PageHeader title="Agendas" subtitle={`Total: ${agendas.length}`} />
      <AgendasTable agendas={agendas} areas={areas} />
    </div>
  )
}
