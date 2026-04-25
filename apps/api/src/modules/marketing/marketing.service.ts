import type { PrismaClient } from '@prisma/client'
import type { CreateMarketingMediaInput, UpdateMarketingMediaInput } from '@all-club/shared'

export class MarketingService {
  constructor(private readonly prisma: PrismaClient) {}

  findMany() {
    return this.prisma.marketingMedia.findMany({ orderBy: { createdAt: 'desc' } })
  }

  findActive() {
    return this.prisma.marketingMedia.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  findById(id: string) {
    return this.prisma.marketingMedia.findUnique({ where: { id } })
  }

  create(data: CreateMarketingMediaInput) {
    return this.prisma.marketingMedia.create({ data })
  }

  async update(id: string, data: UpdateMarketingMediaInput) {
    try {
      return await this.prisma.marketingMedia.update({ where: { id }, data })
    } catch {
      return null
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.marketingMedia.delete({ where: { id } })
    } catch {
      return null
    }
  }
}
