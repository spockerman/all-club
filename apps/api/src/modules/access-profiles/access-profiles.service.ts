import type { PrismaClient } from '@prisma/client'
import type {
  CreateAccessProfileInput,
  UpdateAccessProfileInput,
} from '@all-club/shared'

const profileInclude = {
  permissions: {
    include: { permission: true },
  },
  _count: { select: { users: true } },
} as const

export class AccessProfilesService {
  constructor(private readonly prisma: PrismaClient) {}

  findMany() {
    return this.prisma.accessProfile.findMany({
      include: profileInclude,
      orderBy: { name: 'asc' },
    })
  }

  findById(id: string) {
    return this.prisma.accessProfile.findUnique({ where: { id }, include: profileInclude })
  }

  create(data: CreateAccessProfileInput) {
    return this.prisma.accessProfile.create({ data, include: profileInclude })
  }

  async update(id: string, data: UpdateAccessProfileInput) {
    try {
      return await this.prisma.accessProfile.update({ where: { id }, data, include: profileInclude })
    } catch {
      return null
    }
  }

  async delete(id: string) {
    const profile = await this.prisma.accessProfile.findUniqueOrThrow({ where: { id } })
    const inUse = await this.prisma.userAccessProfile.count({
      where: { accessProfileId: id },
    })
    if (inUse > 0) {
      throw Object.assign(
        new Error(`Perfil em uso por ${inUse} usuário(s). Remova os vínculos antes de excluir.`),
        { statusCode: 409 },
      )
    }
    await this.prisma.accessProfile.delete({ where: { id: profile.id } })
  }

  async setPermissions(profileId: string, permissionKeys: string[]) {
    // Replace all permissions atomically
    await this.prisma.$transaction([
      this.prisma.accessProfilePermission.deleteMany({ where: { accessProfileId: profileId } }),
      this.prisma.accessProfilePermission.createMany({
        data: permissionKeys.map((permissionKey) => ({ accessProfileId: profileId, permissionKey })),
        skipDuplicates: true,
      }),
    ])
    return this.findById(profileId)
  }

  async toggleActive(id: string) {
    const profile = await this.prisma.accessProfile.findUniqueOrThrow({ where: { id } })
    return this.prisma.accessProfile.update({
      where: { id },
      data: { active: !profile.active },
      include: profileInclude,
    })
  }
}
