'use client'

import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  memberId: string
  memberName: string
}

export function DeleteMemberButton({ memberId, memberName }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleDelete() {
    if (
      !confirm(
        `Excluir o sócio "${memberName}"? Esta ação não pode ser desfeita. Dependentes e vínculos podem impedir a exclusão.`,
      )
    ) {
      return
    }
    setPending(true)
    try {
      await api.delete(`/members/${memberId}`)
      router.push('/members')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {pending ? 'Excluindo…' : 'Excluir sócio'}
    </button>
  )
}
