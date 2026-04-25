import type { FastifyPluginAsync } from 'fastify'
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerMemberSchema,
  resetPasswordSchema,
  updateUserSchema,
} from '@all-club/shared'
import { authenticate } from '../../common/hooks/authenticate.hook.js'
import { AuthService } from './auth.service.js'
import type { JwtPayload } from '@all-club/shared'

function getMeta(request: { ip: string; headers: Record<string, string | string[] | undefined> }) {
  return {
    ipAddress: request.ip,
    userAgent: String(request.headers['user-agent'] ?? ''),
  }
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  const svc = new AuthService(app.prisma, app)

  // POST /auth/login
  app.post('/login', async (req, reply) => {
    const data = loginSchema.parse(req.body)
    try {
      const result = await svc.login(data, getMeta(req))
      return reply.status(200).send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message: string }
      return reply.status(e.statusCode ?? 500).send({ message: e.message })
    }
  })

  // POST /auth/logout  (requires auth)
  app.post('/logout', { preHandler: [authenticate] }, async (req, reply) => {
    const user = req.user as JwtPayload
    const { refreshToken } = req.body as { refreshToken?: string }
    if (refreshToken) {
      await svc.logout(refreshToken, user.sub, getMeta(req))
    }
    return reply.status(204).send()
  })

  // POST /auth/refresh
  app.post('/refresh', async (req, reply) => {
    const { refreshToken } = refreshTokenSchema.parse(req.body)
    try {
      const result = await svc.refresh(refreshToken, getMeta(req))
      return reply.status(200).send(result)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message: string }
      return reply.status(e.statusCode ?? 500).send({ message: e.message })
    }
  })

  // GET /auth/me
  app.get('/me', { preHandler: [authenticate] }, async (req) => {
    const user = req.user as JwtPayload
    return svc.me(user.sub)
  })

  // PATCH /auth/me
  app.patch('/me', { preHandler: [authenticate] }, async (req) => {
    const user = req.user as JwtPayload
    const data = updateUserSchema.parse(req.body)
    return svc.updateMe(user.sub, data)
  })

  // PATCH /auth/me/password
  app.patch('/me/password', { preHandler: [authenticate] }, async (req, reply) => {
    const user = req.user as JwtPayload
    const data = changePasswordSchema.parse(req.body)
    try {
      await svc.changePassword(user.sub, data, getMeta(req))
      return reply.status(200).send({ message: 'Senha alterada com sucesso.' })
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message: string }
      return reply.status(e.statusCode ?? 500).send({ message: e.message })
    }
  })

  // POST /auth/register-member  (public — auto-cadastro pelo app)
  app.post('/register-member', async (req, reply) => {
    const data = registerMemberSchema.parse(req.body)
    await svc.registerMember(data)
    return reply.status(200).send({
      message: 'Se os dados estiverem corretos, você receberá um e-mail para criar sua senha.',
    })
  })

  // POST /auth/forgot-password
  app.post('/forgot-password', async (req, reply) => {
    const data = forgotPasswordSchema.parse(req.body)
    await svc.forgotPassword(data, getMeta(req))
    return reply.status(200).send({
      message: 'Se o e-mail estiver cadastrado, você receberá as instruções.',
    })
  })

  // POST /auth/reset-password
  app.post('/reset-password', async (req, reply) => {
    const data = resetPasswordSchema.parse(req.body)
    try {
      await svc.resetPassword(data, getMeta(req))
      return reply.status(200).send({ message: 'Senha redefinida com sucesso.' })
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message: string }
      return reply.status(e.statusCode ?? 500).send({ message: e.message })
    }
  })
}
