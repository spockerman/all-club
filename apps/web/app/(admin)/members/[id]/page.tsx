import { DeleteMemberButton } from '@/components/members/delete-member-button'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { DetailCard, DetailField } from '@/components/ui/detail-card'
import { PrimaryNavigateButton } from '@/components/ui/primary-navigate-button'
import { StatusBadge } from '@/components/ui/status-badge'
import { api } from '@/lib/api'
import { CATEGORY_LABEL, MEMBER_STATUS_VARIANT, STATUS_LABEL } from '@/lib/member-labels'
import { linkActionClassName } from '@/lib/primary-button'
import type { Member } from '@all-club/shared'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface MemberWithRelations extends Member {
  dependents: Member[]
  holder: Member | null
}

export default async function MemberDetailPage({ params }: { params: { id: string } }) {
  const member = await api.get<MemberWithRelations>(`/members/${params.id}`).catch(() => null)
  if (!member) notFound()

  return (
    <div className="max-w-2xl">
      <Breadcrumb segments={[{ label: 'Sócios', href: '/members' }, { label: member.name }]} />

      <DetailCard>
        <DetailField label="E-mail" value={member.email} />
        <DetailField label="Telefone" value={member.phone ?? '—'} />
        <DetailField label="Categoria" value={CATEGORY_LABEL[member.category]} />
        <DetailField
          label="Status"
          value={
            <StatusBadge
              label={STATUS_LABEL[member.status]}
              variant={MEMBER_STATUS_VARIANT[member.status]}
            />
          }
        />
        {member.holder && (
          <DetailField
            label="Titular"
            value={`${member.holder.name} (${member.holder.email})`}
          />
        )}
      </DetailCard>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <PrimaryNavigateButton href={`/members/${member.id}/edit`}>Editar</PrimaryNavigateButton>
        <DeleteMemberButton memberId={member.id} memberName={member.name} />
      </div>

      {member.dependents.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Dependentes</h2>
          <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {member.dependents.map((d) => (
              <li key={d.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-gray-500">{d.email}</p>
                </div>
                <Link href={`/members/${d.id}`} className={`text-sm ${linkActionClassName}`}>
                  Ver
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
