'use client'

import { api } from '@/lib/api'
import { getAreaIconComponent } from '@/components/icons/area-icons'
import type { AgendaPeriod } from '@all-club/shared'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

type MemberOption = { id: string; name: string }
type AreaOption = { id: string; name: string; description?: string | null }
type AvailableAgenda = { id: string; period: AgendaPeriod }

type Props = {
  members: MemberOption[]
  areas: AreaOption[]
  onSuccess?: () => void
  onCancel?: () => void
  hideCancel?: boolean
}

// ── Constants ────────────────────────────────────────────────────────────────

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// All 4 periods — always rendered, enabled only when returned by the API
const PERIOD_CONFIG: { key: AgendaPeriod; label: string; icon: string }[] = [
  { key: 'MORNING',   label: 'Manhã',    icon: 'light_mode' },
  { key: 'AFTERNOON', label: 'Tarde',    icon: 'wb_twilight' },
  { key: 'EVENING',   label: 'Noite',    icon: 'dark_mode' },
  { key: 'ALL_DAY',   label: 'Dia todo', icon: 'calendar_today' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toLocalISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ── Component ────────────────────────────────────────────────────────────────

export function BookingForm({ members, areas, onSuccess, onCancel, hideCancel }: Props) {
  const router = useRouter()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Member search
  const [memberQuery, setMemberQuery] = useState('')
  const [memberId, setMemberId] = useState('')

  // Area
  const [areaSearch, setAreaSearch] = useState('')
  const [selectedAreaId, setSelectedAreaId] = useState('')

  // Date
  const [weekStart, setWeekStart] = useState<Date>(today)
  const [selectedDate, setSelectedDate] = useState(toLocalISO(today))

  // Period
  const [selectedPeriod, setSelectedPeriod] = useState<AgendaPeriod | ''>('')

  // Available agendas
  const [availableAgendas, setAvailableAgendas] = useState<AvailableAgenda[]>([])
  const [loadingAgendas, setLoadingAgendas] = useState(false)

  // Submit
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch available agendas whenever area or date changes
  useEffect(() => {
    if (!selectedAreaId || !selectedDate) {
      setAvailableAgendas([])
      setSelectedPeriod('')
      return
    }
    setLoadingAgendas(true)
    setAvailableAgendas([])
    setSelectedPeriod('')
    const params = new URLSearchParams({
      areaId: selectedAreaId,
      dateFrom: selectedDate,
      dateTo: selectedDate,
      status: 'AVAILABLE',
    })
    api
      .get<AvailableAgenda[]>(`/agendas?${params.toString()}`)
      .then(setAvailableAgendas)
      .catch(() => setError('Erro ao carregar períodos disponíveis.'))
      .finally(() => setLoadingAgendas(false))
  }, [selectedAreaId, selectedDate])

  // Derived
  const selectedMember = members.find((m) => m.id === memberId)
  const filteredMembers = memberQuery.trim()
    ? members.filter((m) => m.name.toLowerCase().includes(memberQuery.toLowerCase()))
    : []
  const availablePeriodKeys = new Set(availableAgendas.map((a) => a.period))
  const agendaId = availableAgendas.find((a) => a.period === selectedPeriod)?.id ?? ''
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const filteredAreas = areas.filter((a) =>
    a.name.toLowerCase().includes(areaSearch.toLowerCase()),
  )
  const selectedArea = areas.find((a) => a.id === selectedAreaId)
  const canSubmit = !!memberId && !!selectedAreaId && !!selectedDate && !!agendaId

  function selectMember(id: string) {
    setMemberId(id)
    setMemberQuery('')
  }

  function clearMember() {
    setMemberId('')
    setMemberQuery('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setLoading(true)
    try {
      await api.post(`/agendas/${agendaId}/reservations`, { memberId })
      router.refresh()
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar reserva.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── 1. Sócio ─────────────────────────────────────────────────────────── */}
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-on-surface">Sócio</h3>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            person_search
          </span>
          <input
            type="text"
            value={memberQuery}
            onChange={(e) => { setMemberQuery(e.target.value); if (memberId) clearMember() }}
            placeholder="Buscar sócio pelo nome…"
            autoComplete="off"
            className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-on-surface-variant/50"
          />
        </div>

        {/* Dropdown results */}
        {filteredMembers.length > 0 && !memberId && (
          <ul className="bg-white border border-gray-200 rounded-xl shadow-md max-h-44 overflow-y-auto divide-y divide-gray-50">
            {filteredMembers.slice(0, 6).map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectMember(m.id)}
                  className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-gray-50 transition-colors"
                >
                  {m.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Selected member chip */}
        {selectedMember && (
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-xl">
            <span className="material-symbols-outlined text-[20px] text-white/70">person</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">
                Sócio selecionado
              </p>
              <p className="text-sm font-bold truncate">{selectedMember.name}</p>
            </div>
            <button type="button" onClick={clearMember} className="text-white/50 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}
      </section>

      {/* ── 2. Área ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-on-surface">Área</h3>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold mt-0.5">
              {filteredAreas.length} disponíveis
            </p>
          </div>
          <div className="relative w-full sm:w-52">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={areaSearch}
              onChange={(e) => setAreaSearch(e.target.value)}
              placeholder="Buscar área..."
              className="w-full bg-gray-50 border-none rounded-xl py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredAreas.map((area) => {
            const isSelected = area.id === selectedAreaId
            const AreaIcon = getAreaIconComponent(area.name)
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => setSelectedAreaId(isSelected ? '' : area.id)}
                className={`group p-4 rounded-xl text-left space-y-3 relative transition-all ${
                  isSelected
                    ? 'bg-gray-50 ring-2 ring-gray-900'
                    : 'bg-gray-50 border border-transparent hover:border-gray-200'
                }`}
              >
                {isSelected && (
                  <span className="material-symbols-outlined icon-filled absolute top-3 right-3 text-gray-900 text-[18px]">
                    check_circle
                  </span>
                )}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-gray-900 text-white'
                      : 'bg-surface-container text-on-surface-variant group-hover:bg-gray-100'
                  }`}
                >
                  <AreaIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-on-surface text-sm leading-tight">{area.name}</p>
                  {area.description && (
                    <p className="text-xs text-on-surface-variant mt-0.5 truncate">{area.description}</p>
                  )}
                </div>
              </button>
            )
          })}
          {filteredAreas.length === 0 && (
            <p className="col-span-3 text-sm text-on-surface-variant py-2">Nenhuma área encontrada.</p>
          )}
        </div>
      </section>

      {/* ── 3. Data ───────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold text-on-surface">Data</h3>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setWeekStart((w) => addDays(w, -7))}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">chevron_left</span>
          </button>

          <div className="flex flex-1 gap-1.5">
            {weekDays.map((day) => {
              const iso = toLocalISO(day)
              const isSelected = iso === selectedDate
              const isPast = day < today
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={isPast}
                  onClick={() => setSelectedDate(iso)}
                  className={`flex-1 h-[84px] rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-gray-900 text-white shadow-md ring-4 ring-gray-200/40'
                      : isPast
                        ? 'bg-gray-50 opacity-30 cursor-not-allowed'
                        : 'bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                  }`}
                >
                  <span className={`text-[9px] font-bold tracking-widest uppercase ${isSelected ? 'text-white/60' : 'text-on-surface-variant'}`}>
                    {DAYS_PT[day.getDay()]}
                  </span>
                  <span className={`text-lg font-black leading-none ${isSelected ? 'text-white' : 'text-on-surface'}`}>
                    {day.getDate()}
                  </span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => setWeekStart((w) => addDays(w, 7))}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">chevron_right</span>
          </button>
        </div>
      </section>

      {/* ── 4. Período + Visual da Área ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">

        {/* Left: Period toggles — all 4, disabled until agendas load */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-on-surface">Período</h3>
            {loadingAgendas && (
              <span className="text-xs text-on-surface-variant animate-pulse">Verificando…</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {PERIOD_CONFIG.map(({ key, label, icon }) => {
              const isActive = selectedPeriod === key
              // Enabled only when this period exists in the fetched available agendas
              const isEnabled = availablePeriodKeys.has(key)

              return (
                <button
                  key={key}
                  type="button"
                  disabled={!isEnabled}
                  onClick={() => setSelectedPeriod(isActive ? '' : key)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-sm'
                      : isEnabled
                        ? 'bg-gray-50 text-on-surface-variant border border-transparent hover:bg-gray-100'
                        : 'bg-gray-50 text-on-surface-variant/25 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[22px]">{icon}</span>
                    <span className="text-sm font-bold">{label}</span>
                  </div>
                  <span className={`material-symbols-outlined icon-filled text-[24px] ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {isActive ? 'toggle_on' : 'toggle_off'}
                  </span>
                </button>
              )
            })}
          </div>

          {selectedAreaId && selectedDate && !loadingAgendas && availablePeriodKeys.size === 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Nenhuma agenda disponível nesta data. Cadastre em <strong>Agendas</strong>.
            </p>
          )}
        </section>

        {/* Right: Area visual panel */}
        <div className="rounded-xl overflow-hidden bg-gray-900 aspect-[4/3] relative flex items-end">
          {selectedArea ? (
            <>
              {/* Large area icon centered */}
              <div className="absolute inset-0 flex items-center justify-center">
                {(() => {
                  const AreaIcon = getAreaIconComponent(selectedArea.name)
                  return <AreaIcon className="w-20 h-20 text-white/10" />
                })()}
              </div>
              {/* Gradient overlay + info */}
              <div className="relative w-full bg-gradient-to-t from-black/70 to-transparent px-4 py-4">
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-0.5">
                  Local selecionado
                </p>
                <p className="text-sm font-bold text-white leading-tight">{selectedArea.name}</p>
                {selectedArea.description && (
                  <p className="text-xs text-white/60 mt-0.5">{selectedArea.description}</p>
                )}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/20">
              <span className="material-symbols-outlined text-[48px]">location_on</span>
              <p className="text-xs font-semibold uppercase tracking-widest">Selecione uma área</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      <div className={`flex items-center gap-3 pt-2 border-t border-gray-100 ${hideCancel ? 'justify-center' : ''}`}>
        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="flex-1 sm:flex-none sm:min-w-[200px] inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
        >
          {loading ? 'Salvando…' : 'Confirmar Agendamento'}
        </button>
        {!hideCancel && (
          <button
            type="button"
            onClick={() => (onCancel ? onCancel() : router.back())}
            className="text-sm text-gray-600 hover:text-gray-900 px-2"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
