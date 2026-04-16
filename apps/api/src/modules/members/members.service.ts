import type { PrismaClient } from '@prisma/client'
import type { CreateMemberInput, UpdateMemberInput, MemberStatus, MemberCategory } from '@all-club/shared'

export class MembersService {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(filters: {
    status?: string
    category?: string
    holderId?: string
  }) {
    return this.prisma.member.findMany({
      where: {
        status: filters.status as MemberStatus | undefined,
        category: filters.category as MemberCategory | undefined,
        holderId: filters.holderId,
      },
      include: {
        dependents: true,
        holder: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    })
  }

  async findById(id: string) {
    return this.prisma.member.findUnique({
      where: { id },
      include: { dependents: true, holder: true },
    })
  }

  async create(data: CreateMemberInput) {
    return this.prisma.member.create({ data })
  }

  async update(id: string, data: UpdateMemberInput) {
    try {
      return await this.prisma.member.update({ where: { id }, data })
    } catch {
      return null
    }
  }

  async delete(id: string) {
    return this.prisma.member.delete({ where: { id } })
  }

  async findDependents(holderId: string) {
    return this.prisma.member.findMany({
      where: { holderId },
      orderBy: { name: 'asc' },
    })
  }
}
