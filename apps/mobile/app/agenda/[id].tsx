import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { api } from '@/lib/api'
import { colors, radii, shadows } from '@/constants/theme'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Slot {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
}

interface AreaDetail {
  id: string
  name: string
  description?: string
  capacity: number
  rules?: string
  availabilitySlots: Slot[]
}

interface AgendaDetail {
  id: string
  date: string
  period: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ALL_DAY'
  status: 'AVAILABLE' | 'RESERVED'
  area: { id: string; name: string }
  reservation: { id: string; member: { id: string; name: string } } | null
}

// ── Static maps ───────────────────────────────────────────────────────────────

const PERIOD_LABEL: Record<string, string> = {
  MORNING: 'Manhã',
  AFTERNOON: 'Tarde',
  EVENING: 'Noite',
  ALL_DAY: 'Dia todo',
}

const PERIOD_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  MORNING: 'sunny-outline',
  AFTERNOON: 'partly-sunny-outline',
  EVENING: 'moon-outline',
  ALL_DAY: 'calendar-outline',
}

const DAY_LABEL: Record<string, string> = {
  SEGUNDA: 'Segunda-feira',
  TERCA: 'Terça-feira',
  QUARTA: 'Quarta-feira',
  QUINTA: 'Quinta-feira',
  SEXTA: 'Sexta-feira',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
}

