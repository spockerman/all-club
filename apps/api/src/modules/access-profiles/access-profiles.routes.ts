import type { FastifyPluginAsync } from 'fastify'
import {
  assignPermissionsSchema,
  createAccessProfileSchema,
  updateAccessProfileSchema,
} from '@all-club/shared'
import { authenticate } from '../../common/hooks/authenticate.hook.js'
import { requirePermission, requireRole } from '../../common/hooks/require-permission.hook.js'
import { AccessProfilesService } from './access-profiles.service.js'

export const accessProfilesRoutes: FastifyPluginAsync = async (app) => {
  const svc = new AccessProfilesService(app.prisma)

  app.addHook('preHandler', authenticate)

  // GET /access-profiles  [ADMIN or profile:view]
  app.get('/', { preHandler: [requirePermission('profile:view')] }, async () => svc.findMany())

  // GET /access-profiles/:id
  app.get('/:id', { preHandler: [requirePermission('profile:view')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const profile = await svc.findById(id)
    if (!profile) return reply.status(404).send({ message: 'Perfil não encontrado.' })
    return profile
  })

  // POST /access-profiles  [ADMIN only]
  app.post('/', { preHandler: [requireRole('ADMIN')] }, async (req, reply) => {
    const data = createAccessProfileSchema.parse(req.body)
    return reply.status(201).send(await svc.create(data))
  })

  // PATCH /access-profiles/:id  [ADMIN only]
  app.patch('/:id', { preHandler: [requireRole('ADMIN')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = updateAccessProfileSchema.parse(req.body)
    const profile = await svc.update(id, data)
    if (!profile) return reply.status(404).send({ message: 'Perfil não encontrado.' })
    return profile
  })

  // DELETE /access-profiles/:id  [ADMIN only]
  app.delete('/:id', { preHandler: [requireRole('ADMIN')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    try {
      await svc.delete(id)
      return reply.status(204).send()
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message: string }
      return reply.status(e.statusCode ?? 500).send({ message: e.message })
    }
  })

  // PUT /access-profiles/:id/permissions  [ADMIN only]
  app.put('/:id/permissions', { preHandler: [requireRole('ADMIN')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { permissionKeys } = assignPermissionsSchema.parse(req.body)
    const profile = await svc.setPermissions(id, permissionKeys)
    if (!profile) return reply.status(404).send({ message: 'Perfil não encontrado.' })
    return profile
  })

  // PATCH /access-profiles/:id/toggle  [ADMIN only]
  app.patch('/:id/toggle', { preHandler: [requireRole('ADMIN')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    try {
      return await svc.toggleActive(id)
    } catch {
      return reply.status(404).send({ message: 'Perfil não encontrado.' })
    }
  })
}
