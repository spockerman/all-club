import type { PrismaClient } from '@prisma/client'

export class SettingsService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Record<string, string>> {
    const rows = await this.prisma.clubSetting.findMany()
    return Object.fromEntries(rows.map((r) => [r.key, r.value]))
  }

  async upsertMany(entries: { key: string; value: string }[]): Promise<Record<string, string>> {
    await this.prisma.$transaction(
      entries.map((e) =>
        this.prisma.clubSetting.upsert({
          where: { key: e.key },
          update: { value: e.value },
          create: { key: e.key, value: e.value },
        }),
      ),
    )
    return this.findAll()
  }
}
