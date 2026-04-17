'use client'

import { api } from '@/lib/api'
import { Modal } from '@/components/ui/modal'
import { StatusBadge } from '@/components/ui/status-badge'
import { primaryButtonClassName } from '@/lib/primary-button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { UserForm } from './user-form'

type UserListItem = {
  id: string
  name: string
  email: string
  phone?: string | null
  role: string
  status: string
  profiles: { accessProfile: { id: string; name: string } }[]
}

type ProfileOption = { id: string; name: string }

type Props = {
  users: UserListItem[]
  profiles: ProfileOption[]
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  EMPLOYEE: 'Funcionário',
  MEMBER: 'Sócio',
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  BLOCKED: 'Bloqueado',
}

const STATUS_VARIANT: Record<string, 'green' | 'gray' | 'red'> = {
  ACTIVE: 'green',
  INACTIVE: 'gray',
  BLOCKED: 'red',
}

type ActionType = 'activate' | 'deactivate' | 'block' | 'unblock'

export function UsersTable({ users, profiles }: Props) {
  const router = useRouter()

  const [showNew, setShowNew] = useState(false)
  const [actionTarget, setActionTarget] = useState<{ user: UserListItem; action: ActionType } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleAction() {
    if (!actionTarget) return
    setActionLoading(true)
    setActionError(null)
    try {
      await api.patch(`/users/${actionTarget.user.id}/${actionTarget.action}`, {})
      setActionTarget(null)
      router.refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao executar ação')
    } finally {
      setActionLoading(false)
    }
  }

  const ACTION_LABEL: Record<ActionType, string> = {
    activate: 'Ativar',
    deactivate: 'Inativar',
    block: 'Bloquear',
    unblock: 'Desbloquear',
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowNew(true)} className={primaryButtonClassName}>
          + Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Nome', 'E-mail', 'Papel', 'Perfis', 'Status', 'Ações'].map((h) => (
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
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{u.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{ROLE_LABEL[u.role] ?? u.role}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {u.profiles.length > 0
                    ? u.profiles.map((p) => p.accessProfile.name).join(', ')
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={STATUS_LABEL[u.status] ?? u.status}
                    variant={STATUS_VARIANT[u.status] ?? 'gray'}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {u.status !== 'ACTIVE' && (
                      <button
                        onClick={() => setActionTarget({ user: u, action: 'activate' })}
                        className="text-xs text-green-700 hover:text-green-900 font-medium"
                      >
                        Ativar
                      </button>
                    )}
                    {u.status === 'ACTIVE' && u.role !== 'ADMIN' && (
                      <>
                        <button
                          onClick={() => setActionTarget({ user: u, action: 'deactivate' })}
                          className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Inativar
                        </button>
                        <button
                          onClick={() => setActionTarget({ user: u, action: 'block' })}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Bloquear
                        </button>
                      </>
                    )}
                    {u.status === 'BLOCKED' && (
                      <button
                        onClick={() => setActionTarget({ user: u, action: 'unblock' })}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Desbloquear
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                  Nenhum usuário cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showNew && (
        <Modal title="Novo usuário interno" size="md" scrollable onClose={() => setShowNew(false)}>
          <UserForm
            profiles={profiles}
            onSuccess={() => setShowNew(false)}
            hideCancel
          />
        </Modal>
      )}

      {actionTarget && (
        <Modal
          title={`${ACTION_LABEL[actionTarget.action]} usuário`}
          size="sm"
          onClose={() => { if (!actionLoading) setActionTarget(null) }}
        >
          <p className="text-sm text-gray-600 mb-1">
            {ACTION_LABEL[actionTarget.action]} o usuário:
          </p>
          <p className="text-sm font-medium text-gray-900 mb-4">
            &ldquo;{actionTarget.user.name}&rdquo;
          </p>
          {actionError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
              {actionError}
            </div>
          )}
          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={() => setActionTarget(null)}
              disabled={actionLoading}
              className="text-sm text-gray-600 hover:text-gray-900 px-2 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAction}
              disabled={actionLoading}
              className={primaryButtonClassName}
            >
              {actionLoading ? 'Aguarde…' : ACTION_LABEL[actionTarget.action]}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
