import type { FastifyPluginAsync } from 'fastify'
import { createAgendaSchema, createAgendaBatchSchema, updateAgendaSchema } from '@all-club/shared'
import { AgendasService } from './agendas.service.js'

export const agendasRoutes: FastifyPluginAsync = async (app) => {
  const svc = new AgendasService(app.prisma)

  // List agendas — ?areaId=&dateFrom=&dateTo=&status=&period=
  app.get('/', async (req) => {
    const q = req.query as Record<string, string | undefined>
    return svc.findMany(q)
  })

  // Get one
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const agenda = await svc.findById(id)
    if (!agenda) return reply.status(404).send({ message: 'Agenda not found' })
    return agenda
  })

  // Create individual
  app.post('/', async (req, reply) => {
    const data = createAgendaSchema.parse(req.body)
    try {
      return reply.status(201).send(await svc.create(data))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating agenda'
      return reply.status(409).send({ message })
    }
  })

  // Create batch (date range)
  app.post('/batch', async (req, reply) => {
    const data = createAgendaBatchSchema.parse(req.body)
    return reply.status(201).send(await svc.createBatch(data))
  })

  // Update
  app.patch('/:id', async (req, reply) => {
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

  // Delete
  app.delete('/:id', async (req, reply) => {
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

  // Reserve agenda (create AgendaReservation)
  app.post('/:id/reservations', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { memberId } = req.body as { memberId?: string }
    if (!memberId) return reply.status(400).send({ message: 'memberId is required' })
    try {
      return reply.status(201).send(await svc.reserve(id, memberId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error reserving agenda'
      const status = message.includes('not found') ? 404 : 409
      return reply.status(status).send({ message })
    }
  })

  // Cancel reservation
  app.delete('/:id/reservations', async (req, reply) => {
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
