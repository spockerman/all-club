import { api } from '@/lib/api'
import type { Member } from '@all-club/shared'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface MemberWithRelations extends Member {
  dependents: Member[]
  holder: Member | null
}

export default async function MemberDetailPage({ params }: { params: { id: string } }) {
  const member = await api.get<MemberWithRelations>(`/members/${params.id}`).catch(() => null)
  if (!member) notFound()

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/members" className="text-sm text-gray-500 hover:text-gray-700">
          ← Sócios
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold">{member.name}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <Field label="E-mail" value={member.email} />
        <Field label="Telefone" value={member.phone ?? '—'} />
        <Field label="Categoria" value={member.category} />
        <Field label="Status" value={member.status} />
        {member.holder && <Field label="Titular" value={`${member.holder.name} (${member.holder.email})`} />}
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
                <Link href={`/members/${d.id}`} className="text-sm text-primary font-medium hover:underline">
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  )
}
