import { AreasTable } from '@/components/areas/areas-table'
import { PageHeader } from '@/components/ui/page-header'
import { api } from '@/lib/api'
import type { Area, AvailabilitySlot } from '@all-club/shared'

export const dynamic = 'force-dynamic'

type AreaListItem = Area & {
  availabilitySlots: AvailabilitySlot[]
}

export default async function AreasPage() {
  const areas = await api.get<AreaListItem[]>('/areas').catch(() => [] as AreaListItem[])

  return (
    <div>
      <PageHeader title="Áreas Comuns" subtitle={`Total cadastradas: ${areas.length}`} />
      <AreasTable areas={areas} />
    </div>
  )
}
