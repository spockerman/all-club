import type { PrismaClient } from '@prisma/client'
import type { CreateAreaInput, UpdateAreaInput, CreateAvailabilitySlotInput, BlockDateInput, DayOfWeek } from '@all-club/shared'

const DAY_OF_WEEK_MAP: Record<number, DayOfWeek> = {
  0: 'DOMINGO',
  1: 'SEGUNDA',
  2: 'TERCA',
  3: 'QUARTA',
  4: 'QUINTA',
  5: 'SEXTA',
  6: 'SABADO',
}

export class AreasService {
  constructor(private readonly prisma: PrismaClient) {}

  findMany() {
    return this.prisma.area.findMany({
      where: { active: true },
      include: { availabilitySlots: true },
      orderBy: { name: 'asc' },
    })
  }

  findById(id: string) {
    return this.prisma.area.findUnique({
      where: { id },
      include: { availabilitySlots: true, blockedDates: true },
    })
  }

  create(data: CreateAreaInput) {
    return this.prisma.area.create({ data })
  }

  async update(id: string, data: UpdateAreaInput) {
    try {
      return await this.prisma.area.update({ where: { id }, data })
    } catch {
      return null
    }
  }

  delete(id: string) {
    return this.prisma.area.update({ where: { id }, data: { active: false } })
  }

  addSlot(areaId: string, data: CreateAvailabilitySlotInput) {
    return this.prisma.availabilitySlot.create({ data: { ...data, areaId } })
  }

  removeSlot(slotId: string) {
    return this.prisma.availabilitySlot.delete({ where: { id: slotId } })
  }

  async getAvailability(areaId: string, date: Date) {
    const dayOfWeek = DAY_OF_WEEK_MAP[date.getDay()]

    // Verifica se a data está bloqueada
    const blocked = await this.prisma.blockedDate.findFirst({
      where: { areaId, date },
    })
    if (blocked) return { blocked: true, reason: blocked.reason, slots: [] }

    // Busca slots do dia da semana
    const slots = await this.prisma.availabilitySlot.findMany({
      where: { areaId, dayOfWeek },
    })

    // Busca agendamentos confirmados para esta data
    const bookings = await this.prisma.booking.findMany({
      where: { areaId, date, status: 'CONFIRMADO' },
      select: { slotId: true },
    })
    const bookedSlotIds = new Set(bookings.map((b: { slotId: string }) => b.slotId))

    return {
      blocked: false,
      slots: slots.map((slot: { id: string; dayOfWeek: string; startTime: string; endTime: string; areaId: string }) => ({
        ...slot,
        available: !bookedSlotIds.has(slot.id),
      })),
    }
  }

  blockDate(areaId: string, data: BlockDateInput) {
    return this.prisma.blockedDate.create({ data: { ...data, areaId } })
  }

  unblockDate(id: string) {
    return this.prisma.blockedDate.delete({ where: { id } })
  }
}
