import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { api } from '@/lib/api'
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_VARIANT } from '@/lib/booking-labels'
import { linkActionClassName } from '@/lib/primary-button'
import Link from 'next/link'

interface BookingSummary {
  id: string
  date: string
  status: string
  member: { id: string; name: string; email: string }
  area: { id: string; name: string }
  slot: { startTime: string; endTime: string }
  createdAt: string
}

export default async function BookingsPage() {
  const bookings = await api.get<BookingSummary[]>('/bookings').catch(() => [] as BookingSummary[])

  return (
    <div>
      <PageHeader title="Agendamentos" />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Sócio', 'Área', 'Data', 'Horário', 'Status', 'Criado em'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <p className="font-medium">{b.member.name}</p>
                  <p className="text-xs text-gray-500">{b.member.email}</p>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link href={`/areas/${b.area.id}`} className={linkActionClassName}>
                    {b.area.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(b.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {b.slot.startTime} – {b.slot.endTime}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={BOOKING_STATUS_LABEL[b.status] ?? b.status}
                    variant={BOOKING_STATUS_VARIANT[b.status] ?? 'gray'}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(b.createdAt).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                  Nenhum agendamento encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
