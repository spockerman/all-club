import type { FastifyPluginAsync } from 'fastify'
import { createMarketingMediaSchema, updateMarketingMediaSchema } from '@all-club/shared'
import { authenticate } from '../../common/hooks/authenticate.hook.js'
import { requireRole } from '../../common/hooks/require-permission.hook.js'
import { MarketingService } from './marketing.service.js'

export const marketingRoutes: FastifyPluginAsync = async (app) => {
  const svc = new MarketingService(app.prisma)

  // Public — mobile app reads active marketing items without auth
  app.get('/active', async () => svc.findActive())

  app.addHook('preHandler', authenticate)

  app.get('/', { preHandler: [requireRole('ADMIN', 'EMPLOYEE')] }, async () => svc.findMany())

  app.get('/:id', { preHandler: [requireRole('ADMIN', 'EMPLOYEE')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const item = await svc.findById(id)
    if (!item) return reply.status(404).send({ message: 'Item não encontrado' })
    return item
  })

  app.post('/', { preHandler: [requireRole('ADMIN', 'EMPLOYEE')] }, async (req, reply) => {
    const data = createMarketingMediaSchema.parse(req.body)
    return reply.status(201).send(await svc.create(data))
  })

  app.patch('/:id', { preHandler: [requireRole('ADMIN', 'EMPLOYEE')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = updateMarketingMediaSchema.parse(req.body)
    const item = await svc.update(id, data)
    if (!item) return reply.status(404).send({ message: 'Item não encontrado' })
    return item
  })

  app.delete('/:id', { preHandler: [requireRole('ADMIN')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    await svc.delete(id)
    return reply.status(204).send()
  })
}
