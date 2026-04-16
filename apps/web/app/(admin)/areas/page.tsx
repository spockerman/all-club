import { PageHeader } from '@/components/ui/page-header'
import { PrimaryNavigateButton } from '@/components/ui/primary-navigate-button'
import { api } from '@/lib/api'
import type { Area } from '@all-club/shared'
import Link from 'next/link'

interface AreaWithSlots extends Area {
  availabilitySlots: { id: string; dayOfWeek: string; startTime: string; endTime: string }[]
}

export default async function AreasPage() {
  const areas = await api.get<AreaWithSlots[]>('/areas').catch(() => [] as AreaWithSlots[])

  return (
    <div>
      <PageHeader
        title="Áreas Comuns"
        action={<PrimaryNavigateButton href="/areas/new">+ Nova Área</PrimaryNavigateButton>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas.map((area) => (
          <Link
            key={area.id}
            href={`/areas/${area.id}`}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <h2 className="font-semibold text-gray-900">{area.name}</h2>
            {area.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{area.description}</p>
            )}
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span>Capacidade: {area.capacity}</span>
              <span>{area.availabilitySlots.length} horários</span>
            </div>
          </Link>
        ))}
        {areas.length === 0 && (
          <p className="col-span-3 text-center py-12 text-sm text-gray-400">
            Nenhuma área cadastrada
          </p>
        )}
      </div>
    </div>
  )
}
