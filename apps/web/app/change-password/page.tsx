'use client'

import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const PASSWORD_POLICY_MESSAGE =
  'Mínimo 8 caracteres, com ao menos 1 maiúscula, 1 minúscula e 1 número.'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      await api.patch('/auth/me/password', { currentPassword, newPassword })
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof Error && err.message.includes('401')) {
        router.push('/login')
        return
      }
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 outline-none bg-white'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tighter text-gray-900">All Club</h1>
          <p className="text-sm text-gray-500 mt-1">Painel Administrativo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Trocar senha</h2>
          <p className="text-sm text-gray-500 mb-6">
            Por segurança, defina uma nova senha antes de continuar.
          </p>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"
              >
                Senha atual
              </label>
              <input
                id="currentPassword"
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"
              >
                Nova senha
              </label>
              <input
                id="newPassword"
                type="password"
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-400 mt-1">{PASSWORD_POLICY_MESSAGE}</p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"
              >
                Confirmar nova senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
