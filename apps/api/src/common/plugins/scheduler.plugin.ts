import fp from 'fastify-plugin'
import cron from 'node-cron'
import type { FastifyPluginAsync } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { runSchedule } from '../../modules/schedule-configs/schedule-runner.js'

declare module 'fastify' {
  interface FastifyInstance {
    scheduler: {
      register: (id: string, cronExpression: string) => void
      unregister: (id: string) => void
      reload: (id: string) => Promise<void>
    }
  }
}

const tasks = new Map<string, cron.ScheduledTask>()

function registerTask(id: string, cronExpression: string, prisma: PrismaClient) {
  if (!cron.validate(cronExpression)) {
    console.warn(`[scheduler] Invalid cron expression for config ${id}: "${cronExpression}"`)
    return
  }
  tasks.get(id)?.stop()
  const task = cron.schedule(
    cronExpression,
    () => {
      runSchedule(prisma, id, 'AUTOMATIC').catch((err) =>
        console.error(`[scheduler] Error running config ${id}:`, err),
      )
    },
    { timezone: 'America/Sao_Paulo' },
  )
  tasks.set(id, task)
}

function unregisterTask(id: string) {
  tasks.get(id)?.stop()
  tasks.delete(id)
}

const schedulerPlugin: FastifyPluginAsync = fp(async (app) => {
  // Load all active configs on startup
  const configs = await app.prisma.scheduleConfig.findMany({ where: { active: true } })
  for (const config of configs) {
    registerTask(config.id, config.cronExpression, app.prisma)
  }
  app.log.info(`[scheduler] Loaded ${configs.length} active schedule config(s)`)

  app.decorate('scheduler', {
    register: (id: string, cronExpression: string) => registerTask(id, cronExpression, app.prisma),
    unregister: (id: string) => unregisterTask(id),
    reload: async (id: string) => {
      unregisterTask(id)
      const config = await app.prisma.scheduleConfig.findUnique({ where: { id } })
      if (config?.active) registerTask(id, config.cronExpression, app.prisma)
    },
  })

  app.addHook('onClose', () => {
    for (const task of tasks.values()) task.stop()
    tasks.clear()
  })
})

export { schedulerPlugin }
