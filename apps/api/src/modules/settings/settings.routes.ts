import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { authenticate } from '../../common/hooks/authenticate.hook.js'
import { requireRole } from '../../common/hooks/require-permission.hook.js'
import { SettingsService } from './settings.service.js'

const updateSettingsSchema = z.record(z.string(), z.string())

export const settingsRoutes: FastifyPluginAsync = async (app) => {
  const svc = new SettingsService(app.prisma)

  // Public — any client can read settings (logo URL, club name)
  app.get('/', async () => svc.findAll())

  // Admin only — update one or more settings
  app.patch(
    '/',
    { preHandler: [authenticate, requireRole('ADMIN')] },
    async (req, reply) => {
      const data = updateSettingsSchema.parse(req.body)
      const entries = Object.entries(data).map(([key, value]) => ({ key, value }))
      return reply.send(await svc.upsertMany(entries))
    },
  )
}
