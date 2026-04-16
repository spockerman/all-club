import type { FastifyPluginAsync } from 'fastify'
import { createBookingSchema, updateBookingStatusSchema } from '@all-club/shared'
import { BookingsService } from './bookings.service.js'

export const bookingsRoutes: FastifyPluginAsync = async (app) => {
  const svc = new BookingsService(app.prisma)

  // List bookings (filtros: memberId, areaId, date, status)
  app.get('/', async (req) => {
    const q = req.query as Record<string, string | undefined>
    return svc.findMany(q)
  })

  // Get one booking
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const booking = await svc.findById(id)
    if (!booking) return reply.status(404).send({ message: 'Agendamento não encontrado' })
    return booking
  })

  // Create booking
  app.post('/', async (req, reply) => {
    const data = createBookingSchema.parse(req.body)
    const memberId = (req.query as Record<string, string>).memberId
    if (!memberId) return reply.status(400).send({ message: 'Query param "memberId" obrigatório' })

    try {
      const booking = await svc.create({ ...data, memberId })
      return reply.status(201).send(booking)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar agendamento'
      return reply.status(409).send({ message })
    }
  })

  // Update booking status (confirm / cancel)
  app.patch('/:id/status', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { status } = updateBookingStatusSchema.parse(req.body)
    const booking = await svc.updateStatus(id, status)
    if (!booking) return reply.status(404).send({ message: 'Agendamento não encontrado' })
    return booking
  })
}
