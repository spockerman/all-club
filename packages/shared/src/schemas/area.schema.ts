import { z } from 'zod'

export const createAreaSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  capacity: z.number().int().positive(),
  rules: z.string().optional(),
})

export const updateAreaSchema = createAreaSchema.partial()

export const createAvailabilitySlotSchema = z.object({
  dayOfWeek: z.enum(['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
})

export const blockDateSchema = z.object({
  date: z.coerce.date(),
  reason: z.string().optional(),
})

export type CreateAreaInput = z.infer<typeof createAreaSchema>
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>
export type CreateAvailabilitySlotInput = z.infer<typeof createAvailabilitySlotSchema>
export type BlockDateInput = z.infer<typeof blockDateSchema>
