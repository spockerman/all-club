import { MemberForm } from '@/components/members/member-form'
import { api } from '@/lib/api'
import type { Member } from '@all-club/shared'
import Link from 'next/link'
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
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/members/${member.id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← {member.name}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold">Editar sócio</h1>
      </div>
      <MemberForm mode="edit" member={member} titulares={titulares} />
    </div>
  )
}
