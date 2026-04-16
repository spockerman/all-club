import { MembersTable } from '@/components/members/members-table'
import { PageHeader } from '@/components/ui/page-header'
import { api } from '@/lib/api'
import type { Member } from '@all-club/shared'

export const dynamic = 'force-dynamic'

type MemberListItem = Member & {
  dependents?: unknown[]
  holder?: { id: string; name: string } | null
}

export default async function MembersPage() {
  const members = await api.get<MemberListItem[]>('/members').catch(() => [] as MemberListItem[])

  const titulares = members
    .filter((m) => m.category === 'TITULAR')
    .map((m) => ({ id: m.id, name: m.name }))

  return (
    <div>
      <PageHeader title="Sócios" subtitle={`Total cadastrados: ${members.length}`} />
      <MembersTable members={members} titulares={titulares} />
    </div>
  )
}
