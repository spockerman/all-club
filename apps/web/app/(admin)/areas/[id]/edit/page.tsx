import { AreaForm } from '@/components/areas/area-form'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { api } from '@/lib/api'
import type { Area } from '@all-club/shared'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditAreaPage({ params }: { params: { id: string } }) {
  const area = await api.get<Area>(`/areas/${params.id}`).catch(() => null)
  if (!area) notFound()

  return (
    <div>
      <Breadcrumb
        segments={[
          { label: 'Áreas', href: '/areas' },
          { label: area.name, href: `/areas/${area.id}` },
          { label: 'Editar área' },
        ]}
      />
      <AreaForm mode="edit" area={area} />
    </div>
  )
}
