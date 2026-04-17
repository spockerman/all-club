import type { PrismaClient } from '@prisma/client'
import type { CreateInternalUserInput, CreateMemberUserInput } from '@all-club/shared'
import { hashPassword, validatePasswordPolicy } from '../../common/utils/password.utils.js'

const userSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  status: true,
  memberId: true,
  failedLoginAttempts: true,
  lockedUntil: true,
  createdAt: true,
  updatedAt: true,
  profiles: {
    include: {
      accessProfile: { select: { id: true, name: true } },
    },
  },
} as const

export class UsersService {
  constructor(private readonly prisma: PrismaClient) {}

  findMany(filters: { role?: string; status?: string }) {
    return this.prisma.user.findMany({
      where: {
        ...(filters.role ? { role: filters.role as never } : {}),
        ...(filters.status ? { status: filters.status as never } : {}),
      },
      select: userSelect,
      orderBy: { name: 'asc' },
    })
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id }, select: userSelect })
  }

  async createInternal(data: CreateInternalUserInput) {
    const tempPassword = `Temp@${Math.random().toString(36).slice(2, 10)}`
    const passwordHash = await hashPassword(tempPassword)

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role,
        credential: {
          create: { passwordHash, mustChangePassword: true },
        },
        ...(data.profileIds?.length
          ? {
              profiles: {
                create: data.profileIds.map((accessProfileId) => ({ accessProfileId })),
              },
            }
          : {}),
      },
      select: userSelect,
    })

    // In production: send welcome email with tempPassword
    console.log(`[USERS] Temp password for ${data.email}: ${tempPassword}`)

    return { ...user, mustChangePassword: true }
  }

  async createMember(data: CreateMemberUserInput) {
    validatePasswordPolicy(data.password)

    const member = await this.prisma.member.findUnique({ where: { id: data.memberId } })
    if (!member) throw Object.assign(new Error('Sócio não encontrado.'), { statusCode: 404 })

    const existing = await this.prisma.user.findFirst({ where: { memberId: data.memberId } })
    if (existing) {
      throw Object.assign(new Error('Este sócio já possui acesso ao sistema.'), { statusCode: 409 })
    }

    const passwordHash = await hashPassword(data.password)

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: member.name,
        role: 'MEMBER',
        memberId: data.memberId,
        credential: { create: { passwordHash } },
      },
      select: userSelect,
    })
  }

  async activate(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE', failedLoginAttempts: 0, lockedUntil: null },
      select: userSelect,
    })
  }

  async deactivate(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } })
    if (user.role === 'ADMIN') {
      throw Object.assign(new Error('Não é possível inativar um administrador.'), {
        statusCode: 403,
      })
    }
    await this.prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    return this.prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
      select: userSelect,
    })
  }

  async block(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } })
    if (user.role === 'ADMIN') {
      throw Object.assign(new Error('Não é possível bloquear um administrador.'), {
        statusCode: 403,
      })
    }
    await this.prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    return this.prisma.user.update({
      where: { id },
      data: { status: 'BLOCKED', lockedUntil: null },
      select: userSelect,
    })
  }

  async unblock(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE', failedLoginAttempts: 0, lockedUntil: null },
      select: userSelect,
    })
  }

  async assignProfiles(userId: string, profileIds: string[]) {
    // Replace all profiles
    await this.prisma.userAccessProfile.deleteMany({ where: { userId } })
    if (profileIds.length > 0) {
      await this.prisma.userAccessProfile.createMany({
        data: profileIds.map((accessProfileId) => ({ userId, accessProfileId })),
        skipDuplicates: true,
      })
    }
    return this.findById(userId)
  }
}
