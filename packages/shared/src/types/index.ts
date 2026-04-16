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
