import type { FastifyPluginAsync } from 'fastify'
import { createMemberSchema, updateMemberSchema } from '@all-club/shared'
import { MembersService } from './members.service.js'

export const membersRoutes: FastifyPluginAsync = async (app) => {
  const svc = new MembersService(app.prisma)

  // List all members (with optional filters)
  app.get('/', async (req) => {
    const { status, category, holderId } = req.query as Record<string, string | undefined>
    return svc.findMany({ status, category, holderId })
  })

  // Get one member
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const member = await svc.findById(id)
    if (!member) return reply.status(404).send({ message: 'Sócio não encontrado' })
    return member
  })

  // Create member
  app.post('/', async (req, reply) => {
    const data = createMemberSchema.parse(req.body)
    const member = await svc.create(data)
    return reply.status(201).send(member)
  })

  // Update member
  app.patch('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = updateMemberSchema.parse(req.body)
    const member = await svc.update(id, data)
    if (!member) return reply.status(404).send({ message: 'Sócio não encontrado' })
    return member
  })

  // Delete member
  app.delete('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    await svc.delete(id)
    return reply.status(204).send()
  })

  // List dependents of a member
  app.get('/:id/dependents', async (req) => {
    const { id } = req.params as { id: string }
    return svc.findDependents(id)
  })
}
