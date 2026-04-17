import bcrypt from 'bcryptjs'
import { PASSWORD_POLICY, PASSWORD_POLICY_MESSAGE } from '@all-club/shared'

const BCRYPT_ROUNDS = 12

// Generated once at startup to avoid timing attacks on non-existent users
let DUMMY_HASH: string | null = null

export async function initDummyHash(): Promise<void> {
  DUMMY_HASH = await bcrypt.hash('dummy-hash-for-timing-protection', BCRYPT_ROUNDS)
}

export function getDummyHash(): string {
  if (!DUMMY_HASH) throw new Error('Password utils not initialized')
  return DUMMY_HASH
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export function validatePasswordPolicy(password: string): void {
  if (!PASSWORD_POLICY.test(password)) {
    throw new Error(PASSWORD_POLICY_MESSAGE)
  }
}
