'use client'

import { api } from '@/lib/api'
import { PERIOD_LABEL } from '@/lib/agenda-labels'
import { primaryButtonClassName } from '@/lib/primary-button'
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

type BatchResult = { created: number; skipped: number; details: Record<string, 'created' | 'skipped'> }

type Props = {
  areas: AreaOption[]
  onSuccess?: () => void
  hideCancel?: boolean
  onCancel?: () => void
}

export function AgendaBatchForm({ areas, onSuccess, hideCancel, onCancel }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [areaId, setAreaId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [period, setPeriod] = useState<string>('MORNING')
  const [result, setResult] = useState<BatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const data = await api.post<BatchResult>('/agendas/batch', {
        areaId,
        dateFrom: new Date(dateFrom + 'T12:00:00').toISOString(),
        dateTo: new Date(dateTo + 'T12:00:00').toISOString(),
        period,
      })
      setResult(data)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agendas')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-gray-300 focus:border-gray-300 outline-none bg-white'

  if (result) {
    return (
      <div className="space-y-4">
        <div className="bg-surface-container rounded-xl border border-[rgba(44,52,55,0.08)] p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-on-surface-variant">
              <Icon name="check_circle" className="text-[16px] text-secondary" />
              Agendas criadas
            </span>
            <span className="font-bold text-on-surface">{result.created}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-on-surface-variant">
              <Icon name="do_not_disturb_on" className="text-[16px]" />
              Já existiam (ignoradas)
            </span>
            <span className="font-bold text-on-surface-variant">{result.skipped}</span>
          </div>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <button onClick={() => { setResult(null) }} className={primaryButtonClassName}>
            Criar mais
          </button>
          {onSuccess && (
            <button
              onClick={onSuccess}
              className="text-sm text-gray-600 hover:text-gray-900 px-2"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="batchAreaId" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
          <Icon name="place" className="text-[14px]" />
          Área
        </label>
        <select id="batchAreaId" required value={areaId} onChange={(e) => setAreaId(e.target.value)} className={inputClass}>
          <option value="">Selecione…</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dateFrom" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            <Icon name="date_range" className="text-[14px]" />
            Data início
          </label>
          <input
            id="dateFrom"
            type="date"
            required
            min={today}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="dateTo" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            <Icon name="event_available" className="text-[14px]" />
            Data fim
          </label>
          <input
            id="dateTo"
            type="date"
            required
            min={dateFrom || today}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={inputClass}
          />
        </div>
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
          {loading ? 'Criando…' : 'Gerar agendas'}
        </button>
        {!hideCancel && (
          <button
            type="button"
            onClick={() => (onCancel ? onCancel() : undefined)}
            className="text-sm text-gray-600 hover:text-gray-900 px-2"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
