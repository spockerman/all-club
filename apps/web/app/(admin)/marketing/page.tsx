import { MarketingTable } from '@/components/marketing/marketing-table'
import { PageHeader } from '@/components/ui/page-header'
import { api } from '@/lib/api'

export const dynamic = 'force-dynamic'

type MarketingMedia = {
  id: string
  title: string
  type: string
  imageUrl: string
  active: boolean
  createdAt: string
}

export default async function MarketingPage() {
  const items = await api.get<MarketingMedia[]>('/marketing').catch(() => [] as MarketingMedia[])

  return (
    <div>
      <PageHeader title="Marketing" subtitle={`Total: ${items.length}`} />
      <MarketingTable items={items} />
    </div>
  )
}
