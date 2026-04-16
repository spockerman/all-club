'use client'

import { api } from '@/lib/api'
import { Modal } from '@/components/ui/modal'
import { primaryButtonClassName } from '@/lib/primary-button'
import type { Area, AvailabilitySlot } from '@all-club/shared'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { AreaForm } from './area-form'

type AreaListItem = Area & {
  availabilitySlots: AvailabilitySlot[]
}

type Props = {
  areas: AreaListItem[]
}

const DOUBLE_CLICK_DELAY = 250

export function AreasTable({ areas }: Props) {
  const router = useRouter()
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [showNew, setShowNew] = useState(false)
  const [editTarget, setEditTarget] = useState<AreaListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AreaListItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function handleRowClick(area: AreaListItem) {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
      setDeleteTarget(area)
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null
        setEditTarget(area)
      }, DOUBLE_CLICK_DELAY)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await api.delete(`/areas/${deleteTarget.id}`)
      setDeleteTarget(null)
      router.refresh()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowNew(true)} className={primaryButtonClassName}>
          + Nova Área
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Nome', 'Descrição', 'Capacidade', 'Horários'].map((h) => (
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
            {areas.map((a) => (
              <tr
                key={a.id}
                onClick={() => handleRowClick(a)}
                className="hover:bg-gray-50 cursor-pointer select-none"
                title="Clique para editar · Duplo clique para excluir"
              >
                <td className="px-4 py-3 text-sm font-medium">{a.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                  {a.description ?? '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{a.capacity} pessoas</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {a.availabilitySlots.length} horário{a.availabilitySlots.length !== 1 ? 's' : ''}
                </td>
              </tr>
            ))}
            {areas.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">
                  Nenhuma área cadastrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showNew && (
        <Modal title="Nova área" size="md" scrollable onClose={() => setShowNew(false)}>
          <AreaForm
            mode="create"
            onSuccess={() => setShowNew(false)}
            submitLabel="Cadastrar"
            hideCancel
          />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Editar área" size="md" scrollable onClose={() => setEditTarget(null)}>
          <AreaForm
            mode="edit"
            area={editTarget}
            onSuccess={() => setEditTarget(null)}
            submitLabel="Salvar"
            hideCancel
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title="Excluir área"
          size="sm"
          onClose={() => {
            if (!deleteLoading) setDeleteTarget(null)
          }}
        >
          <p className="text-sm text-gray-600 mb-1">Deseja deletar o registro?</p>
          <p className="text-sm font-medium text-gray-900 mb-4">
            &ldquo;{deleteTarget.name}&rdquo;
          </p>
          <p className="text-xs text-gray-400 mb-5">
            Esta ação desativará a área. Agendamentos existentes podem impedir a exclusão.
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
