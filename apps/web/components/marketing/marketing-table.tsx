'use client'

import { api } from '@/lib/api'
import { Modal } from '@/components/ui/modal'
import { StatusBadge } from '@/components/ui/status-badge'
import { primaryButtonClassName } from '@/lib/primary-button'
import { MEDIA_TYPE_LABEL, MEDIA_TYPE_VARIANT, MEDIA_ACTIVE_LABEL, MEDIA_ACTIVE_VARIANT } from '@/lib/marketing-labels'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { MarketingForm } from './marketing-form'

type MarketingMedia = {
  id: string
  title: string
  type: string
  imageUrl: string
  active: boolean
  createdAt: string
}

type Props = { items: MarketingMedia[] }

export function MarketingTable({ items }: Props) {
  const router = useRouter()

  const [showNew, setShowNew] = useState(false)
  const [editTarget, setEditTarget] = useState<MarketingMedia | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MarketingMedia | null>(null)
  const [previewTarget, setPreviewTarget] = useState<MarketingMedia | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleRowClick(item: MarketingMedia) {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
      setDeleteTarget(item)
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null
        setEditTarget(item)
      }, 250)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await api.delete(`/marketing/${deleteTarget.id}`)
      setDeleteTarget(null)
      router.refresh()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowNew(true)} className={primaryButtonClassName}>
          + Nova mídia
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleRowClick(item)}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-48 object-cover bg-gray-100"
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setPreviewTarget(item) }}
                className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow hover:bg-white transition-colors"
                title="Ampliar"
              >
                <span className="material-symbols-outlined text-[16px] text-gray-700">open_in_full</span>
              </button>
            </div>
            <div className="p-3 space-y-1.5">
              <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
              <div className="flex items-center gap-2">
                <StatusBadge
                  label={MEDIA_TYPE_LABEL[item.type] ?? item.type}
                  variant={MEDIA_TYPE_VARIANT[item.type] ?? 'gray'}
                />
                <StatusBadge
                  label={MEDIA_ACTIVE_LABEL[String(item.active)]}
                  variant={MEDIA_ACTIVE_VARIANT[String(item.active)]}
                />
              </div>
              <p className="text-[10px] text-gray-400">
                {new Date(item.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
          <span className="material-symbols-outlined text-[40px] text-gray-300 mb-2 block">
            campaign
          </span>
          <p className="text-sm text-gray-400">Nenhuma mídia cadastrada</p>
        </div>
      )}

      {/* New */}
      {showNew && (
        <Modal title="Nova mídia" size="md" scrollable onClose={() => setShowNew(false)}>
          <MarketingForm
            mode="create"
            onSuccess={() => setShowNew(false)}
            submitLabel="Cadastrar"
            hideCancel
          />
        </Modal>
      )}

      {/* Edit */}
      {editTarget && (
        <Modal title="Editar mídia" size="md" scrollable onClose={() => setEditTarget(null)}>
          <MarketingForm
            mode="edit"
            item={editTarget}
            onSuccess={() => setEditTarget(null)}
            submitLabel="Salvar"
            hideCancel
          />
        </Modal>
      )}

      {/* Preview */}
      {previewTarget && (
        <Modal title={previewTarget.title} size="lg" onClose={() => setPreviewTarget(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewTarget.imageUrl}
            alt={previewTarget.title}
            className="w-full rounded-lg object-contain max-h-[70vh]"
          />
        </Modal>
      )}

      {/* Delete */}
      {deleteTarget && (
        <Modal
          title="Excluir mídia"
          size="sm"
          onClose={() => { if (!deleteLoading) setDeleteTarget(null) }}
        >
          <p className="text-sm text-gray-600 mb-1">Excluir permanentemente:</p>
          <p className="text-sm font-medium text-gray-900 mb-4">
            &ldquo;{deleteTarget.title}&rdquo;
          </p>
          {deleteError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
              {deleteError}
            </div>
          )}
          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteLoading}
              className="text-sm text-gray-600 hover:text-gray-900 px-2 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleteLoading ? 'Excluindo…' : 'Excluir'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
