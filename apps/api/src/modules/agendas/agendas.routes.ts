import type { FastifyPluginAsync } from 'fastify'
import { createAgendaSchema, createAgendaBatchSchema, updateAgendaSchema } from '@all-club/shared'
import type { JwtPayload } from '@all-club/shared'
import { authenticate } from '../../common/hooks/authenticate.hook.js'
import { requirePermission } from '../../common/hooks/require-permission.hook.js'
import { AgendasService } from './agendas.service.js'

export const agendasRoutes: FastifyPluginAsync = async (app) => {
  const svc = new AgendasService(app.prisma)
  app.addHook('preHandler', authenticate)

  app.get('/', { preHandler: [requirePermission('agenda:view')] }, async (req) => {
    const q = req.query as Record<string, string | undefined>
    return svc.findMany(q)
  })

  app.get('/:id', { preHandler: [requirePermission('agenda:view')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const agenda = await svc.findById(id)
    if (!agenda) return reply.status(404).send({ message: 'Agenda not found' })
    return agenda
  })

  app.post('/', { preHandler: [requirePermission('agenda:create')] }, async (req, reply) => {
    const data = createAgendaSchema.parse(req.body)
    try {
      return reply.status(201).send(await svc.create(data))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating agenda'
      return reply.status(409).send({ message })
    }
  })

  app.post('/batch', { preHandler: [requirePermission('agenda:create')] }, async (req, reply) => {
    const data = createAgendaBatchSchema.parse(req.body)
    return reply.status(201).send(await svc.createBatch(data))
  })

  app.patch('/:id', { preHandler: [requirePermission('agenda:edit')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = updateAgendaSchema.parse(req.body)
    try {
      return await svc.update(id, data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating agenda'
      const status = message.includes('not found') ? 404 : 409
      return reply.status(status).send({ message })
    }
  })

  app.delete('/:id', { preHandler: [requirePermission('agenda:delete')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    try {
      await svc.delete(id)
      return reply.status(204).send()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting agenda'
      const status = message.includes('not found') ? 404 : 409
      return reply.status(status).send({ message })
    }
  })

  app.post('/:id/reservations', { preHandler: [requirePermission('booking:create')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { memberId } = req.user as JwtPayload
    if (!memberId) return reply.status(400).send({ message: 'User is not linked to a member account' })
    try {
      return reply.status(201).send(await svc.reserve(id, memberId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error reserving agenda'
      const status = message.includes('not found') ? 404 : 409
      return reply.status(status).send({ message })
    }
  })

  app.delete('/:id/reservations', { preHandler: [requirePermission('booking:cancel')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    try {
      await svc.cancelReservation(id)
      return reply.status(204).send()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error cancelling reservation'
      const status = message.includes('not found') ? 404 : 409
      return reply.status(status).send({ message })
    }
  })
}
