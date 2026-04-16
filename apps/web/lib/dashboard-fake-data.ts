/** Dados fictícios para o painel — substituir por API quando existir. */
export const dashboardMetrics = {
  ocupacao: { value: 78, max: 100, deltaLabel: '+5 vs semana anterior' },
  agendamentosMes: { value: 142, deltaPct: '12%' },
  checkInsSemana: { value: 1086, deltaPct: '8%' },
  novosSociosTrim: { value: 11, deltaPct: '34%' },
} as const

export const receitaRecorrente = {
  total: 'R$ 428.950',
  seriesLabelA: 'Out',
  seriesLabelB: 'Set',
} as const

export const reservasPorAno = {
  total: 184,
  labelA: '2024',
  labelB: '2023',
} as const

export const reservaDestaque = {
  area: 'Piscina olímpica',
  horario: '14:00 – 18:00',
  data: '15 abr. 2026',
  socio: 'Família Ribeiro',
  vagasRestantes: 3,
  statusDias: 'Ativa há 12 dias',
  visualizacoes: 217,
  novosHoje: 8,
} as const

export const tabsReservas = [
  { id: 'all', label: 'Todas', count: 24 },
  { id: 'pool', label: 'Piscina', count: 8 },
  { id: 'salon', label: 'Salão de festas', count: 6 },
] as const

export const eficienciaEquipe = [
  { nome: 'Marina Costa', iniciais: 'MC', pct: '82%', width: '82%', bar: 'bg-gray-900' },
  { nome: 'Paulo Alves', iniciais: 'PA', pct: '71%', width: '71%', bar: 'bg-gray-600' },
  { nome: 'Luísa Mendes', iniciais: 'LM', pct: '59%', width: '59%', bar: 'bg-gray-400' },
] as const
