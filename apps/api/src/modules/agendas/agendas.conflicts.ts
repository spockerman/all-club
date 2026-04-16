import type { PrismaClient } from '@prisma/client'

const PARTIAL_PERIODS: ['MORNING', 'AFTERNOON', 'EVENING'] = ['MORNING', 'AFTERNOON', 'EVENING']

/**
 * Validates period conflicts for an agenda slot:
 *  - ALL_DAY cannot coexist with any partial period on the same area+date
 *  - A partial period cannot coexist with ALL_DAY on the same area+date
 *
 * The exact-duplicate constraint (same area+date+period) is enforced by the DB UNIQUE index.
 * This function only checks cross-period conflicts.
 */
export async function checkPeriodConflict(
  prisma: PrismaClient,
  areaId: string,
  date: Date,
  period: string,
  excludeId?: string,
): Promise<void> {
  const base = {
    areaId,
    date,
    status: { not: 'CANCELLED' as const },
    ...(excludeId ? { id: { not: excludeId } } : {}),
  }

  if (period === 'ALL_DAY') {
    const conflict = await prisma.agenda.findFirst({
      where: { ...base, period: { in: PARTIAL_PERIODS } },
      select: { period: true },
    })
    if (conflict) {
      throw new Error(
        `Cannot create ALL_DAY agenda: a ${conflict.period} agenda already exists for this area and date.`,
      )
    }
  } else {
    const conflict = await prisma.agenda.findFirst({
      where: { ...base, period: 'ALL_DAY' },
    })
    if (conflict) {
      throw new Error(
        `Cannot create ${period} agenda: an ALL_DAY agenda already exists for this area and date.`,
      )
    }
  }
}
