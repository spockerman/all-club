import { randomUUID } from 'node:crypto'

export function generateRefreshToken(): string {
  return randomUUID()
}

export function generateResetToken(): string {
  return randomUUID()
}

export function refreshTokenExpiresAt(): Date {
  const date = new Date()
  date.setDate(date.getDate() + 30) // 30 days
  return date
}

export function resetTokenExpiresAt(): Date {
  const date = new Date()
  date.setHours(date.getHours() + 2) // 2 hours
  return date
}
