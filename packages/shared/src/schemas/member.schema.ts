import { z } from 'zod'

export const createMemberSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  membershipNumber: z.string().max(20).optional(),
  category: z.enum(['TITULAR', 'DEPENDENTE', 'CONVIDADO']),
  holderId: z.string().uuid().optional(),
})

export const updateMemberSchema = createMemberSchema.partial().extend({
  status: z.enum(['ATIVO', 'SUSPENSO', 'INATIVO', 'PENDENTE']).optional(),
  /** `null` remove o vínculo com titular (ex.: ao mudar para TITULAR). */
  holderId: z.string().uuid().nullable().optional(),
  /** `null` limpa o número do título (ex.: ao mudar de TITULAR para dependente). */
  membershipNumber: z.string().max(20).nullable().optional(),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
