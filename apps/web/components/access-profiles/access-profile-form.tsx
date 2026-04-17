'use client'

import { api } from '@/lib/api'
import { primaryButtonClassName } from '@/lib/primary-button'
import type { AccessProfile, Permission } from '@all-club/shared'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type ProfileWithPermissions = AccessProfile & {
  permissions: { permissionKey: string; permission: Permission }[]
}

type Props = {
  mode: 'create' | 'edit'
  profile?: ProfileWithPermissions
  allPermissions: Permission[]
  onSuccess?: () => void
  onCancel?: () => void
  hideCancel?: boolean
}

const RESOURCE_LABEL: Record<string, string> = {
  member: 'Sócios',
  area: 'Áreas',
  agenda: 'Agendas',
  booking: 'Agendamentos',
  'schedule-config': 'Rotinas',
  user: 'Usuários',
  'access-profile': 'Perfis de acesso',
}

export function AccessProfileForm({
  mode,
  profile,
  allPermissions,
  onSuccess,
  onCancel,
  hideCancel,
}: Props) {
  const router = useRouter()
  const [name, setName] = useState(profile?.name ?? '')
  const [description, setDescription] = useState(profile?.description ?? '')
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    new Set(profile?.permissions.map((p) => p.permissionKey) ?? []),
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function togglePermission(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      let savedId: string
      if (mode === 'create') {
        const created = await api.post<{ id: string }>('/access-profiles', {
          name,
          description: description || undefined,
        })
        savedId = created.id
      } else if (profile) {
        await api.patch(`/access-profiles/${profile.id}`, {
          name,
          description: description || undefined,
        })
        savedId = profile.id
      } else {
        return
      }

      // Always replace permissions (PUT)
      await api.put(`/access-profiles/${savedId}/permissions`, {
        permissionKeys: [...selectedKeys],
      })

      router.refresh()
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  // Group permissions by resource
  const grouped = allPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.resource]) acc[p.resource] = []
    acc[p.resource].push(p)
    return acc
  }, {})

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
        <label htmlFor="profileName" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          Nome do perfil
        </label>
        <input
          id="profileName"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Atendimento"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="profileDesc" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          Descrição <span className="normal-case font-normal">(opcional)</span>
        </label>
        <input
          id="profileDesc"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Permissões
        </p>
        <div className="space-y-4">
          {Object.entries(grouped).map(([resource, perms]) => (
            <div key={resource}>
              <p className="text-xs font-semibold text-gray-700 mb-1.5">
                {RESOURCE_LABEL[resource] ?? resource}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {perms.map((p) => (
                  <label key={p.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedKeys.has(p.key)}
                      onChange={() => togglePermission(p.key)}
                      className="rounded border-gray-300 text-gray-900 focus:ring-gray-300"
                    />
                    <span className="text-xs text-gray-600">{p.description}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`flex items-center gap-3 pt-2 ${hideCancel ? 'justify-center' : ''}`}>
        <button type="submit" disabled={loading} className={primaryButtonClassName}>
          {loading ? 'Salvando…' : (mode === 'create' ? 'Cadastrar' : 'Salvar')}
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
