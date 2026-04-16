'use client'

import { api } from '@/lib/api'
import { primaryButtonClassName } from '@/lib/primary-button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type AreaOption = { id: string; name: string }

type Props = {
  areas: AreaOption[]
  onSuccess?: () => void
  onCancel?: () => void
  hideCancel?: boolean
}

export function BlockDateForm({ areas, onSuccess, onCancel, hideCancel }: Props) {
  const router = useRouter()
  const [areaId, setAreaId] = useState('')
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post(`/areas/${areaId}/blocked-dates`, {
        date: new Date(date + 'T12:00:00').toISOString(),
        reason: reason.trim() || undefined,
      })
      router.refresh()
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao bloquear data')
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

      <div>
        <label
          htmlFor="blockAreaId"
          className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"
        >
          Área
        </label>
        <select
          id="blockAreaId"
          required
          value={areaId}
          onChange={(e) => setAreaId(e.target.value)}
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
          htmlFor="blockDate"
          className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"
        >
          Data
        </label>
        <input
          id="blockDate"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="blockReason"
          className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"
        >
          Motivo
        </label>
        <input
          id="blockReason"
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Opcional"
          className={inputClass}
        />
      </div>

      <div className={`flex items-center gap-3 pt-2 ${hideCancel ? 'justify-center' : ''}`}>
        <button type="submit" disabled={loading} className={primaryButtonClassName}>
          {loading ? 'Bloqueando…' : 'Bloquear data'}
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
