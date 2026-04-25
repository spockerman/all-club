import { z } from 'zod'

export const createMarketingMediaSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['NOTICE', 'MEDIA']),
  imageUrl: z.string().min(1),
  active: z.boolean().optional().default(true),
})

export const updateMarketingMediaSchema = createMarketingMediaSchema.partial()

export type CreateMarketingMediaInput = z.infer<typeof createMarketingMediaSchema>
export type UpdateMarketingMediaInput = z.infer<typeof updateMarketingMediaSchema>
export type MarketingMediaType = 'NOTICE' | 'MEDIA'
