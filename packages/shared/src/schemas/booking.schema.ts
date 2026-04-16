import { z } from 'zod'

export const createBookingSchema = z.object({
  areaId: z.string().uuid(),
  slotId: z.string().uuid(),
  date: z.coerce.date(),
})

export const updateBookingStatusSchema = z.object({
  status: z.enum(['CONFIRMADO', 'CANCELADO']),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>
