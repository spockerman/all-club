'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClubSettings } from '@/lib/use-club-settings'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function LoginPage() {
  const router = useRouter()
  const { clubName, logoUrl } = useClubSettings()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? 'Erro ao autenticar.')
        return
      }

      document.cookie = `access_token=${encodeURIComponent(data.accessToken)}; path=/; SameSite=Strict; max-age=1800`

      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken)
      }

      if (data.user?.mustChangePassword) {
        router.push('/change-password')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Não foi possível conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  const fieldClass =
    'w-full rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={clubName}
              width={200}
              height={80}
              className="object-contain max-h-20 w-auto"
              unoptimized
              priority
            />
          ) : (
            <span className="text-3xl font-black tracking-tighter text-gray-900">{clubName}</span>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md px-8 py-8 space-y-5">

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[11px] font-bold uppercase tracking-widest text-gray-500"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
                placeholder="nome@empresa.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-bold uppercase tracking-widest text-gray-500"
                >
                  Senha
                </label>
                <a
                  href="#"
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Esqueceu?
                </a>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
                placeholder="••••••••"
              />
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-gray-700 focus:ring-gray-400"
              />
              <span className="text-sm text-gray-500">Lembrar-me</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white text-sm font-bold uppercase tracking-widest py-3 transition-colors disabled:opacity-50"
            >
              {loading ? 'Entrando…' : (
                <>
                  Entrar
                  <span aria-hidden>→</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
