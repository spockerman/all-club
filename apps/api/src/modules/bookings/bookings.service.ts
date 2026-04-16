import type { PrismaClient } from '@prisma/client'
import type { CreateBookingInput, BookingStatus } from '@all-club/shared'

interface CreateBookingData extends CreateBookingInput {
  memberId: string
}

export class BookingsService {
  constructor(private readonly prisma: PrismaClient) {}

  findMany(filters: Record<string, string | undefined>) {
    return this.prisma.booking.findMany({
      where: {
        memberId: filters.memberId,
        areaId: filters.areaId,
        status: filters.status as BookingStatus | undefined,
        date: filters.date ? new Date(filters.date) : undefined,
      },
      include: {
        member: { select: { id: true, name: true, email: true } },
        area: { select: { id: true, name: true } },
        slot: true,
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    })
  }

  findById(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        member: { select: { id: true, name: true, email: true } },
        area: { select: { id: true, name: true } },
        slot: true,
      },
    })
  }

  async create(data: CreateBookingData) {
    // Verifica se o slot/área/data já está ocupado
    const conflict = await this.prisma.booking.findFirst({
      where: {
        areaId: data.areaId,
        slotId: data.slotId,
        date: data.date,
        status: 'CONFIRMADO',
      },
    })
    if (conflict) throw new Error('Horário já reservado para este slot')

    // Verifica se a data está bloqueada
    const blocked = await this.prisma.blockedDate.findFirst({
      where: { areaId: data.areaId, date: data.date },
    })
    if (blocked) throw new Error(`Área indisponível nesta data: ${blocked.reason ?? 'bloqueada'}`)

    return this.prisma.booking.create({
      data: {
        memberId: data.memberId,
        areaId: data.areaId,
        slotId: data.slotId,
        date: data.date,
        status: 'CONFIRMADO',
      },
      include: {
        member: { select: { id: true, name: true } },
        area: { select: { id: true, name: true } },
        slot: true,
      },
    })
  }

  async updateStatus(id: string, status: 'CONFIRMADO' | 'CANCELADO') {
    try {
      return await this.prisma.booking.update({
        where: { id },
        data: { status },
      })
    } catch {
      return null
    }
  }
}
