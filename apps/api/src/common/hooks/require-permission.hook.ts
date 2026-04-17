import type { FastifyReply, FastifyRequest } from 'fastify'
import type { JwtPayload, UserRole } from '@all-club/shared'

export function requirePermission(...required: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user as JwtPayload

    // ADMIN bypasses all permission checks
    if (user.role === 'ADMIN') return

    const hasPermission = required.some(
      (p) => user.permissions.includes(p) || user.permissions.includes('*'),
    )
    if (!hasPermission) {
      return reply.status(403).send({ message: 'Acesso negado.' })
    }
  }
}

export function requireRole(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user as JwtPayload
    if (!roles.includes(user.role)) {
      return reply.status(403).send({ message: 'Acesso negado.' })
    }
  }
}
