import type { FastifyPluginAsync } from 'fastify'
import { createScheduleConfigSchema, updateScheduleConfigSchema } from '@all-club/shared'
import { authenticate } from '../../common/hooks/authenticate.hook.js'
import { requirePermission } from '../../common/hooks/require-permission.hook.js'
import { ScheduleConfigsService } from './schedule-configs.service.js'
import { runSchedule } from './schedule-runner.js'

export const scheduleConfigsRoutes: FastifyPluginAsync = async (app) => {
  const svc = new ScheduleConfigsService(app.prisma)
  app.addHook('preHandler', authenticate)

  app.get('/', { preHandler: [requirePermission('schedule-config:manage')] }, async () => svc.findMany())

  app.get('/:id', { preHandler: [requirePermission('schedule-config:manage')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const config = await svc.findById(id)
    if (!config) return reply.status(404).send({ message: 'Schedule config not found' })
    return config
  })

  app.post('/', { preHandler: [requirePermission('schedule-config:manage')] }, async (req, reply) => {
    const data = createScheduleConfigSchema.parse(req.body)
    const config = await svc.create(data)
    // Register the new cron job
    app.scheduler.register(config.id, config.cronExpression)
    return reply.status(201).send(config)
  })

  app.patch('/:id', { preHandler: [requirePermission('schedule-config:manage')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const data = updateScheduleConfigSchema.parse(req.body)
    const config = await svc.update(id, data)
    if (!config) return reply.status(404).send({ message: 'Schedule config not found' })
    // Reload cron job with updated expression/active state
    await app.scheduler.reload(id)
    return config
  })

  app.delete('/:id', { preHandler: [requirePermission('schedule-config:manage')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    try {
      app.scheduler.unregister(id)
      await svc.delete(id)
      return reply.status(204).send()
    } catch {
      return reply.status(404).send({ message: 'Schedule config not found' })
    }
  })

  // Toggle active without a full update
  app.patch('/:id/toggle', { preHandler: [requirePermission('schedule-config:manage')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    try {
      const config = await svc.toggleActive(id)
      await app.scheduler.reload(id)
      return config
    } catch {
      return reply.status(404).send({ message: 'Schedule config not found' })
    }
  })

  // Manual trigger
  app.post('/:id/run', { preHandler: [requirePermission('schedule-config:manage')] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const exists = await svc.findById(id)
    if (!exists) return reply.status(404).send({ message: 'Schedule config not found' })

    const result = await runSchedule(app.prisma, id, 'MANUAL')
    return reply.status(200).send(result)
  })
}
