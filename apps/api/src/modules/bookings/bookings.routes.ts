import type { FastifyPluginAsync } from 'fastify'
import { createBookingSchema, updateBookingStatusSchema } from '@all-club/shared'
import { authenticate } from '../../common/hooks/authenticate.hook.js'
import { requirePermission } from '../../common/hooks/require-permission.hook.js'
import { BookingsService } from './bookings.service.js'

export const bookingsRoutes: FastifyPluginAsync = async (app) => {
  const svc = new BookingsService(app.prisma)
  app.addHook('preHandler', authenticate)

  app.get('/', { preHandler: [requirePermission('booking:view')] }, async (req) => {
    const q = req.query as Record<string, string | undefined>
    return svc.findMany(q)
  })

  app.get('/:id', { preHandler: [requirePermission('booking:view')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const booking = await svc.findById(id)
    if (!booking) return reply.status(404).send({ message: 'Agendamento não encontrado' })
    return booking
  })

  app.post('/', { preHandler: [requirePermission('booking:create')] }, async (req, reply) => {
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

  app.patch('/:id/status', { preHandler: [requirePermission('booking:cancel')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { status } = updateBookingStatusSchema.parse(req.body)
    const booking = await svc.updateStatus(id, status)
    if (!booking) return reply.status(404).send({ message: 'Agendamento não encontrado' })
    return booking
  })
}
