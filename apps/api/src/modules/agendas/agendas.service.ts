import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import type {
  CreateAgendaInput,
  CreateAgendaBatchInput,
  UpdateAgendaInput,
} from '@all-club/shared'
import { checkPeriodConflict } from './agendas.conflicts.js'

function normalizeDate(date: Date): Date {
  return new Date(date.toISOString().split('T')[0] + 'T00:00:00.000Z')
}

function eachDayInRange(from: Date, to: Date): Date[] {
  const days: Date[] = []
  const current = new Date(from)
  current.setUTCHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setUTCHours(0, 0, 0, 0)
  while (current <= end) {
    days.push(new Date(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return days
}

const include = {
  area: { select: { id: true, name: true } },
  reservation: { include: { member: { select: { id: true, name: true } } } },
}

export class AgendasService {
  constructor(private readonly prisma: PrismaClient) {}

  findMany(filters: {
    areaId?: string
    dateFrom?: string
    dateTo?: string
    status?: string
    period?: string
    memberId?: string
  }) {
    return this.prisma.agenda.findMany({
      where: {
        ...(filters.areaId ? { areaId: filters.areaId } : {}),
        ...(filters.status ? { status: filters.status as never } : {}),
        ...(filters.period ? { period: filters.period as never } : {}),
        ...(filters.memberId ? { reservation: { memberId: filters.memberId } } : {}),
        ...(filters.dateFrom || filters.dateTo
          ? {
              date: {
                ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
                ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
              },
            }
          : {}),
      },
      include,
      orderBy: [{ date: 'asc' }, { period: 'asc' }],
    })
  }

  findById(id: string) {
    return this.prisma.agenda.findUnique({ where: { id }, include })
  }

  async create(data: CreateAgendaInput): Promise<ReturnType<typeof this.findById>> {
    const date = normalizeDate(data.date)
    await checkPeriodConflict(this.prisma, data.areaId, date, data.period)

    try {
      const agenda = await this.prisma.agenda.create({
        data: { areaId: data.areaId, date, period: data.period },
        include,
      })
      return agenda
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new Error(`Agenda already exists for this area, date and period.`)
      }
      throw err
    }
  }

  async createBatch(data: CreateAgendaBatchInput) {
    const days = eachDayInRange(data.dateFrom, data.dateTo)
    let created = 0
    let skipped = 0
    const details: Record<string, 'created' | 'skipped'> = {}

    for (const date of days) {
      const key = date.toISOString().split('T')[0]
      try {
        await this.create({ areaId: data.areaId, date, period: data.period })
        created++
        details[key] = 'created'
      } catch {
        skipped++
        details[key] = 'skipped'
      }
    }

    return { created, skipped, details }
  }

  async update(id: string, data: UpdateAgendaInput) {
    const agenda = await this.prisma.agenda.findUniqueOrThrow({ where: { id } })

    if (agenda.status === 'RESERVED') {
      throw new Error('Cannot update an agenda that already has an active reservation.')
    }

    const date = data.date ? normalizeDate(data.date) : agenda.date
    const period = data.period ?? agenda.period

    await checkPeriodConflict(this.prisma, agenda.areaId, date, period, id)

    try {
      return await this.prisma.agenda.update({
        where: { id },
        data: { date, period },
        include,
      })
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new Error(`Agenda already exists for this area, date and period.`)
      }
      throw err
    }
  }

  async delete(id: string) {
    const agenda = await this.prisma.agenda.findUniqueOrThrow({ where: { id } })

    if (agenda.status === 'RESERVED') {
      throw new Error('Cannot delete an agenda that already has an active reservation.')
    }

    await this.prisma.agenda.delete({ where: { id } })
  }

  async reserve(agendaId: string, memberId: string) {
    const agenda = await this.prisma.agenda.findUniqueOrThrow({ where: { id: agendaId } })

    if (agenda.status !== 'AVAILABLE') {
      throw new Error('Agenda is not available for reservation.')
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.agendaReservation.create({
        data: { agendaId, memberId, status: 'CONFIRMED' },
      })
      return tx.agenda.update({
        where: { id: agendaId },
        data: { status: 'RESERVED' },
        include,
      })
    })
  }

  async cancelReservation(agendaId: string) {
    const agenda = await this.prisma.agenda.findUniqueOrThrow({
      where: { id: agendaId },
      include: { reservation: true },
    })

    if (agenda.status !== 'RESERVED' || !agenda.reservation) {
      throw new Error('Agenda does not have an active reservation.')
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.agendaReservation.update({
        where: { id: agenda.reservation!.id },
        data: { status: 'CANCELLED' },
      })
      return tx.agenda.update({
        where: { id: agendaId },
        data: { status: 'AVAILABLE' },
        include,
      })
    })
  }
}
