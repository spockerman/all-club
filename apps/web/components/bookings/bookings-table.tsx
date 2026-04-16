'use client'

import { api } from '@/lib/api'
import { Modal } from '@/components/ui/modal'
import { StatusBadge } from '@/components/ui/status-badge'
import { DetailField } from '@/components/ui/detail-card'
import { primaryButtonClassName, outlineButtonClassName } from '@/lib/primary-button'
import { PERIOD_LABEL } from '@/lib/agenda-labels'
import type { AgendaPeriod } from '@all-club/shared'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BookingForm } from './booking-form'
import { BlockDateForm } from './block-date-form'

const DAY_LABEL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function formatDate(date: string | Date) {
  const d = new Date(date)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = d.getUTCFullYear()
  const weekday = DAY_LABEL[d.getUTCDay()]
  return `${day}/${month}/${year} (${weekday})`
}

type Reservation = {
  id: string // agenda id
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

type MemberOption = { id: string; name: string }
type AreaOption = { id: string; name: string }

type Props = {
  reservations: Reservation[]
  members: MemberOption[]
  areas: AreaOption[]
}

export function BookingsTable({ reservations, members, areas }: Props) {
  const router = useRouter()

  const [showNew, setShowNew] = useState(false)
  const [showBlock, setShowBlock] = useState(false)
  const [detailTarget, setDetailTarget] = useState<Reservation | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  async function handleCancel() {
    if (!detailTarget) return
    setCancelLoading(true)
    setCancelError(null)
    try {
      await api.delete(`/agendas/${detailTarget.id}/reservations`)
      setDetailTarget(null)
      router.refresh()
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Erro ao cancelar')
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-3 mb-4">
        <button onClick={() => setShowBlock(true)} className={outlineButtonClassName}>
          Bloquear data
        </button>
        <button onClick={() => setShowNew(true)} className={primaryButtonClassName}>
          + Novo Agendamento
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Sócio', 'Área', 'Data', 'Período', 'Reservado em'].map((h) => (
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
            {reservations.map((r) => (
              <tr
                key={r.id}
                onClick={() => {
                  setCancelError(null)
                  setDetailTarget(r)
                }}
                className="hover:bg-gray-50 cursor-pointer select-none"
                title="Clique para ver detalhes"
              >
                <td className="px-4 py-3 text-sm">
                  <p className="font-medium">{r.reservation?.member.name ?? '—'}</p>
                  {r.reservation?.member.email && (
                    <p className="text-xs text-gray-500">{r.reservation.member.email}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{r.area.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(r.date)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {PERIOD_LABEL[r.period as AgendaPeriod]}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {r.reservation
                    ? new Date(r.reservation.createdAt).toLocaleDateString('pt-BR')
                    : '—'}
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                  Nenhum agendamento encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: novo agendamento */}
      {showNew && (
        <Modal title="Novo agendamento" size="md" scrollable onClose={() => setShowNew(false)}>
          <BookingForm
            members={members}
            areas={areas}
            onSuccess={() => setShowNew(false)}
            hideCancel
          />
        </Modal>
      )}

      {/* Modal: bloquear data */}
      {showBlock && (
        <Modal title="Bloquear data" size="sm" onClose={() => setShowBlock(false)}>
          <BlockDateForm
            areas={areas}
            onSuccess={() => setShowBlock(false)}
            hideCancel
          />
        </Modal>
      )}

      {/* Modal: detalhe / cancelar */}
      {detailTarget && (
        <Modal
          title="Agendamento"
          size="sm"
          onClose={() => {
            if (!cancelLoading) setDetailTarget(null)
          }}
        >
          <div className="space-y-4 mb-6">
            <DetailField label="Sócio" value={detailTarget.reservation?.member.name ?? '—'} />
            {detailTarget.reservation?.member.email && (
              <DetailField label="E-mail" value={detailTarget.reservation.member.email} />
            )}
            <DetailField label="Área" value={detailTarget.area.name} />
            <DetailField label="Data" value={formatDate(detailTarget.date)} />
            <DetailField label="Período" value={PERIOD_LABEL[detailTarget.period as AgendaPeriod]} />
            <DetailField
              label="Status"
              value={
                <StatusBadge
                  label={detailTarget.reservation?.status === 'CONFIRMED' ? 'Confirmado' : 'Cancelado'}
                  variant={detailTarget.reservation?.status === 'CONFIRMED' ? 'green' : 'gray'}
                />
              }
            />
          </div>

          {cancelError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
              {cancelError}
            </div>
          )}

          {detailTarget.reservation?.status === 'CONFIRMED' && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 mb-3">
                Cancelar o agendamento libera a agenda para novas reservas.
              </p>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelLoading}
                className="w-full inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelando…' : 'Cancelar agendamento'}
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  )
}
