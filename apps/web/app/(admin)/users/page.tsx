import { UsersTable } from '@/components/users/users-table'
import { PageHeader } from '@/components/ui/page-header'
import { api } from '@/lib/api'

export const dynamic = 'force-dynamic'

type UserListItem = {
  id: string
  name: string
  email: string
  phone?: string | null
  role: string
  status: string
  profiles: { accessProfile: { id: string; name: string } }[]
}

type ProfileOption = { id: string; name: string }

export default async function UsersPage() {
  const [users, profiles] = await Promise.all([
    api.get<UserListItem[]>('/users').catch(() => [] as UserListItem[]),
    api.get<ProfileOption[]>('/access-profiles').catch(() => [] as ProfileOption[]),
  ])

  return (
    <div>
      <PageHeader title="Usuários" subtitle={`Total: ${users.length}`} />
      <UsersTable users={users} profiles={profiles} />
    </div>
  )
}