const DAY_ORDER: Record<string, number> = {
  SEGUNDA: 0, TERCA: 1, QUARTA: 2, QUINTA: 3, SEXTA: 4, SABADO: 5, DOMINGO: 6,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupByDay(slots: Slot[]): { day: string; times: string[] }[] {
  const map = new Map<string, string[]>()
  for (const s of slots) {
    if (!map.has(s.dayOfWeek)) map.set(s.dayOfWeek, [])
    map.get(s.dayOfWeek)!.push(`${s.startTime} – ${s.endTime}`)
  }
  return [...map.entries()]
    .sort((a, b) => (DAY_ORDER[a[0]] ?? 9) - (DAY_ORDER[b[0]] ?? 9))
    .map(([day, times]) => ({ day, times }))
}

function formatDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AgendaDetailScreen() {
  const { id, areaId, date, period } = useLocalSearchParams<{
    id: string
    areaId: string
    date: string
    period: string
  }>()
  const router = useRouter()

  const [agenda, setAgenda] = useState<AgendaDetail | null>(null)
  const [area, setArea] = useState<AreaDetail | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get<AgendaDetail>(`/agendas/${id}`),
      api.get<AreaDetail>(`/areas/${areaId}`),
    ])
      .then(([agendaData, areaData]) => {
        setAgenda(agendaData)
        setArea(areaData)
      })
      .catch(() => setError(true))
      .finally(() => setLoadingData(false))
  }, [id, areaId])

  const isAvailable = agenda?.status === 'AVAILABLE'

  async function handleConfirm() {
    if (!isAvailable || !agenda) return
    setConfirming(true)
    try {
      await api.post(`/agendas/${agenda.id}/reservations`, {})
      Alert.alert(
        'Reserva confirmada!',
        `${area?.name} · ${PERIOD_LABEL[agenda.period]}\n${formatDate(date)}`,
        [{ text: 'OK', onPress: () => router.back() }],
      )
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Não foi possível confirmar a reserva.'
      Alert.alert('Erro', msg)
    } finally {
      setConfirming(false)
    }
  }

  const dateLabel = date ? formatDate(date) : ''
  const periodKey = period ?? agenda?.period ?? ''

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.ink700} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>Detalhes da Reserva</Text>
        <View style={s.headerBtn} />
      </View>

      {/* ── Content ────────────────────────────────────────────────── */}
      {loadingData ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.ink900} />
        </View>
      ) : error || !area || !agenda ? (
        <View style={s.center}>
          <Ionicons name="cloud-offline-outline" size={36} color={colors.ink300} />
          <Text style={s.errorText}>Não foi possível carregar os dados</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => router.back()}>
            <Text style={s.retryText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero */}
            <View style={s.hero}>
              <View style={s.heroIcon}>
                <MaterialIcons name="outdoor-grill" size={36} color={colors.ink700} />
              </View>
              <Text style={s.heroName}>{area.name}</Text>
              <View style={s.heroMeta}>
                <Ionicons name="people-outline" size={13} color={colors.ink500} />
                <Text style={s.heroMetaText}>{area.capacity} pessoas</Text>
              </View>
            </View>

            {/* Selected slot highlight */}
            <View style={[s.slotCard, isAvailable ? s.slotCardAvailable : s.slotCardReserved]}>
              <View style={s.slotCardRow}>
                <View style={[s.slotIconWrap, isAvailable ? s.slotIconAvailable : s.slotIconReserved]}>
                  <Ionicons
                    name={PERIOD_ICON[periodKey] ?? 'calendar-outline'}
                    size={20}
                    color={isAvailable ? '#16A34A' : colors.ink500}
                  />
                </View>
                <View style={s.slotInfo}>
                  <Text style={s.slotPeriod}>{PERIOD_LABEL[periodKey] ?? periodKey}</Text>
                  <Text style={s.slotDate}>{dateLabel}</Text>
                </View>
                <View style={[s.statusBadge, isAvailable ? s.statusAvailable : s.statusReserved]}>
                  <Text style={[s.statusText, isAvailable ? s.statusAvailableText : s.statusReservedText]}>
                    {isAvailable ? 'Livre' : 'Reservado'}
                  </Text>
                </View>
              </View>
              {!isAvailable && agenda.reservation && (
                <View style={s.reservedByRow}>
                  <Ionicons name="person-outline" size={12} color={colors.ink500} />
                  <Text style={s.reservedByText}>
                    Reservado por {agenda.reservation.member.name}
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            {area.description ? (
              <View style={s.section}>
                <Text style={s.sectionLabel}>Descrição</Text>
                <Text style={s.sectionText}>{area.description}</Text>
              </View>
            ) : null}

            {/* Rules */}
            {area.rules ? (
              <View style={s.section}>
                <Text style={s.sectionLabel}>Regras de uso</Text>
                <View style={s.rulesBox}>
                  <Ionicons name="information-circle-outline" size={15} color={colors.ink600} />
                  <Text style={s.rulesText}>{area.rules}</Text>
                </View>
              </View>
            ) : null}

            {/* Schedule */}
            {area.availabilitySlots.length > 0 ? (
              <View style={s.section}>
                <Text style={s.sectionLabel}>Horários disponíveis</Text>
                <View style={s.scheduleGrid}>
                  {groupByDay(area.availabilitySlots).map(({ day, times }) => (
                    <View key={day} style={s.scheduleRow}>
                      <Text style={s.scheduleDay}>{DAY_LABEL[day] ?? day}</Text>
                      <View style={s.timesList}>
                        {times.map((t) => (
                          <View key={t} style={s.timeChip}>
                            <Ionicons name="time-outline" size={11} color={colors.ink600} />
                            <Text style={s.timeText}>{t}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </ScrollView>

          {/* ── Bottom CTA ─────────────────────────────────────────── */}
          <View style={s.footer}>
            {isAvailable ? (
              <Pressable
                style={({ pressed }) => [s.confirmBtn, (pressed || confirming) && s.confirmBtnPressed]}
                onPress={handleConfirm}
                disabled={confirming}
              >
                {confirming ? (
                  <ActivityIndicator color={colors.ink0} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.ink0} />
                    <Text style={s.confirmBtnText}>Confirmar Reserva</Text>
                  </>
                )}
              </Pressable>
            ) : (
              <View style={s.unavailableBtn}>
                <Ionicons name="lock-closed-outline" size={16} color={colors.ink500} />
                <Text style={s.unavailableBtnText}>Horário indisponível</Text>
              </View>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink200,
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.ink100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink900,
    letterSpacing: -0.2,
    textAlign: 'center',
  },

  // Scroll
  scroll: { padding: 20, gap: 24, paddingBottom: 16 },

  // Hero
  hero: { alignItems: 'center', gap: 10, paddingVertical: 4 },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    backgroundColor: colors.ink100,
    borderWidth: 1,
    borderColor: colors.ink200,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink900,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroMetaText: { fontSize: 13, color: colors.ink500 },

  // Slot highlight card
  slotCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    ...shadows.sm,
  },
  slotCardAvailable: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  slotCardReserved: {
    backgroundColor: colors.ink100,
    borderColor: colors.ink200,
  },
  slotCardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  slotIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotIconAvailable: { backgroundColor: '#DCFCE7' },
  slotIconReserved: { backgroundColor: colors.ink200 },
  slotInfo: { flex: 1, gap: 3 },
  slotPeriod: { fontSize: 15, fontWeight: '700', color: colors.ink900 },
  slotDate: { fontSize: 12, color: colors.ink600, textTransform: 'capitalize' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  statusAvailable: { backgroundColor: '#DCFCE7' },
  statusReserved: { backgroundColor: colors.ink200 },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusAvailableText: { color: '#16A34A' },
  statusReservedText: { color: colors.ink500 },
  reservedByRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reservedByText: { fontSize: 12, color: colors.ink500 },

  // Sections
  section: { gap: 10 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.ink500,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionText: { fontSize: 14, color: colors.ink700, lineHeight: 21 },

  rulesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.ink100,
    borderRadius: radii.sm,
    padding: 12,
  },
  rulesText: { flex: 1, fontSize: 13, color: colors.ink600, lineHeight: 19 },

  scheduleGrid: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.ink200,
    overflow: 'hidden',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink150,
    gap: 12,
  },
  scheduleDay: {
    width: 110,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink700,
    paddingTop: 2,
  },
  timesList: { flex: 1, gap: 6 },
  timeChip: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timeText: { fontSize: 13, color: colors.ink600 },

  // Footer CTA
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.ink200,
    backgroundColor: colors.ink0,
  },
  confirmBtn: {
    backgroundColor: colors.ink900,
    borderRadius: radii.sm,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.md,
  },
  confirmBtnPressed: { opacity: 0.85 },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink0,
    letterSpacing: 0.2,
  },
  unavailableBtn: {
    borderRadius: radii.sm,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.ink100,
    borderWidth: 1,
    borderColor: colors.ink200,
  },
  unavailableBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink500,
  },

  // Error / retry
  errorText: { fontSize: 14, color: colors.ink400 },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.ink900,
    borderRadius: radii.sm,
    marginTop: 4,
  },
  retryText: { fontSize: 13, fontWeight: '600', color: colors.ink0 },
})
