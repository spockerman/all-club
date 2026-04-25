import 'dotenv/config'
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
import { authRoutes } from './modules/auth/auth.routes.js'
import { usersRoutes } from './modules/users/users.routes.js'
import { accessProfilesRoutes } from './modules/access-profiles/access-profiles.routes.js'
import { permissionsRoutes } from './modules/permissions/permissions.routes.js'
import { settingsRoutes } from './modules/settings/settings.routes.js'
import { marketingRoutes } from './modules/marketing/marketing.routes.js'
import { prismaPlugin } from './common/plugins/prisma.plugin.js'
import { schedulerPlugin } from './common/plugins/scheduler.plugin.js'
import { mailerPlugin } from './common/plugins/mailer.plugin.js'
import { initDummyHash } from './common/utils/password.utils.js'

const app = Fastify({ logger: true })

// Init password utils
await initDummyHash()

// Plugins
await app.register(cors, { origin: true })
await app.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'change-me-in-production-min-32-chars!!',
  sign: { expiresIn: '30m' },
})
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
await app.register(mailerPlugin)
await app.register(schedulerPlugin)

// Public routes
await app.register(authRoutes, { prefix: '/auth' })

// Protected routes (each module adds authenticate internally)
await app.register(membersRoutes, { prefix: '/members' })
await app.register(areasRoutes, { prefix: '/areas' })
await app.register(bookingsRoutes, { prefix: '/bookings' })
await app.register(agendasRoutes, { prefix: '/agendas' })
await app.register(scheduleConfigsRoutes, { prefix: '/schedule-configs' })
await app.register(scheduleLogsRoutes, { prefix: '/schedule-logs' })
await app.register(usersRoutes, { prefix: '/users' })
await app.register(accessProfilesRoutes, { prefix: '/access-profiles' })
await app.register(permissionsRoutes, { prefix: '/permissions' })
await app.register(settingsRoutes, { prefix: '/settings' })
await app.register(marketingRoutes, { prefix: '/marketing' })

// Health check (public)
app.get('/health', async () => ({ status: 'ok' }))

const port = Number(process.env.PORT ?? 3001)
await app.listen({ port, host: '0.0.0.0' })
