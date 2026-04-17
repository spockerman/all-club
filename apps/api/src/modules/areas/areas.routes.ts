import type { FastifyPluginAsync } from 'fastify'
import {
  createAreaSchema,
  updateAreaSchema,
  createAvailabilitySlotSchema,
  blockDateSchema,
} from '@all-club/shared'
import { authenticate } from '../../common/hooks/authenticate.hook.js'
import { requirePermission } from '../../common/hooks/require-permission.hook.js'
import { AreasService } from './areas.service.js'

export const areasRoutes: FastifyPluginAsync = async (app) => {
  const svc = new AreasService(app.prisma)
  app.addHook('preHandler', authenticate)

  app.get('/', { preHandler: [requirePermission('area:view')] }, async () => svc.findMany())

  app.get('/:id', { preHandler: [requirePermission('area:view')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const area = await svc.findById(id)
    if (!area) return reply.status(404).send({ message: 'Área não encontrada' })
    return area
  })

  app.post('/', { preHandler: [requirePermission('area:create')] }, async (req, reply) => {
    const data = createAreaSchema.parse(req.body)
    return reply.status(201).send(await svc.create(data))
  })

  app.patch('/:id', { preHandler: [requirePermission('area:edit')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = updateAreaSchema.parse(req.body)
    const area = await svc.update(id, data)
    if (!area) return reply.status(404).send({ message: 'Área não encontrada' })
    return area
  })

  app.delete('/:id', { preHandler: [requirePermission('area:delete')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    await svc.delete(id)
    return reply.status(204).send()
  })

  // --- Availability Slots ---

  app.post('/:id/slots', { preHandler: [requirePermission('area:edit')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = createAvailabilitySlotSchema.parse(req.body)
    return reply.status(201).send(await svc.addSlot(id, data))
  })

  app.delete('/:id/slots/:slotId', { preHandler: [requirePermission('area:edit')] }, async (req, reply) => {
    const { slotId } = req.params as { id: string; slotId: string }
    await svc.removeSlot(slotId)
    return reply.status(204).send()
  })

  app.get('/:id/availability', { preHandler: [requirePermission('booking:view')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { date } = req.query as { date?: string }
    if (!date) return reply.status(400).send({ message: 'Query param "date" obrigatório (YYYY-MM-DD)' })
    return svc.getAvailability(id, new Date(date))
  })

  // --- Blocked Dates ---

  app.post('/:id/blocked-dates', { preHandler: [requirePermission('area:edit')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = blockDateSchema.parse(req.body)
    return reply.status(201).send(await svc.blockDate(id, data))
  })

  app.delete('/:id/blocked-dates/:blockedId', { preHandler: [requirePermission('area:edit')] }, async (req, reply) => {
    const { blockedId } = req.params as { id: string; blockedId: string }
    await svc.unblockDate(blockedId)
    return reply.status(204).send()
  })
}
