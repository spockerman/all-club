import { createContext, useContext } from 'react'
import * as SecureStore from 'expo-secure-store'
import { setAuthToken } from './api'

const TOKEN_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: string
  memberId?: string | null
  mustChangePassword?: boolean
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<boolean>
}

const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export { AuthContext }

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export async function tryRefresh(): Promise<{ token: string; user: AuthUser } | null> {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY)
    if (!refreshToken) return null

    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null

    const data = await res.json()
    await persistAuth(data.accessToken, data.user, data.refreshToken)
    return { token: data.accessToken, user: data.user }
  } catch {
    return null
  }
}

export async function loadStoredAuth(): Promise<{ token: string | null; user: AuthUser | null }> {
  try {
    const raw = await SecureStore.getItemAsync(TOKEN_KEY)
    if (!raw) return { token: null, user: null }
    const parsed = JSON.parse(raw) as { token: string; user: AuthUser }

    if (isTokenExpired(parsed.token)) {
      const refreshed = await tryRefresh()
      if (refreshed) return refreshed
      return { token: null, user: null }
    }

    setAuthToken(parsed.token)
    return { token: parsed.token, user: parsed.user }
  } catch {
    return { token: null, user: null }
  }
}

export async function persistAuth(token: string, user: AuthUser, refreshToken?: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify({ token, user }))
  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_KEY, refreshToken)
  }
  setAuthToken(token)
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
  await SecureStore.deleteItemAsync(REFRESH_KEY)
  setAuthToken(null)
}
