import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  JwtPayload,
  LoginInput,
  RequestOtpInput,
  ResetPasswordInput,
  UpdateUserInput,
  VerifyOtpInput,
} from '@all-club/shared'
import {
  getDummyHash,
  hashPassword,
  validatePasswordPolicy,
  verifyPassword,
} from '../../common/utils/password.utils.js'
import {
  generateRefreshToken,
  generateResetToken,
  refreshTokenExpiresAt,
  resetTokenExpiresAt,
} from '../../common/utils/token.utils.js'

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const MEMBER_PERMISSIONS = ['agenda:view', 'booking:view', 'booking:create', 'booking:cancel', 'area:view']
const MAX_FAILED_ATTEMPTS = 5
const LOCK_MINUTES = 30

const userInclude = {
  credential: true,
  profiles: {
    where: { accessProfile: { active: true } },
    include: { accessProfile: { include: { permissions: true } } },
  },
} as const

async function resolvePermissions(
  prisma: PrismaClient,
  userId: string,
  role: string,
): Promise<string[]> {
  if (role === 'ADMIN') return ['*']
  if (role === 'MEMBER') return MEMBER_PERMISSIONS

  // EMPLOYEE: union of all assigned active profiles' permissions
  const profiles = await prisma.userAccessProfile.findMany({
    where: { userId, accessProfile: { active: true } },
    include: { accessProfile: { include: { permissions: true } } },
  })

  const permSet = new Set<string>()
  for (const up of profiles) {
    for (const p of up.accessProfile.permissions) {
      permSet.add(p.permissionKey)
    }
  }
  return [...permSet]
}

