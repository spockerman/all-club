import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
export const PASSWORD_POLICY_MESSAGE =
  'Senha deve ter mínimo 8 caracteres, com ao menos 1 maiúscula, 1 minúscula e 1 número.'

export const passwordSchema = z
  .string()
  .min(8)
  .regex(PASSWORD_POLICY, PASSWORD_POLICY_MESSAGE)

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
})

export const createInternalUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'EMPLOYEE']),
  phone: z.string().optional(),
  profileIds: z.array(z.string().uuid()).optional(),
})

export const createMemberUserSchema = z.object({
  memberId: z.string().uuid(),
  email: z.string().email(),
  password: passwordSchema,
})

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
})

export const createAccessProfileSchema = z.object({
  name: z.string().min(1).max(60),
  description: z.string().max(200).optional(),
})

export const updateAccessProfileSchema = createAccessProfileSchema.partial()

export const assignPermissionsSchema = z.object({
  permissionKeys: z.array(z.string().min(1)),
})

export const assignProfilesSchema = z.object({
  profileIds: z.array(z.string().uuid()),
})

export type LoginInput = z.infer<typeof loginSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type CreateInternalUserInput = z.infer<typeof createInternalUserSchema>
export type CreateMemberUserInput = z.infer<typeof createMemberUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateAccessProfileInput = z.infer<typeof createAccessProfileSchema>
export type UpdateAccessProfileInput = z.infer<typeof updateAccessProfileSchema>
