import type { PrismaClient } from '@prisma/client'
import { AgendasService } from '../agendas/agendas.service.js'

/**
 * Executes agenda generation for a ScheduleConfig.
 * Idempotent: existing agendas are silently skipped.
 * Always produces a ScheduleLog regardless of outcome.
 */
export async function runSchedule(
  prisma: PrismaClient,
  configId: string,
  triggerType: 'AUTOMATIC' | 'MANUAL',
): Promise<{ status: string; created: number; skipped: number }> {
  let created = 0
  let skipped = 0
  let errorMessage: string | undefined
  let logStatus: 'SUCCESS' | 'FAILURE' | 'PARTIAL' = 'SUCCESS'
  let details: Record<string, string> = {}

  try {
    const config = await prisma.scheduleConfig.findUniqueOrThrow({ where: { id: configId } })

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const dateFrom = new Date(today)
    dateFrom.setUTCDate(dateFrom.getUTCDate() + 1) // start from tomorrow

    const dateTo = new Date(today)
    dateTo.setUTCDate(dateTo.getUTCDate() + config.daysAhead)

    const svc = new AgendasService(prisma)
    const result = await svc.createBatch({
      areaId: config.areaId,
      dateFrom,
      dateTo,
      period: config.period,
    })

    created = result.created
    skipped = result.skipped
    details = result.details
    logStatus = 'SUCCESS'
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Unexpected error'
    logStatus = 'FAILURE'
  }

  if (logStatus === 'SUCCESS' && created > 0 && skipped > 0) {
    logStatus = 'PARTIAL'
  }

  await prisma.scheduleLog.create({
    data: {
      scheduleConfigId: configId,
      triggerType,
      status: logStatus,
      agendasCreated: created,
      agendasSkipped: skipped,
      errorMessage: errorMessage ?? null,
      details,
    },
  })

  return { status: logStatus, created, skipped }
}
