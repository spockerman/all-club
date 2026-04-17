import type { FastifyPluginAsync } from 'fastify'
import { createMemberSchema, updateMemberSchema } from '@all-club/shared'
import { authenticate } from '../../common/hooks/authenticate.hook.js'
import { requirePermission } from '../../common/hooks/require-permission.hook.js'
import { MembersService } from './members.service.js'

export const membersRoutes: FastifyPluginAsync = async (app) => {
  const svc = new MembersService(app.prisma)
  app.addHook('preHandler', authenticate)

  app.get('/', { preHandler: [requirePermission('member:view')] }, async (req) => {
    const { status, category, holderId } = req.query as Record<string, string | undefined>
    return svc.findMany({ status, category, holderId })
  })

  app.get('/:id', { preHandler: [requirePermission('member:view')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const member = await svc.findById(id)
    if (!member) return reply.status(404).send({ message: 'Sócio não encontrado' })
    return member
  })

  app.post('/', { preHandler: [requirePermission('member:create')] }, async (req, reply) => {
    const data = createMemberSchema.parse(req.body)
    return reply.status(201).send(await svc.create(data))
  })

  app.patch('/:id', { preHandler: [requirePermission('member:edit')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = updateMemberSchema.parse(req.body)
    const member = await svc.update(id, data)
    if (!member) return reply.status(404).send({ message: 'Sócio não encontrado' })
    return member
  })

  app.delete('/:id', { preHandler: [requirePermission('member:deactivate')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    await svc.delete(id)
    return reply.status(204).send()
  })

  app.get('/:id/dependents', { preHandler: [requirePermission('member:view')] }, async (req) => {
    const { id } = req.params as { id: string }
    return svc.findDependents(id)
  })
}
