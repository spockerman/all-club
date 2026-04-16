import { api } from '@/lib/api'
import type { Area } from '@all-club/shared'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface AvailabilitySlot {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
}

interface BlockedDate {
  id: string
  date: string
  reason?: string
}

interface AreaDetail extends Area {
  availabilitySlots: AvailabilitySlot[]
  blockedDates: BlockedDate[]
}

const DAY_LABELS: Record<string, string> = {
  SEGUNDA: 'Segunda', TERCA: 'Terça', QUARTA: 'Quarta',
  QUINTA: 'Quinta', SEXTA: 'Sexta', SABADO: 'Sábado', DOMINGO: 'Domingo',
}

export default async function AreaDetailPage({ params }: { params: { id: string } }) {
  const area = await api.get<AreaDetail>(`/areas/${params.id}`).catch(() => null)
  if (!area) notFound()

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/areas" className="text-sm text-gray-500 hover:text-gray-700">← Áreas</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold">{area.name}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
        {area.description && <p className="text-sm text-gray-600">{area.description}</p>}
        <p className="text-sm"><span className="font-medium">Capacidade:</span> {area.capacity} pessoas</p>
        {area.rules && <p className="text-sm"><span className="font-medium">Regras:</span> {area.rules}</p>}
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
                <span className="text-gray-600">{slot.startTime} – {slot.endTime}</span>
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
