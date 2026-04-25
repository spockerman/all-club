const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'

let _token: string | null = null
let _onUnauthorized: (() => void) | null = null
let _redirecting = false

export function setAuthToken(token: string | null) {
  _token = token
}

export function setUnauthorizedHandler(handler: () => void) {
  _onUnauthorized = handler
  _redirecting = false
}

export function resetRedirectingFlag() {
  _redirecting = false
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (_token) headers['Authorization'] = `Bearer ${_token}`

  const res = await fetch(`${API_URL}${path}`, {
    headers: { ...headers, ...(init?.headers as Record<string, string>) },
    ...init,
  })

  if (!res.ok) {
    if (res.status === 401 && _onUnauthorized && !_redirecting) {
      _redirecting = true
      _onUnauthorized()
    }
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new ApiError(err.message ?? 'Erro na requisição', res.status)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => apiFetch<void>(path, { method: 'DELETE' }),
}
