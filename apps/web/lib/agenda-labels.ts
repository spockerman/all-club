import type { AgendaPeriod, AgendaStatus, ScheduleLogStatus, TriggerType } from '@all-club/shared'

export const PERIOD_LABEL: Record<AgendaPeriod, string> = {
  MORNING: 'Manhã',
  AFTERNOON: 'Tarde',
  EVENING: 'Noite',
  ALL_DAY: 'Dia todo',
}

export const AGENDA_STATUS_LABEL: Record<AgendaStatus, string> = {
  AVAILABLE: 'Disponível',
  RESERVED: 'Reservada',
  CANCELLED: 'Cancelada',
}

export const AGENDA_STATUS_VARIANT: Record<AgendaStatus, 'green' | 'yellow' | 'gray'> = {
  AVAILABLE: 'green',
  RESERVED: 'yellow',
  CANCELLED: 'gray',
}

export const SCHEDULE_LOG_STATUS_LABEL: Record<ScheduleLogStatus, string> = {
  SUCCESS: 'Sucesso',
  FAILURE: 'Falha',
  PARTIAL: 'Parcial',
}

export const SCHEDULE_LOG_STATUS_VARIANT: Record<ScheduleLogStatus, 'green' | 'red' | 'yellow'> = {
  SUCCESS: 'green',
  FAILURE: 'red',
  PARTIAL: 'yellow',
}

export const TRIGGER_TYPE_LABEL: Record<TriggerType, string> = {
  AUTOMATIC: 'Automático',
  MANUAL: 'Manual',
}
