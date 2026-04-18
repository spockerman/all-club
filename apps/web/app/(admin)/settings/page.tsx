import { PageHeader } from '@/components/ui/page-header'
import { SettingsForm } from '@/components/settings/settings-form'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function getSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API_URL}/settings`, { cache: 'no-store' })
    if (!res.ok) return {}
    return res.json()
  } catch {
    return {}
  }
}

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Personalize as informações do clube" />
      <SettingsForm settings={settings} />
    </div>
  )
}