export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly app: FastifyInstance,
  ) {}

  async login(
    data: LoginInput,
    meta: { ipAddress?: string; userAgent?: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: userInclude,
    })

    const hashToVerify = user?.credential?.passwordHash ?? getDummyHash()
    const passwordValid = await verifyPassword(data.password, hashToVerify)

    // ── Audit failure helper ───────────────────────────────────────────────
    const auditFailure = async (userId?: string) => {
      await this.prisma.securityAuditLog.create({
        data: { event: 'LOGIN_FAILURE', userId: userId ?? null, ...meta },
      })
    }

    if (!user || !passwordValid) {
      await auditFailure(user?.id)
      throw Object.assign(new Error('Credenciais inválidas ou conta sem acesso.'), {
        statusCode: 401,
      })
    }

    // ── Account state checks ───────────────────────────────────────────────
    if (user.status === 'INACTIVE') {
      await auditFailure(user.id)
      throw Object.assign(new Error('Credenciais inválidas ou conta sem acesso.'), {
        statusCode: 401,
      })
    }

    if (user.status === 'BLOCKED') {
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        await auditFailure(user.id)
        throw Object.assign(new Error('Credenciais inválidas ou conta sem acesso.'), {
          statusCode: 401,
        })
      }
      // Temporary lock expired → unblock
      await this.prisma.user.update({
        where: { id: user.id },
        data: { status: 'ACTIVE', failedLoginAttempts: 0, lockedUntil: null },
      })
    }

    // ── Failed attempts tracking ───────────────────────────────────────────
    if (!passwordValid) {
      const attempts = user.failedLoginAttempts + 1
      const shouldLock = attempts >= MAX_FAILED_ATTEMPTS
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          ...(shouldLock
            ? {
                status: 'BLOCKED',
                lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000),
              }
            : {}),
        },
      })
      if (shouldLock) {
        await this.prisma.securityAuditLog.create({
          data: { event: 'ACCOUNT_LOCKED', userId: user.id, ...meta },
        })
      }
      await auditFailure(user.id)
      throw Object.assign(new Error('Credenciais inválidas ou conta sem acesso.'), {
        statusCode: 401,
      })
    }

    // ── Success ────────────────────────────────────────────────────────────
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    })

    const permissions = await resolvePermissions(this.prisma, user.id, user.role)

    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      name: user.name,
      role: user.role as JwtPayload['role'],
      permissions,
      memberId: user.memberId,
    }

    const accessToken = this.app.jwt.sign(payload, { expiresIn: '30m' })

    // Create refresh token
    const refreshToken = generateRefreshToken()
    await this.prisma.refreshToken.create({
      data: {
        id: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt(),
        ...meta,
      },
    })

    await this.prisma.securityAuditLog.create({
      data: { event: 'LOGIN_SUCCESS', userId: user.id, ...meta },
    })

    return {
      accessToken,
      refreshToken,
      expiresIn: 1800,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        memberId: user.memberId ?? null,
        permissions,
        mustChangePassword: user.credential?.mustChangePassword ?? false,
      },
    }
  }

  async logout(
    refreshToken: string,
    userId: string,
    meta: { ipAddress?: string; userAgent?: string },
  ) {
    await this.prisma.refreshToken.updateMany({
      where: { id: refreshToken, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    await this.prisma.securityAuditLog.create({
      data: { event: 'LOGOUT', userId, ...meta },
    })
  }

  async refresh(
    refreshToken: string,
    meta: { ipAddress?: string; userAgent?: string },
  ) {
    const token = await this.prisma.refreshToken.findUnique({ where: { id: refreshToken } })

    if (!token || token.revokedAt !== null || token.expiresAt < new Date()) {
      if (token && !token.revokedAt) {
        await this.prisma.refreshToken.update({
          where: { id: refreshToken },
          data: { revokedAt: new Date() },
        })
      }
      throw Object.assign(new Error('Token inválido ou expirado.'), { statusCode: 401 })
    }

    const user = await this.prisma.user.findUnique({
      where: { id: token.userId },
      include: { credential: true },
    })

    if (!user || user.status !== 'ACTIVE') {
      throw Object.assign(new Error('Token inválido ou expirado.'), { statusCode: 401 })
    }

    // Invalidate tokens issued before password change
    if (
      user.credential?.passwordChangedAt &&
      token.createdAt < user.credential.passwordChangedAt
    ) {
      await this.prisma.refreshToken.update({
        where: { id: refreshToken },
        data: { revokedAt: new Date() },
      })
      throw Object.assign(new Error('Token inválido ou expirado.'), { statusCode: 401 })
    }

    const permissions = await resolvePermissions(this.prisma, user.id, user.role)
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      name: user.name,
      role: user.role as JwtPayload['role'],
      permissions,
      memberId: user.memberId,
    }

    const accessToken = this.app.jwt.sign(payload, { expiresIn: '30m' })

    await this.prisma.securityAuditLog.create({
      data: { event: 'TOKEN_REFRESHED', userId: user.id, ...meta },
    })

    return { accessToken, expiresIn: 1800 }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        profiles: {
          where: { accessProfile: { active: true } },
          include: { accessProfile: { select: { id: true, name: true } } },
        },
      },
    })

    const permissions = await resolvePermissions(this.prisma, userId, user.role)

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      memberId: user.memberId,
      permissions,
      profiles: user.profiles.map((up) => up.accessProfile),
    }
  }

  async updateMe(userId: string, data: UpdateUserInput) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true },
    })
  }

  async changePassword(
    userId: string,
    data: ChangePasswordInput,
    meta: { ipAddress?: string; userAgent?: string },
  ) {
    validatePasswordPolicy(data.newPassword)

    const credential = await this.prisma.userCredential.findUniqueOrThrow({ where: { userId } })

    const valid = await verifyPassword(data.currentPassword, credential.passwordHash)
    if (!valid) {
      throw Object.assign(new Error('Senha atual incorreta.'), { statusCode: 400 })
    }

    const newHash = await hashPassword(data.newPassword)

    await this.prisma.$transaction([
      this.prisma.userCredential.update({
        where: { userId },
        data: {
          passwordHash: newHash,
          passwordChangedAt: new Date(),
          mustChangePassword: false,
        },
      }),
      // Revoke all existing refresh tokens
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ])

    await this.prisma.securityAuditLog.create({
      data: { event: 'PASSWORD_CHANGED', userId, ...meta },
    })
  }

  async requestOtp(data: RequestOtpInput) {
    const member = await this.prisma.member.findUnique({
      where: { email: data.email },
      include: { holder: true, user: true },
    })

    if (!member) return

    const resolvedNumber = member.membershipNumber ?? member.holder?.membershipNumber ?? null
    if (!resolvedNumber || resolvedNumber !== data.membershipNumber) return

    if (member.user) return

    const recentOtp = await this.prisma.memberOtp.findFirst({
      where: {
        memberId: member.id,
        usedAt: null,
        createdAt: { gt: new Date(Date.now() - 60_000) },
      },
    })
    if (recentOtp) return

    await this.prisma.memberOtp.deleteMany({
      where: { memberId: member.id, usedAt: null },
    })

    const code = generateOtpCode()
    await this.prisma.memberOtp.create({
      data: {
        memberId: member.id,
        code,
        expiresAt: new Date(Date.now() + 10 * 60_000),
      },
    })

    await this.app.sms.send(
      member.phone!,
      `All Club: seu código de acesso é ${code}. Válido por 10 minutos.`,
    )
  }

  async verifyOtp(data: VerifyOtpInput) {
    const member = await this.prisma.member.findUnique({ where: { email: data.email } })

    if (!member) {
      throw Object.assign(new Error('Código inválido ou expirado.'), { statusCode: 400 })
    }

    const otp = await this.prisma.memberOtp.findFirst({
      where: {
        memberId: member.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otp) {
      throw Object.assign(new Error('Código inválido ou expirado.'), { statusCode: 400 })
    }

    // Increment attempts before checking — prevents brute force
    const updated = await this.prisma.memberOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    })

    if (updated.attempts > 3) {
      await this.prisma.memberOtp.update({
        where: { id: otp.id },
        data: { usedAt: new Date() },
      })
      throw Object.assign(new Error('Número máximo de tentativas atingido. Solicite um novo código.'), { statusCode: 400 })
    }

    if (otp.code !== data.code) {
      throw Object.assign(new Error('Código inválido.'), { statusCode: 400 })
    }

    // Mark OTP as used
    await this.prisma.memberOtp.update({
      where: { id: otp.id },
      data: { usedAt: new Date() },
    })

    // Find "Associado" access profile
    const associateProfile = await this.prisma.accessProfile.findUnique({
      where: { name: 'Associado' },
    })

    const setupToken = generateResetToken()

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: member.name,
          email: member.email,
          phone: member.phone,
          role: 'MEMBER',
          status: 'ACTIVE',
          memberId: member.id,
        },
      })

      await tx.userCredential.create({
        data: {
          userId: user.id,
          passwordHash: '',
          mustChangePassword: true,
          resetToken: setupToken,
          resetTokenExpiresAt: resetTokenExpiresAt(),
        },
      })

      if (associateProfile) {
        await tx.userAccessProfile.create({
          data: { userId: user.id, accessProfileId: associateProfile.id },
        })
      }
    })

    return { setupToken }
  }

  async forgotPassword(
    data: ForgotPasswordInput,
    meta: { ipAddress?: string; userAgent?: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { email: data.email } })

    // Always return success to avoid user enumeration
    if (!user || user.status === 'INACTIVE') return

    const resetToken = generateResetToken()
    const expiresAt = resetTokenExpiresAt()

    await this.prisma.userCredential.update({
      where: { userId: user.id },
      data: { resetToken, resetTokenExpiresAt: expiresAt },
    })

    await this.prisma.securityAuditLog.create({
      data: { event: 'PASSWORD_RESET_REQUESTED', userId: user.id, ...meta },
    })

    if (user.phone) {
      const scheme = process.env.APP_SCHEME ?? 'all-club'
      await this.app.sms.send(
        user.phone,
        `All Club: redefina sua senha acessando ${scheme}://set-password?token=${resetToken}`,
      )
    }
  }

  async resetPassword(
    data: ResetPasswordInput,
    meta: { ipAddress?: string; userAgent?: string },
  ) {
    validatePasswordPolicy(data.newPassword)

    const credential = await this.prisma.userCredential.findFirst({
      where: {
        resetToken: data.token,
        resetTokenExpiresAt: { gt: new Date() },
      },
    })

    if (!credential) {
      throw Object.assign(new Error('Token inválido ou expirado.'), { statusCode: 400 })
    }

    const newHash = await hashPassword(data.newPassword)

    await this.prisma.$transaction([
      this.prisma.userCredential.update({
        where: { id: credential.id },
        data: {
          passwordHash: newHash,
          passwordChangedAt: new Date(),
          mustChangePassword: false,
          resetToken: null,
          resetTokenExpiresAt: null,
        },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: credential.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ])

    await this.prisma.securityAuditLog.create({
      data: { event: 'PASSWORD_RESET_COMPLETED', userId: credential.userId, ...meta },
    })
  }
}
