'use client'

import { api } from '@/lib/api'
import { CATEGORY_LABEL, STATUS_LABEL } from '@/lib/member-labels'
import { primaryButtonClassName } from '@/lib/primary-button'
import type { Member } from '@all-club/shared'
import type { CreateMemberInput } from '@all-club/shared'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const CATEGORIES = ['TITULAR', 'DEPENDENTE', 'CONVIDADO'] as const
const STATUSES = ['ATIVO', 'SUSPENSO', 'INATIVO', 'PENDENTE'] as const

type TitularOption = { id: string; name: string }

type Props = {
  mode: 'create' | 'edit'
  member?: Member
  titulares: TitularOption[]
}

export function MemberForm({ mode, member, titulares }: Props) {
  const router = useRouter()
  const [name, setName] = useState(member?.name ?? '')
  const [email, setEmail] = useState(member?.email ?? '')
  const [phone, setPhone] = useState(member?.phone ?? '')
  const [category, setCategory] = useState<Member['category']>(member?.category ?? 'TITULAR')
  const [holderId, setHolderId] = useState(member?.holderId ?? '')
  const [status, setStatus] = useState<Member['status']>(member?.status ?? 'PENDENTE')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const showHolder = category === 'DEPENDENTE' || category === 'CONVIDADO'
  const titularOptions = titulares.filter((t) => t.id !== member?.id)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (showHolder && !holderId) {
      setError('Selecione o titular para dependente ou convidado.')
      return
    }

    const phoneVal = phone.trim() || undefined

    setLoading(true)
    try {
      if (mode === 'create') {
        const body: CreateMemberInput = {
          name: name.trim(),
          email: email.trim(),
          phone: phoneVal,
          category,
          ...(category !== 'TITULAR' && holderId ? { holderId } : {}),
        }
        const created = await api.post<Member>('/members', body)
        router.push(`/members/${created.id}`)
        router.refresh()
      } else if (member) {
        const body = {
          name: name.trim(),
          email: email.trim(),
          phone: phoneVal,
          category,
          status,
          holderId: category === 'TITULAR' ? null : holderId || undefined,
        }
        await api.patch<Member>(`/members/${member.id}`, body)
        router.push(`/members/${member.id}`)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5 max-w-xl">
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
      )}

      <div>
        <label htmlFor="name" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          Nome
        </label>
        <input
          id="name"
          required
          minLength={2}
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-gray-300 focus:border-gray-300 outline-none"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-gray-300 focus:border-gray-300 outline-none"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          Telefone
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Opcional"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-gray-300 focus:border-gray-300 outline-none"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          Categoria
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => {
            const v = e.target.value as Member['category']
            setCategory(v)
            if (v === 'TITULAR') setHolderId('')
          }}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-gray-300 outline-none bg-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
      </div>

      {showHolder && (
        <div>
          <label htmlFor="holderId" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Titular
          </label>
          <select
            id="holderId"
            required={showHolder}
            value={holderId}
            onChange={(e) => setHolderId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-gray-300 outline-none bg-white"
          >
            <option value="">Selecione…</option>
            {titularOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {titularOptions.length === 0 && (
            <p className="text-xs text-amber-700 mt-1">Cadastre um titular antes de adicionar dependente ou convidado.</p>
          )}
        </div>
      )}

      {mode === 'edit' && (
        <div>
          <label htmlFor="status" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Member['status'])}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-gray-300 outline-none bg-white"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading} className={primaryButtonClassName}>
          {loading ? 'Salvando…' : mode === 'create' ? 'Cadastrar' : 'Salvar alterações'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-gray-900 px-2"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
