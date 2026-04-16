import { Breadcrumb } from '@/components/ui/breadcrumb'
import { DetailCard, DetailField } from '@/components/ui/detail-card'
import { PrimaryNavigateButton } from '@/components/ui/primary-navigate-button'
import { api } from '@/lib/api'
import type { Area, AvailabilitySlot, BlockedDate } from '@all-club/shared'
import { notFound } from 'next/navigation'

interface AreaDetail extends Area {
  availabilitySlots: AvailabilitySlot[]
  blockedDates: BlockedDate[]
}

const DAY_LABELS: Record<string, string> = {
  SEGUNDA: 'Segunda',
  TERCA: 'Terça',
  QUARTA: 'Quarta',
  QUINTA: 'Quinta',
  SEXTA: 'Sexta',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
}

export const dynamic = 'force-dynamic'

export default async function AreaDetailPage({ params }: { params: { id: string } }) {
  const area = await api.get<AreaDetail>(`/areas/${params.id}`).catch(() => null)
  if (!area) notFound()

  return (
    <div className="max-w-2xl">
      <Breadcrumb segments={[{ label: 'Áreas', href: '/areas' }, { label: area.name }]} />

      <DetailCard>
        {area.description && <DetailField label="Descrição" value={area.description} />}
        <DetailField label="Capacidade" value={`${area.capacity} pessoas`} />
        {area.rules && <DetailField label="Regras" value={area.rules} />}
      </DetailCard>

      <div className="mt-6">
        <PrimaryNavigateButton href={`/areas/${area.id}/edit`}>Editar</PrimaryNavigateButton>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Grade de Horários</h2>
        {area.availabilitySlots.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum horário configurado</p>
        ) : (
          <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {area.availabilitySlots.map((slot) => (
              <li key={slot.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <span className="font-medium">{DAY_LABELS[slot.dayOfWeek]}</span>
                <span className="text-gray-600">
                  {slot.startTime} – {slot.endTime}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {area.blockedDates.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Datas Bloqueadas</h2>
          <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {area.blockedDates.map((b) => (
              <li key={b.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <span>{new Date(b.date).toLocaleDateString('pt-BR')}</span>
                {b.reason && <span className="text-gray-500">{b.reason}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
