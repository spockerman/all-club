'use client'

import { api } from '@/lib/api'
import { Combobox } from '@/components/ui/combobox'
import { PERIOD_LABEL } from '@/lib/agenda-labels'
import { primaryButtonClassName } from '@/lib/primary-button'
import type { AgendaPeriod } from '@all-club/shared'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type MemberOption = { id: string; name: string }
type AreaOption = { id: string; name: string }
type AvailableAgenda = {
  id: string
  period: AgendaPeriod
  area: { id: string; name: string }
}

type Props = {
  members: MemberOption[]
  areas: AreaOption[]
  onSuccess?: () => void
  onCancel?: () => void
  hideCancel?: boolean
}

export function BookingForm({ members, areas, onSuccess, onCancel, hideCancel }: Props) {
  const router = useRouter()
  const [memberId, setMemberId] = useState('')
  const [areaId, setAreaId] = useState('')
  const [date, setDate] = useState('')
  const [agendaId, setAgendaId] = useState('')
  const [availableAgendas, setAvailableAgendas] = useState<AvailableAgenda[]>([])
  const [loadingAgendas, setLoadingAgendas] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!areaId || !date) {
      setAvailableAgendas([])
      setAgendaId('')
      return
    }

    setLoadingAgendas(true)
    setAvailableAgendas([])
    setAgendaId('')

    const params = new URLSearchParams({
      areaId,
      dateFrom: date,
      dateTo: date,
      status: 'AVAILABLE',
    })

    api
      .get<AvailableAgenda[]>(`/agendas?${params.toString()}`)
      .then((data) => setAvailableAgendas(data))
      .catch(() => setError('Erro ao carregar agendas disponíveis'))
      .finally(() => setLoadingAgendas(false))
  }, [areaId, date])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post(`/agendas/${agendaId}/reservations`, { memberId })
      router.refresh()
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar reserva')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-gray-300 focus:border-gray-300 outline-none bg-white'

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="memberId"
          className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"
        >
          Sócio
        </label>
        <Combobox
          id="memberId"
          required
          value={memberId}
          onChange={setMemberId}
          options={members.map((m) => ({ id: m.id, label: m.name }))}
          placeholder="Buscar pelo nome…"
        />
      </div>

      <div>
        <label
          htmlFor="areaId"
          className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"
        >
          Área
        </label>
        <select
          id="areaId"
          required
          value={areaId}
          onChange={(e) => {
            setAreaId(e.target.value)
            setAgendaId('')
          }}
          className={inputClass}
        >
          <option value="">Selecione…</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="bookingDate"
          className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"
        >
          Data
        </label>
        <input
          id="bookingDate"
          type="date"
          required
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </div>

      {areaId && date && (
        <div>
          <label
            htmlFor="agendaId"
            className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"
          >
            Período
          </label>
          {loadingAgendas ? (
            <p className="text-sm text-gray-400">Carregando períodos…</p>
          ) : availableAgendas.length === 0 ? (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Nenhuma agenda disponível para esta data. Cadastre agendas na tela de Agendas.
            </p>
          ) : (
            <select
              id="agendaId"
              required
              value={agendaId}
              onChange={(e) => setAgendaId(e.target.value)}
              className={inputClass}
            >
              <option value="">Selecione…</option>
              {availableAgendas.map((a) => (
                <option key={a.id} value={a.id}>
                  {PERIOD_LABEL[a.period]}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className={`flex items-center gap-3 pt-2 ${hideCancel ? 'justify-center' : ''}`}>
        <button
          type="submit"
          disabled={loading || !memberId || !agendaId}
          className={primaryButtonClassName}
        >
          {loading ? 'Salvando…' : 'Cadastrar'}
        </button>
        {!hideCancel && (
          <button
            type="button"
            onClick={() => (onCancel ? onCancel() : router.back())}
            className="text-sm text-gray-600 hover:text-gray-900 px-2"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
