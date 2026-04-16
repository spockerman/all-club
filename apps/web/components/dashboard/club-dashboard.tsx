import Link from 'next/link'
import { PrimaryNavigateButton } from '@/components/ui/primary-navigate-button'
import { outlineButtonClassName } from '@/lib/primary-button'
import {
  dashboardMetrics,
  receitaRecorrente,
  reservaDestaque,
  reservasPorAno,
  tabsReservas,
} from '@/lib/dashboard-fake-data'

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden>
      {name}
    </span>
  )
}

export function ClubDashboard() {
  const m = dashboardMetrics

  return (
    <div className="pt-2">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pt-4">
        <div className="bg-surface-container-lowest rounded-xl p-5">
          <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
            Ocupação das áreas
          </p>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-[2.25rem] font-bold leading-none text-on-surface">{m.ocupacao.value}</span>
            <span className="text-xs text-on-surface-variant mb-1">/ {m.ocupacao.max}</span>
          </div>
          <div className="flex items-center justify-between pt-4 ghost-border border-0 border-t border-t-[rgba(44,52,55,0.08)]">
            <div className="flex items-center text-secondary text-[11px] font-bold">
              <Icon name="north_east" className="text-[14px] mr-1" />
              {m.ocupacao.deltaLabel}
            </div>
            <Link
              href="/areas"
              className="text-[11px] text-on-surface-variant font-medium hover:text-on-surface flex items-center gap-1 transition-colors"
            >
              Ver áreas <Icon name="arrow_forward" className="text-[14px]" />
            </Link>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Agendamentos (mês)
              </p>
              <span className="text-[2.25rem] font-bold leading-none text-on-surface">
                {m.agendamentosMes.value}
              </span>
            </div>
            <div className="w-16 h-10">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="dashGreenFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 35 Q 20 10, 40 25 T 100 5 L 100 40 L 0 40 Z"
                  fill="url(#dashGreenFill)"
                />
                <path d="M0 35 Q 20 10, 40 25 T 100 5" fill="none" stroke="#10B981" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-t-[rgba(44,52,55,0.08)]">
            <div className="flex items-center text-secondary text-[11px] font-bold">
              <Icon name="north_east" className="text-[14px] mr-1" />
              {m.agendamentosMes.deltaPct} vs mês anterior
            </div>
            <Link
              href="/bookings"
              className="text-[11px] text-on-surface-variant font-medium hover:text-on-surface flex items-center gap-1 transition-colors"
            >
              Ver agenda <Icon name="arrow_forward" className="text-[14px]" />
            </Link>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Check-ins (academia)
              </p>
              <span className="text-[2.25rem] font-bold leading-none text-on-surface">
                {m.checkInsSemana.value.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="w-16 h-10">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path
                  d="M0 38 L 20 30 L 40 35 L 60 20 L 80 25 L 100 15"
                  fill="none"
                  stroke="#2c3437"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-t-[rgba(44,52,55,0.08)]">
            <div className="flex items-center text-secondary text-[11px] font-bold">
              <Icon name="north_east" className="text-[14px] mr-1" />
              {m.checkInsSemana.deltaPct} esta semana
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
              <Icon name="trending_up" className="text-sm text-on-surface-variant" />
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Novos sócios (trim.)
              </p>
              <span className="text-[2.25rem] font-bold leading-none text-on-surface">
                {m.novosSociosTrim.value}
              </span>
            </div>
            <div className="w-16 h-10">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path
                  d="M0 35 Q 30 5, 50 25 T 100 10"
                  fill="none"
                  stroke="#2c3437"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-t-[rgba(44,52,55,0.08)]">
            <div className="flex items-center text-secondary text-[11px] font-bold">
              <Icon name="north_east" className="text-[14px] mr-1" />
              {m.novosSociosTrim.deltaPct} vs trim. anterior
            </div>
            <Link
              href="/members"
              className="text-[11px] text-on-surface-variant font-medium hover:text-on-surface flex items-center gap-1 transition-colors"
            >
              Ver sócios <Icon name="arrow_forward" className="text-[14px]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        <div className="lg:col-span-3 bg-surface-container-lowest rounded-xl p-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Mensalidades arrecadadas
              </p>
              <p className="text-[2.25rem] font-bold text-on-surface">{receitaRecorrente.total}</p>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-on-background inline-block" />
                  {receitaRecorrente.seriesLabelA}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-surface-container-high inline-block" />
                  {receitaRecorrente.seriesLabelB}
                </span>
              </div>
              <select className="text-xs font-semibold bg-surface-container rounded-lg border-none focus:ring-0 px-3 py-1.5 text-on-surface cursor-pointer">
                <option>Mês</option>
              </select>
            </div>
          </div>
          <div className="h-64 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full" style={{ borderTop: '1px solid rgba(44,52,55,0.06)' }} />
              ))}
            </div>
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
              <defs>
                <linearGradient id="dashPrimaryStroke" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#1A1A1A" />
                  <stop offset="100%" stopColor="#545353" />
                </linearGradient>
              </defs>
              <path
                d="M0,150 C100,130 150,140 200,100 S300,160 400,120 S500,80 600,90 S700,130 800,70 S900,50 1000,40"
                fill="none"
                stroke="url(#dashPrimaryStroke)"
                strokeWidth="2.5"
              />
              <path
                d="M0,160 C100,150 150,155 200,130 S300,180 400,150 S500,110 600,120 S700,160 800,110 S900,100 1000,95"
                fill="none"
                stroke="#acb3b7"
                strokeDasharray="5 4"
                strokeWidth="1.5"
              />
            </svg>
            <div className="absolute bottom-0 w-full flex justify-between text-[10px] font-bold text-on-surface-variant px-1">
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
              <span>25</span>
              <span>30</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                Reservas por período
              </p>
              <p className="text-[2.25rem] font-bold text-on-surface">{reservasPorAno.total}</p>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-on-background inline-block" />
                  {reservasPorAno.labelA}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-surface-container-high inline-block" />
                  {reservasPorAno.labelB}
                </span>
              </div>
              <select className="text-xs font-semibold bg-surface-container rounded-lg border-none focus:ring-0 px-3 py-1.5 text-on-surface cursor-pointer">
                <option>Ano</option>
              </select>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-1.5">
            {[40, 55, 45, 70, 60, 90, 65, 50].map((hOuter, i) => (
              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                <div
                  className="w-full bg-surface-container group-hover:bg-surface-container-high rounded-t relative transition-colors"
                  style={{ height: `${hOuter}%` }}
                >
                  <div
                    className="absolute bottom-0 w-full bg-on-background rounded-t"
                    style={{ height: `${[60, 45, 75, 50, 80, 70, 55, 40][i]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Faixa inferior — reserva em destaque (layout preview; painel direito fica no shell) */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-surface-container-lowest rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[1.5rem] font-bold text-on-surface">Reservas em destaque</h2>
            <PrimaryNavigateButton href="/bookings">
              <Icon name="add" className="text-[16px]" />
              Nova reserva
            </PrimaryNavigateButton>
          </div>

          <div className="flex items-center gap-6 mb-6 text-xs font-bold text-on-surface-variant">
            {tabsReservas.map((tab, i) => (
              <button
                key={tab.id}
                type="button"
                className={`pb-3 transition-colors ${
                  i === 0
                    ? 'text-on-surface border-b-2 border-gray-900'
                    : 'border-b-2 border-transparent hover:text-on-surface'
                }`}
              >
                {tab.label}{' '}
                <span className="ml-1 font-normal opacity-40">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 group hover:bg-surface-container-low p-4 rounded-xl transition-colors">
            <div className="relative w-48 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container flex items-center justify-center">
              <Icon name="pool" className="text-5xl text-on-surface-variant" />
              <div
                className="absolute bottom-2 left-2 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: 'rgba(44,52,55,0.55)', backdropFilter: 'blur(8px)' }}
              >
                <Icon name="image" className="text-[12px]" />4
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-[1.5rem] font-bold text-on-surface mb-1">{reservaDestaque.area}</p>
                  <p className="text-xs text-on-surface-variant mb-3">
                    Capacidade 40 pessoas · {reservaDestaque.vagasRestantes} vagas restantes hoje
                  </p>
                  <p className="flex items-center text-xs font-medium text-on-surface">
                    <Icon name="location_on" className="text-[16px] mr-1" />
                    Clube All Club — Ala esportes
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-2 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
                    <span className="text-xs font-bold text-on-surface">{reservaDestaque.statusDias}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mb-4">{reservaDestaque.data}</p>
                  <div className="flex gap-2 justify-end">
                    <Link href="/bookings" className={outlineButtonClassName}>
                      <Icon name="north_east" className="text-[14px]" />
                      Detalhes
                    </Link>
                    <Link href="/areas" className={outlineButtonClassName}>
                      <Icon name="edit" className="text-[14px]" />
                      Área
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 flex items-center gap-4 border-t border-t-[rgba(44,52,55,0.08)]">
                <div className="w-28 h-5 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                    {[0, 5, 10, 15, 20, 25, 30, 35].map((x, i) => (
                      <rect
                        key={x}
                        fill="#eaeff2"
                        height={[10, 12, 15, 8, 18, 14, 10, 12][i]}
                        width="3"
                        x={x}
                        y={20 - [10, 12, 15, 8, 18, 14, 10, 12][i]}
                      />
                    ))}
                  </svg>
                </div>
                <div className="text-[11px] font-bold text-on-surface flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Icon name="visibility" className="text-[16px]" />
                    {reservaDestaque.visualizacoes} consultas ao calendário
                  </span>
                  <span className="text-secondary">+{reservaDestaque.novosHoje} hoje</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
