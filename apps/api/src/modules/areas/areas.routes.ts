import type { FastifyPluginAsync } from 'fastify'
import {
  createAreaSchema,
  updateAreaSchema,
  createAvailabilitySlotSchema,
  blockDateSchema,
} from '@all-club/shared'
import { AreasService } from './areas.service.js'

export const areasRoutes: FastifyPluginAsync = async (app) => {
  const svc = new AreasService(app.prisma)

  // List all areas
  app.get('/', async () => svc.findMany())

  // Get one area with its slots
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const area = await svc.findById(id)
    if (!area) return reply.status(404).send({ message: 'Área não encontrada' })
    return area
  })

  // Create area
  app.post('/', async (req, reply) => {
    const data = createAreaSchema.parse(req.body)
    return reply.status(201).send(await svc.create(data))
  })

  // Update area
  app.patch('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = updateAreaSchema.parse(req.body)
    const area = await svc.update(id, data)
    if (!area) return reply.status(404).send({ message: 'Área não encontrada' })
    return area
  })

  // Delete area
  app.delete('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    await svc.delete(id)
    return reply.status(204).send()
  })

  // --- Availability Slots ---

  // Add slot to area
  app.post('/:id/slots', async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = createAvailabilitySlotSchema.parse(req.body)
    return reply.status(201).send(await svc.addSlot(id, data))
  })

  // Remove slot
  app.delete('/:id/slots/:slotId', async (req, reply) => {
    const { slotId } = req.params as { id: string; slotId: string }
    await svc.removeSlot(slotId)
    return reply.status(204).send()
  })

  // Get availability for a specific date (returns slots minus blocked + booked)
  app.get('/:id/availability', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { date } = req.query as { date?: string }
    if (!date) return reply.status(400).send({ message: 'Query param "date" obrigatório (YYYY-MM-DD)' })
    return svc.getAvailability(id, new Date(date))
  })

  // --- Blocked Dates ---

  app.post('/:id/blocked-dates', async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = blockDateSchema.parse(req.body)
    return reply.status(201).send(await svc.blockDate(id, data))
  })

  app.delete('/:id/blocked-dates/:blockedId', async (req, reply) => {
    const { blockedId } = req.params as { id: string; blockedId: string }
    await svc.unblockDate(blockedId)
    return reply.status(204).send()
  })
}
