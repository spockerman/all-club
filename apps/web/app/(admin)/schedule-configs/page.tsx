import { ScheduleConfigsTable } from '@/components/schedule-configs/schedule-configs-table'
import { PageHeader } from '@/components/ui/page-header'
import { api } from '@/lib/api'
import type { Area, ScheduleConfig } from '@all-club/shared'

export const dynamic = 'force-dynamic'

type ScheduleConfigListItem = ScheduleConfig & {
  area: { id: string; name: string }
}

export default async function ScheduleConfigsPage() {
  const [configs, areas] = await Promise.all([
    api.get<ScheduleConfigListItem[]>('/schedule-configs').catch(() => [] as ScheduleConfigListItem[]),
    api.get<Area[]>('/areas').catch(() => [] as Area[]),
  ])

  return (
    <div>
      <PageHeader
        title="Rotinas de Agendas"
        subtitle="Geração automática de vagas por área"
      />
      <ScheduleConfigsTable configs={configs} areas={areas} />
    </div>
  )
}
