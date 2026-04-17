import { AccessProfilesTable } from '@/components/access-profiles/access-profiles-table'
import { PageHeader } from '@/components/ui/page-header'
import { api } from '@/lib/api'
import type { AccessProfile, Permission } from '@all-club/shared'

export const dynamic = 'force-dynamic'

type ProfileWithPermissions = AccessProfile & {
  permissions: { permissionKey: string; permission: Permission }[]
  _count: { users: number }
}

export default async function AccessProfilesPage() {
  const [profiles, permissions] = await Promise.all([
    api.get<ProfileWithPermissions[]>('/access-profiles').catch(() => [] as ProfileWithPermissions[]),
    api.get<Permission[]>('/permissions').catch(() => [] as Permission[]),
  ])

  return (
    <div>
      <PageHeader
        title="Perfis de Acesso"
        subtitle={`${profiles.length} perfis cadastrados`}
      />
      <AccessProfilesTable profiles={profiles} allPermissions={permissions} />
    </div>
  )
}
