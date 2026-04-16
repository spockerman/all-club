import { MemberForm } from '@/components/members/member-form'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { api } from '@/lib/api'
import type { Member } from '@all-club/shared'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function loadTitulares() {
  const all = await api.get<Member[]>('/members').catch(() => [] as Member[])
  return all.filter((m) => m.category === 'TITULAR').map((m) => ({ id: m.id, name: m.name }))
}

export default async function EditMemberPage({ params }: { params: { id: string } }) {
  const [member, titulares] = await Promise.all([
    api.get<Member>(`/members/${params.id}`).catch(() => null),
    loadTitulares(),
  ])
  if (!member) notFound()

  return (
    <div>
      <Breadcrumb
        segments={[
          { label: 'Sócios', href: '/members' },
          { label: member.name, href: `/members/${member.id}` },
          { label: 'Editar sócio' },
        ]}
      />
      <MemberForm mode="edit" member={member} titulares={titulares} />
    </div>
  )
}
