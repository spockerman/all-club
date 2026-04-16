'use client'

import { api } from '@/lib/api'
import { CATEGORY_LABEL, MEMBER_STATUS_VARIANT, STATUS_LABEL } from '@/lib/member-labels'
import { primaryButtonClassName } from '@/lib/primary-button'
import { Modal } from '@/components/ui/modal'
import { StatusBadge } from '@/components/ui/status-badge'
import type { Member } from '@all-club/shared'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { MemberForm } from './member-form'

type MemberListItem = Member & {
  dependents?: unknown[]
  holder?: { id: string; name: string } | null
}

type TitularOption = { id: string; name: string }

type Props = {
  members: MemberListItem[]
  titulares: TitularOption[]
}

const DOUBLE_CLICK_DELAY = 250

export function MembersTable({ members, titulares }: Props) {
  const router = useRouter()
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [editTarget, setEditTarget] = useState<MemberListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MemberListItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function handleRowClick(member: MemberListItem) {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
      setDeleteTarget(member)
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null
        setEditTarget(member)
      }, DOUBLE_CLICK_DELAY)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await api.delete(`/members/${deleteTarget.id}`)
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Nome', 'E-mail', 'Telefone', 'Categoria', 'Titular', 'Status', 'Dependentes'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {members.map((m) => (
              <tr
                key={m.id}
                onClick={() => handleRowClick(m)}
                className="hover:bg-gray-50 cursor-pointer select-none"
                title="Clique para editar · Duplo clique para excluir"
              >
                <td className="px-4 py-3 text-sm font-medium">{m.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{m.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{m.phone ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{CATEGORY_LABEL[m.category]}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {m.holder?.name ?? (m.category === 'TITULAR' ? '—' : 'Sem titular')}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={STATUS_LABEL[m.status]}
                    variant={MEMBER_STATUS_VARIANT[m.status]}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{m.dependents?.length ?? 0}</td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                  Nenhum sócio cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editTarget && (
        <Modal title="Editar sócio" size="md" scrollable onClose={() => setEditTarget(null)}>
          <MemberForm
            mode="edit"
            member={editTarget}
            titulares={titulares}
            onSuccess={() => setEditTarget(null)}
            submitLabel="Salvar"
            hideCancel
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title="Excluir sócio"
          size="sm"
          onClose={() => { if (!deleteLoading) setDeleteTarget(null) }}
        >
          <p className="text-sm text-gray-600 mb-1">Deseja deletar o registro?</p>
          <p className="text-sm font-medium text-gray-900 mb-4">&ldquo;{deleteTarget.name}&rdquo;</p>
          <p className="text-xs text-gray-400 mb-5">
            Esta ação não pode ser desfeita. Dependentes e vínculos podem impedir a exclusão.
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
