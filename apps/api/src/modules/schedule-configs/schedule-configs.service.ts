import type { PrismaClient } from '@prisma/client'
import type { CreateScheduleConfigInput, UpdateScheduleConfigInput } from '@all-club/shared'

const include = { area: { select: { id: true, name: true } } }

export class ScheduleConfigsService {
  constructor(private readonly prisma: PrismaClient) {}

  findMany() {
    return this.prisma.scheduleConfig.findMany({ include, orderBy: { createdAt: 'desc' } })
  }

  findById(id: string) {
    return this.prisma.scheduleConfig.findUnique({ where: { id }, include })
  }

  create(data: CreateScheduleConfigInput) {
    return this.prisma.scheduleConfig.create({ data, include })
  }

  async update(id: string, data: UpdateScheduleConfigInput) {
    try {
      return await this.prisma.scheduleConfig.update({ where: { id }, data, include })
    } catch {
      return null
    }
  }

  async delete(id: string) {
    await this.prisma.scheduleConfig.delete({ where: { id } })
  }

  async toggleActive(id: string) {
    const config = await this.prisma.scheduleConfig.findUniqueOrThrow({ where: { id } })
    return this.prisma.scheduleConfig.update({
      where: { id },
      data: { active: !config.active },
      include,
    })
  }
}
