'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { api } from '@/lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type Props = {
  settings: Record<string, string>
}

export function SettingsForm({ settings }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [clubName, setClubName] = useState(settings.clubName ?? '')
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl ?? '')
  const [logoPreview, setLogoPreview] = useState(settings.logoUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload-logo', { method: 'POST', body: form })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Erro ao enviar arquivo')
        return
      }
      const { logoUrl: uploaded } = await res.json()
      setLogoUrl(uploaded)
      setLogoPreview(`${uploaded}?t=${Date.now()}`)
    } catch {
      setError('Erro ao enviar arquivo')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await api.patch('/settings', { clubName, logoUrl })
      setSuccess(true)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Logo preview card */}
      <div className="bg-white rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Logo do clube</h2>

        <div className="flex items-center gap-6">
          <div className="w-48 h-20 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
            {logoPreview ? (
              <Image
                src={logoPreview}
                alt="Logo atual"
                width={180}
                height={72}
                className="object-contain max-h-16 w-auto"
                unoptimized
              />
            ) : (
              <span className="text-sm text-gray-400">Sem logo</span>
            )}
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">upload</span>
              {uploading ? 'Enviando…' : 'Enviar imagem'}
            </button>
            <p className="text-xs text-gray-400">PNG, JPG, SVG ou WebP. Recomendado: fundo transparente.</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            URL da imagem (ou cole uma URL externa)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => {
                setLogoUrl(e.target.value)
                setLogoPreview(e.target.value)
              }}
              placeholder="https://... ou /images/logo.png"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />
          </div>
        </div>
      </div>

      {/* Club info card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Informações do clube</h2>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nome do clube</label>
          <input
            type="text"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          />
          <p className="text-xs text-gray-400 mt-1">
            Exibido quando o logo não está configurado.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">Configurações salvas com sucesso.</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Salvando…' : 'Salvar configurações'}
          </button>
        </div>
      </form>
    </div>
  )
}
