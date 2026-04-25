'use client'

import { api } from '@/lib/api'
import { primaryButtonClassName } from '@/lib/primary-button'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

type MarketingMedia = {
  id: string
  title: string
  type: string
  imageUrl: string
  active: boolean
}

type Props = {
  mode: 'create' | 'edit'
  item?: MarketingMedia
  onSuccess?: () => void
  onCancel?: () => void
  submitLabel?: string
  hideCancel?: boolean
}

export function MarketingForm({ mode, item, onSuccess, onCancel, submitLabel, hideCancel }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(item?.title ?? '')
  const [type, setType] = useState<'NOTICE' | 'MEDIA'>(
    (item?.type as 'NOTICE' | 'MEDIA') ?? 'NOTICE',
  )
  const [active, setActive] = useState(item?.active ?? true)
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? '')
  const [preview, setPreview] = useState(item?.imageUrl ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Apenas imagens são permitidas')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setImageUrl(result)
      setPreview(result)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveImage() {
    setImageUrl('')
    setPreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!imageUrl) {
      setError('Selecione uma imagem')
      return
    }
    setLoading(true)
    setError(null)
    try {
      if (mode === 'create') {
        await api.post('/marketing', { title, type, imageUrl, active })
      } else {
        await api.patch(`/marketing/${item!.id}`, { title, type, imageUrl, active })
      }
      if (onSuccess) {
        onSuccess()
        router.refresh()
      } else {
        router.push('/marketing')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    if (onCancel) onCancel()
    else router.back()
  }

  const defaultLabel = mode === 'create' ? 'Cadastrar' : 'Salvar alterações'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          placeholder="Ex: Aula de Jump Dance"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo</label>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {(['NOTICE', 'MEDIA'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                type === t
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'NOTICE' ? 'Aviso' : 'Mídia'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Imagem</label>

        {preview ? (
          <div className="relative rounded-lg overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full max-h-60 object-contain bg-gray-50" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-white rounded-full shadow p-1 text-gray-600 hover:text-red-600 transition-colors"
              title="Remover imagem"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined text-[32px] text-gray-400 mb-1">
              add_photo_alternate
            </span>
            <span className="text-xs text-gray-500">Clique para selecionar imagem</span>
            <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WebP</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="marketing-active"
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="marketing-active" className="text-sm text-gray-700">
          Ativo (visível no app)
        </label>
      </div>

      <div className={`flex items-center gap-3 pt-2 ${hideCancel ? 'justify-center' : 'justify-end'}`}>
        {!hideCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="text-sm text-gray-600 hover:text-gray-900 px-2 disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        <button type="submit" disabled={loading} className={primaryButtonClassName}>
          {loading ? 'Salvando…' : (submitLabel ?? defaultLabel)}
        </button>
      </div>
    </form>
  )
}
