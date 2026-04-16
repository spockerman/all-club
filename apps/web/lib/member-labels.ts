import type { MemberCategory, MemberStatus } from '@all-club/shared'

export const CATEGORY_LABEL: Record<MemberCategory, string> = {
  TITULAR: 'Titular',
  DEPENDENTE: 'Dependente',
  CONVIDADO: 'Convidado',
}

export const STATUS_LABEL: Record<MemberStatus, string> = {
  ATIVO: 'Ativo',
  SUSPENSO: 'Suspenso',
  INATIVO: 'Inativo',
  PENDENTE: 'Pendente',
}
