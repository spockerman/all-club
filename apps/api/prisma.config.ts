// Com prisma.config.ts presente, o CLI do Prisma NÃO carrega .env sozinho —
// é preciso carregar aqui para migrate/studio/seed enxergarem DATABASE_URL.
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://x:x@localhost:5432/x',
  },
})
