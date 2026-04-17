'use client'

import { api } from '@/lib/api'
import { primaryButtonClassName } from '@/lib/primary-button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type ProfileOption = { id: string; name: string }

type Props = {
  profiles: ProfileOption[]
  onSuccess?: () => void
  onCancel?: () => void
  hideCancel?: boolean
}

const ROLE_LABEL = { ADMIN: 'Administrador', EMPLOYEE: 'Funcionário' }

export function UserForm({ profiles, onSuccess, onCancel, hideCancel }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'EMPLOYEE'>('EMPLOYEE')
  const [phone, setPhone] = useState('')
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function toggleProfile(id: string) {
    setSelectedProfiles((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/users/internal', {
        name,
        email,
        role,
        phone: phone || undefined,
        profileIds: selectedProfiles,
      })
      router.refresh()
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário')
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
        <label htmlFor="userName" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          Nome
        </label>
        <input
          id="userName"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="userEmail" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          E-mail
        </label>
        <input
          id="userEmail"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="userPhone" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          Telefone <span className="normal-case font-normal">(opcional)</span>
        </label>
        <input
          id="userPhone"
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Papel
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['EMPLOYEE', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                role === r
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {ROLE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {role === 'EMPLOYEE' && profiles.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Perfis de acesso
          </label>
          <div className="space-y-2">
            {profiles.map((p) => (
              <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProfiles.includes(p.id)}
                  onChange={() => toggleProfile(p.id)}
                  className="rounded border-gray-300 text-gray-900 focus:ring-gray-300"
                />
                <span className="text-sm text-gray-700">{p.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Uma senha temporária será gerada e exibida no console. O usuário deverá trocá-la no primeiro acesso.
      </p>

      <div className={`flex items-center gap-3 pt-2 ${hideCancel ? 'justify-center' : ''}`}>
        <button type="submit" disabled={loading} className={primaryButtonClassName}>
          {loading ? 'Criando…' : 'Criar usuário'}
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
