import { z } from 'zod'

export const agendaPeriods = ['MORNING', 'AFTERNOON', 'EVENING', 'ALL_DAY'] as const

export const createAgendaSchema = z.object({
  areaId: z.string().uuid(),
  date: z.coerce.date(),
  period: z.enum(agendaPeriods),
})

export const createAgendaBatchSchema = z
  .object({
    areaId: z.string().uuid(),
    dateFrom: z.coerce.date(),
    dateTo: z.coerce.date(),
    period: z.enum(agendaPeriods),
  })
  .refine((d) => d.dateTo >= d.dateFrom, {
    message: 'dateTo must be on or after dateFrom',
    path: ['dateTo'],
  })
  .refine(
    (d) => (d.dateTo.getTime() - d.dateFrom.getTime()) / 86_400_000 <= 365,
    { message: 'Date range cannot exceed 365 days', path: ['dateTo'] },
  )

export const updateAgendaSchema = z.object({
  date: z.coerce.date().optional(),
  period: z.enum(agendaPeriods).optional(),
})

export const createScheduleConfigSchema = z.object({
  areaId: z.string().uuid(),
  cronExpression: z.string().min(1).max(100),
  period: z.enum(agendaPeriods),
  daysAhead: z.number().int().min(1).max(90),
  description: z.string().max(200).optional(),
})

export const updateScheduleConfigSchema = createScheduleConfigSchema.partial()

export type CreateAgendaInput = z.infer<typeof createAgendaSchema>
export type CreateAgendaBatchInput = z.infer<typeof createAgendaBatchSchema>
export type UpdateAgendaInput = z.infer<typeof updateAgendaSchema>
export type CreateScheduleConfigInput = z.infer<typeof createScheduleConfigSchema>
export type UpdateScheduleConfigInput = z.infer<typeof updateScheduleConfigSchema>
