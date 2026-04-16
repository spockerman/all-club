import { AreaForm } from '@/components/areas/area-form'
import { Breadcrumb } from '@/components/ui/breadcrumb'

export default function NewAreaPage() {
  return (
    <div>
      <Breadcrumb segments={[{ label: 'Áreas', href: '/areas' }, { label: 'Nova área' }]} />
      <AreaForm mode="create" />
    </div>
  )
}
