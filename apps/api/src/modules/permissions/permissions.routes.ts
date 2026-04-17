import type { FastifyPluginAsync } from 'fastify'
import { authenticate } from '../../common/hooks/authenticate.hook.js'
import { requireRole } from '../../common/hooks/require-permission.hook.js'

export const permissionsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate)

  // GET /permissions  [ADMIN only — used for building profile editor]
  app.get('/', { preHandler: [requireRole('ADMIN')] }, async () => {
    return app.prisma.permission.findMany({ orderBy: [{ resource: 'asc' }, { key: 'asc' }] })
  })
}
