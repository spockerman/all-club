'use client'

import { api } from '@/lib/api'
import { PERIOD_LABEL } from '@/lib/agenda-labels'
import { primaryButtonClassName } from '@/lib/primary-button'
import { Modal } from '@/components/ui/modal'
import type { ScheduleConfig } from '@all-club/shared'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { ScheduleConfigForm } from './schedule-config-form'

type AreaOption = { id: string; name: string }

type ScheduleConfigListItem = ScheduleConfig & {
  area: { id: string; name: string }
}

type Props = {
  configs: ScheduleConfigListItem[]
  areas: AreaOption[]
}

type RunResult = { created: number; skipped: number }

const DOUBLE_CLICK_DELAY = 250

export function ScheduleConfigsTable({ configs, areas }: Props) {
  const router = useRouter()
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [showNew, setShowNew] = useState(false)
  const [editTarget, setEditTarget] = useState<ScheduleConfigListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ScheduleConfigListItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [runTarget, setRunTarget] = useState<ScheduleConfigListItem | null>(null)
  const [runLoading, setRunLoading] = useState(false)
  const [runResult, setRunResult] = useState<RunResult | null>(null)
  const [runError, setRunError] = useState<string | null>(null)
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null)

  function handleRowClick(config: ScheduleConfigListItem) {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
      setDeleteTarget(config)
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null
        setEditTarget(config)
      }, DOUBLE_CLICK_DELAY)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await api.delete(`/schedule-configs/${deleteTarget.id}`)
      setDeleteTarget(null)
      router.refresh()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setDeleteLoading(false)
    }
  }

  async function handleToggle(config: ScheduleConfigListItem, e: React.MouseEvent) {
    e.stopPropagation()
    setToggleLoadingId(config.id)
    try {
      await api.patch(`/schedule-configs/${config.id}/toggle`, {})
      router.refresh()
    } catch {
      // silently ignore
    } finally {
      setToggleLoadingId(null)
    }
  }

  async function handleRun() {
    if (!runTarget) return
    setRunLoading(true)
    setRunError(null)
    setRunResult(null)
    try {
      const result = await api.post<RunResult>(`/schedule-configs/${runTarget.id}/run`, {})
      setRunResult(result)
      router.refresh()
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Erro ao executar')
    } finally {
      setRunLoading(false)
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowNew(true)} className={primaryButtonClassName}>
          + Nova Rotina
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Área', 'Descrição', 'Cron', 'Período', 'Dias à frente', 'Status', ''].map((h) => (
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
            {configs.map((c) => (
              <tr
                key={c.id}
                onClick={() => handleRowClick(c)}
                className="hover:bg-gray-50 cursor-pointer select-none"
                title="Clique para editar · Duplo clique para excluir"
              >
                <td className="px-4 py-3 text-sm font-medium">{c.area.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                  {c.description ?? '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 font-mono">{c.cronExpression}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {PERIOD_LABEL[c.period]}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{c.daysAhead}d</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={(e) => handleToggle(c, e)}
                    disabled={toggleLoadingId === c.id}
                    className={`text-xs font-semibold px-2 py-1 rounded-full transition-colors ${
                      c.active
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    {c.active ? 'Ativa' : 'Inativa'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setRunResult(null)
                      setRunError(null)
                      setRunTarget(c)
                    }}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-50 transition-colors"
                  >
                    Executar agora
                  </button>
                </td>
              </tr>
            ))}
            {configs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                  Nenhuma rotina cadastrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showNew && (
        <Modal title="Nova rotina" size="md" scrollable onClose={() => setShowNew(false)}>
          <ScheduleConfigForm
            mode="create"
            areas={areas}
            onSuccess={() => setShowNew(false)}
            submitLabel="Cadastrar"
            hideCancel
          />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Editar rotina" size="md" scrollable onClose={() => setEditTarget(null)}>
          <ScheduleConfigForm
            mode="edit"
            config={editTarget}
            areas={areas}
            onSuccess={() => setEditTarget(null)}
            submitLabel="Salvar"
            hideCancel
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title="Excluir rotina"
          size="sm"
          onClose={() => {
            if (!deleteLoading) setDeleteTarget(null)
          }}
        >
          <p className="text-sm text-gray-600 mb-1">Deseja excluir esta rotina?</p>
          <p className="text-sm font-medium text-gray-900 mb-4">
            &ldquo;{deleteTarget.description ?? deleteTarget.area.name}&rdquo;
          </p>
          <p className="text-xs text-gray-400 mb-5">
            A rotina será removida e o job agendado cancelado.
          </p>
          {deleteError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
              {deleteError}
            </div>
          )}
          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteLoading}
              className="text-sm text-gray-600 hover:text-gray-900 px-2 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {deleteLoading ? 'Excluindo…' : 'Excluir'}
            </button>
          </div>
        </Modal>
      )}

      {runTarget && (
        <Modal
          title="Executar rotina"
          size="sm"
          onClose={() => {
            if (!runLoading) {
              setRunTarget(null)
              setRunResult(null)
              setRunError(null)
            }
          }}
        >
          {runResult ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Agendas criadas</span>
                  <span className="font-bold text-green-700">{runResult.created}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Já existiam (ignoradas)</span>
                  <span className="font-bold text-gray-500">{runResult.skipped}</span>
                </div>
              </div>
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRunTarget(null)
                    setRunResult(null)
                  }}
                  className={primaryButtonClassName}
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-1">Executar manualmente a rotina:</p>
              <p className="text-sm font-medium text-gray-900 mb-4">
                &ldquo;{runTarget.description ?? runTarget.area.name}&rdquo;
              </p>
              <p className="text-xs text-gray-400 mb-5">
                Serão geradas agendas para os próximos {runTarget.daysAhead} dias. Agendas já
                existentes serão ignoradas.
              </p>
              {runError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                  {runError}
                </div>
              )}
              <div className="flex items-center gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setRunTarget(null)}
                  disabled={runLoading}
                  className="text-sm text-gray-600 hover:text-gray-900 px-2 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleRun}
                  disabled={runLoading}
                  className={primaryButtonClassName}
                >
                  {runLoading ? 'Executando…' : 'Executar'}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  )
}
