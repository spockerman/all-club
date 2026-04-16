import type { FastifyPluginAsync } from 'fastify'

export const scheduleLogsRoutes: FastifyPluginAsync = async (app) => {
  // List logs — ?configId=&status=&limit=
  app.get('/', async (req) => {
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

  app.get('/:id', async (req, reply) => {
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
