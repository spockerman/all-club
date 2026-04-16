import { z } from 'zod'

export const createMemberSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  category: z.enum(['TITULAR', 'DEPENDENTE', 'CONVIDADO']),
  holderId: z.string().uuid().optional(),
})

export const updateMemberSchema = createMemberSchema.partial().extend({
  status: z.enum(['ATIVO', 'SUSPENSO', 'INATIVO', 'PENDENTE']).optional(),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
