import { api } from '@/lib/api'
import { primaryButtonClassName } from '@/lib/primary-button'
import type { Member } from '@all-club/shared'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  ATIVO: 'Ativo',
  SUSPENSO: 'Suspenso',
  INATIVO: 'Inativo',
  PENDENTE: 'Pendente',
}

const STATUS_COLOR: Record<string, string> = {
  ATIVO: 'bg-green-100 text-green-800',
  SUSPENSO: 'bg-yellow-100 text-yellow-800',
  INATIVO: 'bg-gray-100 text-gray-600',
  PENDENTE: 'bg-emerald-50 text-emerald-900',
}

export default async function MembersPage() {
  const members = await api.get<Member[]>('/members').catch(() => [] as Member[])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sócios</h1>
        <Link
          href="/members/new"
          className={primaryButtonClassName}
        >
          + Novo Sócio
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Nome', 'E-mail', 'Categoria', 'Status', 'Dependentes', 'Ações'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{m.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{m.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600 capitalize">{m.category.toLowerCase()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[m.status]}`}>
                    {STATUS_LABEL[m.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {(m as Member & { dependents?: unknown[] }).dependents?.length ?? 0}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link href={`/members/${m.id}`} className="text-primary font-medium hover:underline mr-3">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                  Nenhum sócio cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
