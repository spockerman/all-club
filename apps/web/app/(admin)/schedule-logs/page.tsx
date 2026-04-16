import { PageHeader } from '@/components/ui/page-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { api } from '@/lib/api'
import {
  SCHEDULE_LOG_STATUS_LABEL,
  SCHEDULE_LOG_STATUS_VARIANT,
  TRIGGER_TYPE_LABEL,
} from '@/lib/agenda-labels'
import type { ScheduleLog, ScheduleLogStatus, TriggerType } from '@all-club/shared'

export const dynamic = 'force-dynamic'

type ScheduleLogListItem = ScheduleLog & {
  config: {
    id: string
    description: string | null
    area: { name: string }
  }
}

function formatDateTime(date: Date | string) {
  const d = new Date(date)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

export default async function ScheduleLogsPage() {
  const logs = await api
    .get<ScheduleLogListItem[]>('/schedule-logs')
    .catch(() => [] as ScheduleLogListItem[])

  return (
    <div>
      <PageHeader
        title="Histórico de Execuções"
        subtitle={`Últimas ${logs.length} execuções registradas`}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Data/hora', 'Área', 'Rotina', 'Tipo', 'Criadas', 'Ignoradas', 'Status'].map((h) => (
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
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {formatDateTime(log.executedAt)}
                </td>
                <td className="px-4 py-3 text-sm font-medium">{log.config.area.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                  {log.config.description ?? '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {TRIGGER_TYPE_LABEL[log.triggerType as TriggerType]}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-green-700">
                  {log.agendasCreated}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{log.agendasSkipped}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={SCHEDULE_LOG_STATUS_LABEL[log.status as ScheduleLogStatus]}
                    variant={SCHEDULE_LOG_STATUS_VARIANT[log.status as ScheduleLogStatus]}
                  />
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                  Nenhuma execução registrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
