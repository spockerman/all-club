'use client'

import { api } from '@/lib/api'
import { Modal } from '@/components/ui/modal'
import { primaryButtonClassName } from '@/lib/primary-button'
import type { AccessProfile, Permission } from '@all-club/shared'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { AccessProfileForm } from './access-profile-form'

type ProfileWithPermissions = AccessProfile & {
  permissions: { permissionKey: string; permission: Permission }[]
  _count: { users: number }
}

type Props = {
  profiles: ProfileWithPermissions[]
  allPermissions: Permission[]
}

const DOUBLE_CLICK_DELAY = 250

export function AccessProfilesTable({ profiles, allPermissions }: Props) {
  const router = useRouter()
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [showNew, setShowNew] = useState(false)
  const [editTarget, setEditTarget] = useState<ProfileWithPermissions | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProfileWithPermissions | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function handleRowClick(profile: ProfileWithPermissions) {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
      setDeleteTarget(profile)
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null
        setEditTarget(profile)
      }, DOUBLE_CLICK_DELAY)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await api.delete(`/access-profiles/${deleteTarget.id}`)
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
          + Novo Perfil
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Nome', 'Descrição', 'Permissões', 'Usuários', 'Status'].map((h) => (
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
            {profiles.map((p) => (
              <tr
                key={p.id}
                onClick={() => handleRowClick(p)}
                className="hover:bg-gray-50 cursor-pointer select-none"
                title="Clique para editar · Duplo clique para excluir"
              >
                <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                  {p.description ?? '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.permissions.length}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p._count.users}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      p.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {p.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
              </tr>
            ))}
            {profiles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                  Nenhum perfil cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showNew && (
        <Modal title="Novo perfil" size="lg" scrollable onClose={() => setShowNew(false)}>
          <AccessProfileForm
            mode="create"
            allPermissions={allPermissions}
            onSuccess={() => setShowNew(false)}
            hideCancel
          />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Editar perfil" size="lg" scrollable onClose={() => setEditTarget(null)}>
          <AccessProfileForm
            mode="edit"
            profile={editTarget}
            allPermissions={allPermissions}
            onSuccess={() => setEditTarget(null)}
            hideCancel
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title="Excluir perfil"
          size="sm"
          onClose={() => { if (!deleteLoading) setDeleteTarget(null) }}
        >
          <p className="text-sm text-gray-600 mb-1">Deseja excluir este perfil?</p>
          <p className="text-sm font-medium text-gray-900 mb-4">
            &ldquo;{deleteTarget.name}&rdquo;
          </p>
          {deleteTarget._count.users > 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
              Este perfil está associado a {deleteTarget._count.users} usuário(s) e não pode ser excluído.
            </p>
          )}
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
              disabled={deleteLoading || deleteTarget._count.users > 0}
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
