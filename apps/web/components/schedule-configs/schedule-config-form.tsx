'use client'

import { api } from '@/lib/api'
import { PERIOD_LABEL } from '@/lib/agenda-labels'
import { primaryButtonClassName } from '@/lib/primary-button'
import type { ScheduleConfig } from '@all-club/shared'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const PERIODS = ['MORNING', 'AFTERNOON', 'EVENING', 'ALL_DAY'] as const

type AreaOption = { id: string; name: string }

type Props = {
  mode: 'create' | 'edit'
  config?: ScheduleConfig
  areas: AreaOption[]
  onSuccess?: () => void
  onCancel?: () => void
  submitLabel?: string
  hideCancel?: boolean
}

export function ScheduleConfigForm({
  mode,
  config,
  areas,
  onSuccess,
  onCancel,
  submitLabel,
  hideCancel,
}: Props) {
  const router = useRouter()

  const [areaId, setAreaId] = useState(config?.areaId ?? '')
  const [cronExpression, setCronExpression] = useState(config?.cronExpression ?? '0 6 * * *')
  const [period, setPeriod] = useState<string>(config?.period ?? 'MORNING')
  const [daysAhead, setDaysAhead] = useState(config?.daysAhead ?? 7)
  const [description, setDescription] = useState(config?.description ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const body = {
        areaId,
        cronExpression,
        period,
        daysAhead: Number(daysAhead),
        description: description || undefined,
      }
      if (mode === 'create') {
        await api.post('/schedule-configs', body)
      } else if (config) {
        await api.patch(`/schedule-configs/${config.id}`, body)
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
          <label htmlFor="scAreaId" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Área
          </label>
          <select
            id="scAreaId"
            required
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            className={inputClass}
          >
            <option value="">Selecione…</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="scCron" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          Expressão Cron
        </label>
        <input
          id="scCron"
          type="text"
          required
          value={cronExpression}
          onChange={(e) => setCronExpression(e.target.value)}
          placeholder="0 6 * * *"
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1">
          Ex: <code className="font-mono">0 6 * * *</code> = todo dia às 06h00
        </p>
      </div>

      <div>
        <label htmlFor="scDaysAhead" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          Dias à frente
        </label>
        <input
          id="scDaysAhead"
          type="number"
          required
          min={1}
          max={90}
          value={daysAhead}
          onChange={(e) => setDaysAhead(Number(e.target.value))}
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1">
          Quantos dias no futuro serão gerados a cada execução (1–90).
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
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

      <div>
        <label htmlFor="scDescription" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          Descrição <span className="normal-case font-normal">(opcional)</span>
        </label>
        <input
          id="scDescription"
          type="text"
          maxLength={200}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Piscina – manhã diária"
          className={inputClass}
        />
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
