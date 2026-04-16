import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { membersRoutes } from './modules/members/members.routes.js'
import { areasRoutes } from './modules/areas/areas.routes.js'
import { bookingsRoutes } from './modules/bookings/bookings.routes.js'
import { agendasRoutes } from './modules/agendas/agendas.routes.js'
import { scheduleConfigsRoutes } from './modules/schedule-configs/schedule-configs.routes.js'
import { scheduleLogsRoutes } from './modules/schedule-logs/schedule-logs.routes.js'
import { prismaPlugin } from './common/plugins/prisma.plugin.js'
import { schedulerPlugin } from './common/plugins/scheduler.plugin.js'

const app = Fastify({ logger: true })

// Plugins
await app.register(cors, { origin: true })
await app.register(jwt, { secret: process.env.JWT_SECRET ?? 'change-me-in-production' })
await app.register(swagger, {
  openapi: {
    info: { title: 'All Club API', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
})
await app.register(swaggerUi, { routePrefix: '/docs' })
await app.register(prismaPlugin)
await app.register(schedulerPlugin)

// Routes
await app.register(membersRoutes, { prefix: '/members' })
await app.register(areasRoutes, { prefix: '/areas' })
await app.register(bookingsRoutes, { prefix: '/bookings' })
await app.register(agendasRoutes, { prefix: '/agendas' })
await app.register(scheduleConfigsRoutes, { prefix: '/schedule-configs' })
await app.register(scheduleLogsRoutes, { prefix: '/schedule-logs' })

// Health check
app.get('/health', async () => ({ status: 'ok' }))

const port = Number(process.env.PORT ?? 3001)
await app.listen({ port, host: '0.0.0.0' })
