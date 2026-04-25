'use client'

import { api } from '@/lib/api'
import { PERIOD_LABEL } from '@/lib/agenda-labels'
import { primaryButtonClassName } from '@/lib/primary-button'
import type { Agenda } from '@all-club/shared'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden>
      {name}
    </span>
  )
}

const PERIODS = ['MORNING', 'AFTERNOON', 'EVENING', 'ALL_DAY'] as const

type AreaOption = { id: string; name: string }

type Props = {
  mode: 'create' | 'edit'
  agenda?: Agenda
  areas: AreaOption[]
  onSuccess?: () => void
  onCancel?: () => void
  submitLabel?: string
  hideCancel?: boolean
}

export function AgendaForm({ mode, agenda, areas, onSuccess, onCancel, submitLabel, hideCancel }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [areaId, setAreaId] = useState(agenda?.areaId ?? '')
  const [date, setDate] = useState(
    agenda?.date ? new Date(agenda.date).toISOString().split('T')[0] : '',
  )
  const [period, setPeriod] = useState<string>(agenda?.period ?? 'MORNING')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'create') {
        await api.post('/agendas', { areaId, date: new Date(date + 'T12:00:00').toISOString(), period })
      } else if (agenda) {
        await api.patch(`/agendas/${agenda.id}`, {
          date: new Date(date + 'T12:00:00').toISOString(),
          period,
        })
      }
      router.refresh()
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-gray-300 focus:border-gray-300 outline-none bg-white'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {mode === 'create' && (
        <div>
          <label htmlFor="areaId" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            <Icon name="place" className="text-[14px]" />
            Área
          </label>
          <select id="areaId" required value={areaId} onChange={(e) => setAreaId(e.target.value)} className={inputClass}>
            <option value="">Selecione…</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="agendaDate" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
          <Icon name="event" className="text-[14px]" />
          Data
        </label>
        <input
          id="agendaDate"
          type="date"
          required
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
          <Icon name="schedule" className="text-[14px]" />
          Período
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      <div className={`flex items-center gap-3 pt-2 ${hideCancel ? 'justify-center' : ''}`}>
        <button type="submit" disabled={loading} className={primaryButtonClassName}>
          {loading ? 'Salvando…' : (submitLabel ?? (mode === 'create' ? 'Cadastrar' : 'Salvar alterações'))}
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
