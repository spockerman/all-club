import type { FastifyPluginAsync } from 'fastify'
import { authenticate } from '../../common/hooks/authenticate.hook.js'
import { requirePermission } from '../../common/hooks/require-permission.hook.js'

export const scheduleLogsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate)

  app.get('/', { preHandler: [requirePermission('schedule-config:manage')] }, async (req) => {
    const q = req.query as Record<string, string | undefined>
    const limit = Math.min(parseInt(q.limit ?? '100', 10), 500)

    return app.prisma.scheduleLog.findMany({
      where: {
        ...(q.configId ? { scheduleConfigId: q.configId } : {}),
        ...(q.status ? { status: q.status as never } : {}),
      },
      include: {
        config: { select: { id: true, description: true, area: { select: { name: true } } } },
      },
      orderBy: { executedAt: 'desc' },
      take: limit,
    })
  })

  app.get('/:id', { preHandler: [requirePermission('schedule-config:manage')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const log = await app.prisma.scheduleLog.findUnique({
      where: { id },
      include: {
        config: { select: { id: true, description: true, area: { select: { name: true } } } },
      },
    })
    if (!log) return reply.status(404).send({ message: 'Log not found' })
    return log
  })
}
