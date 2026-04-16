'use client'

import { api } from '@/lib/api'
import { primaryButtonClassName } from '@/lib/primary-button'
import type { Area } from '@all-club/shared'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  mode: 'create' | 'edit'
  area?: Area
  onSuccess?: () => void
  onCancel?: () => void
  submitLabel?: string
  hideCancel?: boolean
}

export function AreaForm({ mode, area, onSuccess, onCancel, submitLabel, hideCancel }: Props) {
  const router = useRouter()
  const [name, setName] = useState(area?.name ?? '')
  const [description, setDescription] = useState(area?.description ?? '')
  const [capacity, setCapacity] = useState(String(area?.capacity ?? ''))
  const [rules, setRules] = useState(area?.rules ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const capacityNum = parseInt(capacity, 10)
    if (isNaN(capacityNum) || capacityNum <= 0) {
      setError('Capacidade deve ser um número positivo.')
      return
    }

    setLoading(true)
    try {
      const body = {
        name: name.trim(),
        description: description.trim() || undefined,
        capacity: capacityNum,
        rules: rules.trim() || undefined,
      }

      if (mode === 'create') {
        const created = await api.post<Area>('/areas', body)
        router.refresh()
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(`/areas/${created.id}`)
        }
      } else if (area) {
        await api.patch<Area>(`/areas/${area.id}`, body)
        router.refresh()
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(`/areas/${area.id}`)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-gray-300 focus:border-gray-300 outline-none'

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5 max-w-xl"
    >
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"
        >
          Nome
        </label>
        <input
          id="name"
          required
          minLength={2}
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"
        >
          Descrição
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Opcional"
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label
          htmlFor="capacity"
          className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"
        >
          Capacidade (pessoas)
        </label>
        <input
          id="capacity"
          type="number"
          min={1}
          required
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="rules"
          className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"
        >
          Regras
        </label>
        <textarea
          id="rules"
          rows={3}
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder="Opcional"
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className={`flex items-center gap-3 pt-2 ${hideCancel ? 'justify-center' : ''}`}>
        <button type="submit" disabled={loading} className={primaryButtonClassName}>
          {loading
            ? 'Salvando…'
            : (submitLabel ?? (mode === 'create' ? 'Cadastrar' : 'Salvar alterações'))}
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
