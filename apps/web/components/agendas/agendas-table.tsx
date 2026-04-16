'use client'

import { api } from '@/lib/api'
import {
  AGENDA_STATUS_LABEL,
  AGENDA_STATUS_VARIANT,
  PERIOD_LABEL,
} from '@/lib/agenda-labels'
import { primaryButtonClassName } from '@/lib/primary-button'
import { Modal } from '@/components/ui/modal'
import { StatusBadge } from '@/components/ui/status-badge'
import type { Agenda, AgendaPeriod, AgendaStatus } from '@all-club/shared'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { AgendaForm } from './agenda-form'
import { AgendaBatchForm } from './agenda-batch-form'

type AreaOption = { id: string; name: string }

type AgendaListItem = Agenda & {
  area: { id: string; name: string }
  reservation: { member: { id: string; name: string } } | null
}

type Props = {
  agendas: AgendaListItem[]
  areas: AreaOption[]
}

type NewTab = 'individual' | 'batch'

const DOUBLE_CLICK_DELAY = 250

const DAY_LABEL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function formatDate(date: Date | string) {
  const d = new Date(date)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = d.getUTCFullYear()
  const weekday = DAY_LABEL[d.getUTCDay()]
  return `${day}/${month}/${year} (${weekday})`
}

export function AgendasTable({ agendas, areas }: Props) {
  const router = useRouter()
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [showNew, setShowNew] = useState(false)
  const [newTab, setNewTab] = useState<NewTab>('individual')
  const [editTarget, setEditTarget] = useState<AgendaListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AgendaListItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function handleRowClick(agenda: AgendaListItem) {
    if (agenda.status === 'RESERVED') {
      // Reserved agendas: single click only opens detail (edit not allowed)
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current)
        clickTimerRef.current = null
      } else {
        clickTimerRef.current = setTimeout(() => {
          clickTimerRef.current = null
          setEditTarget(agenda)
        }, DOUBLE_CLICK_DELAY)
      }
      return
    }

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
      setDeleteTarget(agenda)
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null
        setEditTarget(agenda)
      }, DOUBLE_CLICK_DELAY)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await api.delete(`/agendas/${deleteTarget.id}`)
      setDeleteTarget(null)
      router.refresh()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setDeleteLoading(false)
    }
  }

  function openNew(tab: NewTab) {
    setNewTab(tab)
    setShowNew(true)
  }

  return (
    <>
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => openNew('batch')}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Gerar em lote
        </button>
        <button onClick={() => openNew('individual')} className={primaryButtonClassName}>
          + Nova Agenda
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Área', 'Data', 'Período', 'Status', 'Reservado por'].map((h) => (
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
            {agendas.map((a) => (
              <tr
                key={a.id}
                onClick={() => handleRowClick(a)}
                className="hover:bg-gray-50 cursor-pointer select-none"
                title={
                  a.status === 'RESERVED'
                    ? 'Clique para visualizar'
                    : 'Clique para editar · Duplo clique para excluir'
                }
              >
                <td className="px-4 py-3 text-sm font-medium">{a.area.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(a.date)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {PERIOD_LABEL[a.period as AgendaPeriod]}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={AGENDA_STATUS_LABEL[a.status as AgendaStatus]}
                    variant={AGENDA_STATUS_VARIANT[a.status as AgendaStatus]}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {a.reservation?.member.name ?? '—'}
                </td>
              </tr>
            ))}
            {agendas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                  Nenhuma agenda cadastrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New agenda modal — tabs for individual / batch */}
      {showNew && (
        <Modal
          title="Nova agenda"
          size="md"
          scrollable
          onClose={() => setShowNew(false)}
        >
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-5">
            {(['individual', 'batch'] as NewTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setNewTab(tab)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  newTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'individual' ? 'Individual' : 'Em lote'}
              </button>
            ))}
          </div>

          {newTab === 'individual' ? (
            <AgendaForm
              mode="create"
              areas={areas}
              onSuccess={() => setShowNew(false)}
              submitLabel="Cadastrar"
              hideCancel
            />
          ) : (
            <AgendaBatchForm
              areas={areas}
              onSuccess={() => setShowNew(false)}
            />
          )}
        </Modal>
      )}

      {/* Edit modal */}
      {editTarget && (
        <Modal
          title={editTarget.status === 'RESERVED' ? 'Detalhes da agenda' : 'Editar agenda'}
          size="md"
          scrollable
          onClose={() => setEditTarget(null)}
        >
          {editTarget.status === 'RESERVED' ? (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Área</span>
                  <span className="font-medium">{editTarget.area.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Data</span>
                  <span className="font-medium">{formatDate(editTarget.date)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Período</span>
                  <span className="font-medium">{PERIOD_LABEL[editTarget.period as AgendaPeriod]}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Reservado por</span>
                  <span className="font-medium">{editTarget.reservation?.member.name ?? '—'}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center pt-1">
                Agenda com reserva ativa não pode ser editada.
              </p>
            </div>
          ) : (
            <AgendaForm
              mode="edit"
              agenda={editTarget}
              areas={areas}
              onSuccess={() => setEditTarget(null)}
              submitLabel="Salvar"
              hideCancel
            />
          )}
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <Modal
          title="Excluir agenda"
          size="sm"
          onClose={() => {
            if (!deleteLoading) setDeleteTarget(null)
          }}
        >
          <p className="text-sm text-gray-600 mb-1">Deseja excluir esta agenda?</p>
          <p className="text-sm font-medium text-gray-900 mb-1">
            {deleteTarget.area.name} — {formatDate(deleteTarget.date)}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            {PERIOD_LABEL[deleteTarget.period as AgendaPeriod]}
          </p>
          <p className="text-xs text-gray-400 mb-5">
            Esta ação não pode ser desfeita. Agendas com reservas ativas não podem ser excluídas.
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
    </>
  )
}
