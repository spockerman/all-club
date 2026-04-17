import type { FastifyPluginAsync } from 'fastify'
import {
  assignProfilesSchema,
  createInternalUserSchema,
  createMemberUserSchema,
} from '@all-club/shared'
import { authenticate } from '../../common/hooks/authenticate.hook.js'
import { requirePermission, requireRole } from '../../common/hooks/require-permission.hook.js'
import { UsersService } from './users.service.js'

export const usersRoutes: FastifyPluginAsync = async (app) => {
  const svc = new UsersService(app.prisma)

  app.addHook('preHandler', authenticate)

  // GET /users  [ADMIN or user:view]
  app.get('/', { preHandler: [requirePermission('user:view')] }, async (req) => {
    const q = req.query as Record<string, string | undefined>
    return svc.findMany({ role: q.role, status: q.status })
  })

  // GET /users/:id  [ADMIN or user:view]
  app.get('/:id', { preHandler: [requirePermission('user:view')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const user = await svc.findById(id)
    if (!user) return reply.status(404).send({ message: 'Usuário não encontrado.' })
    return user
  })

  // POST /users/internal  [ADMIN only]
  app.post(
    '/internal',
    { preHandler: [requireRole('ADMIN')] },
    async (req, reply) => {
      const data = createInternalUserSchema.parse(req.body)
      try {
        return reply.status(201).send(await svc.createInternal(data))
      } catch (err: unknown) {
        const e = err as { statusCode?: number; message: string }
        return reply.status(e.statusCode ?? 500).send({ message: e.message })
      }
    },
  )

  // POST /users/member  [ADMIN or user:create]
  app.post(
    '/member',
    { preHandler: [requirePermission('user:create')] },
    async (req, reply) => {
      const data = createMemberUserSchema.parse(req.body)
      try {
        return reply.status(201).send(await svc.createMember(data))
      } catch (err: unknown) {
        const e = err as { statusCode?: number; message: string }
        return reply.status(e.statusCode ?? 409).send({ message: e.message })
      }
    },
  )

  // PATCH /users/:id/activate  [ADMIN only]
  app.patch('/:id/activate', { preHandler: [requireRole('ADMIN')] }, async (req) => {
    const { id } = req.params as { id: string }
    return svc.activate(id)
  })

  // PATCH /users/:id/deactivate  [ADMIN only]
  app.patch('/:id/deactivate', { preHandler: [requireRole('ADMIN')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    try {
      return await svc.deactivate(id)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message: string }
      return reply.status(e.statusCode ?? 500).send({ message: e.message })
    }
  })

  // PATCH /users/:id/block  [ADMIN only]
  app.patch('/:id/block', { preHandler: [requireRole('ADMIN')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    try {
      return await svc.block(id)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message: string }
      return reply.status(e.statusCode ?? 500).send({ message: e.message })
    }
  })

  // PATCH /users/:id/unblock  [ADMIN only]
  app.patch('/:id/unblock', { preHandler: [requireRole('ADMIN')] }, async (req) => {
    const { id } = req.params as { id: string }
    return svc.unblock(id)
  })

  // PUT /users/:id/profiles  [ADMIN only]
  app.put('/:id/profiles', { preHandler: [requireRole('ADMIN')] }, async (req) => {
    const { id } = req.params as { id: string }
    const { profileIds } = assignProfilesSchema.parse(req.body)
    return svc.assignProfiles(id, profileIds)
  })
}
