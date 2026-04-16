import { MemberForm } from '@/components/members/member-form'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { api } from '@/lib/api'
import type { Member } from '@all-club/shared'

export const dynamic = 'force-dynamic'

async function loadTitulares() {
  const all = await api.get<Member[]>('/members').catch(() => [] as Member[])
  return all.filter((m) => m.category === 'TITULAR').map((m) => ({ id: m.id, name: m.name }))
}

export default async function NewMemberPage() {
  const titulares = await loadTitulares()

  return (
    <div>
      <Breadcrumb segments={[{ label: 'Sócios', href: '/members' }, { label: 'Novo sócio' }]} />
      <MemberForm mode="create" titulares={titulares} />
    </div>
  )
}
