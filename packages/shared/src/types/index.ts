// ── Agenda domain ────────────────────────────────────────────────────────────
export type AgendaPeriod = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ALL_DAY'
export type AgendaStatus = 'AVAILABLE' | 'RESERVED' | 'CANCELLED'
export type ReservationStatus = 'CONFIRMED' | 'CANCELLED'
export type TriggerType = 'AUTOMATIC' | 'MANUAL'
export type ScheduleLogStatus = 'SUCCESS' | 'FAILURE' | 'PARTIAL'

export interface Agenda {
  id: string
  areaId: string
  date: Date
  period: AgendaPeriod
  status: AgendaStatus
  createdAt: Date
  updatedAt: Date
}

export interface AgendaReservation {
  id: string
  agendaId: string
  memberId: string
  status: ReservationStatus
  cancelReason?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ScheduleConfig {
  id: string
  areaId: string
  cronExpression: string
  period: AgendaPeriod
  daysAhead: number
  description?: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ScheduleLog {
  id: string
  scheduleConfigId: string
  executedAt: Date
  triggerType: TriggerType
  status: ScheduleLogStatus
  agendasCreated: number
  agendasSkipped: number
  errorMessage?: string | null
  details?: unknown
}

// ── Legacy domain (Portuguese enum values kept for backwards compatibility) ──
export type MemberCategory = 'TITULAR' | 'DEPENDENTE' | 'CONVIDADO'
export type MemberStatus = 'ATIVO' | 'SUSPENSO' | 'INATIVO' | 'PENDENTE'
export type BookingStatus = 'CONFIRMADO' | 'CANCELADO' | 'EXPIRADO'
export type DayOfWeek = 'SEGUNDA' | 'TERCA' | 'QUARTA' | 'QUINTA' | 'SEXTA' | 'SABADO' | 'DOMINGO'

export interface Member {
  id: string
  name: string
  email: string
  phone?: string | null
  photoUrl?: string | null
  category: MemberCategory
  status: MemberStatus
  holderId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Area {
  id: string
  name: string
  description?: string | null
  capacity: number
  rules?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AvailabilitySlot {
  id: string
  areaId: string
  dayOfWeek: DayOfWeek
  startTime: string // HH:mm
  endTime: string   // HH:mm
}

export interface BlockedDate {
  id: string
  areaId: string
  date: Date
  reason?: string | null
}

export interface Booking {
  id: string
  memberId: string
  areaId: string
  slotId: string
  date: Date
  status: BookingStatus
  createdAt: Date
  updatedAt: Date
}
