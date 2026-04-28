import { useEffect, useState, useCallback, useMemo } from 'react'
import { useFocusEffect } from 'expo-router'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { api } from '@/lib/api'
import { colors, radii, shadows } from '@/constants/theme'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AgendaSlot {
  id: string
  date: string
  period: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ALL_DAY'
  status: 'AVAILABLE' | 'RESERVED'
  area: { id: string; name: string }
  reservation: { id: string; member: { name: string } } | null
}

type FilterKey = 'ALL' | 'AVAILABLE' | 'RESERVED'

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

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: 'Livre',
  RESERVED: 'Reservado',
}

const DAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'AVAILABLE', label: 'Livre' },
  { key: 'RESERVED', label: 'Reservado' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function toYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildWeekDates(anchor: Date): Date[] {
  const day = anchor.getDay()
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

// ── DayCell ───────────────────────────────────────────────────────────────────

function DayCell({
  d,
  isSelected,
  isToday,
  onPress,
}: {
  d: Date
  isSelected: boolean
  isToday: boolean
  onPress: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        s.dayCell,
        isSelected && s.dayCellSelected,
        !isSelected && isToday && s.dayCellToday,
        !isSelected && hovered && s.dayCellHovered,
      ]}
    >
      <Text style={[s.dayCellMonth, isSelected && s.dayCellTextInv]}>
        {MONTH_SHORT[d.getMonth()]}
      </Text>
      <Text style={[s.dayCellNum, isSelected && s.dayCellTextInv, !isSelected && isToday && s.dayCellNumToday]}>
        {d.getDate()}
      </Text>
      <Text style={[s.dayCellWeek, isSelected && s.dayCellTextInv]}>
        {DAY_SHORT[d.getDay()]}
      </Text>
    </Pressable>
  )
}

// ── FilterPill ────────────────────────────────────────────────────────────────

function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        s.pill,
        active && s.pillActive,
        !active && hovered && s.pillHovered,
      ]}
    >
      <Text style={[s.pillText, active && s.pillTextActive]}>{label}</Text>
    </Pressable>
  )
}

// ── SlotCard ──────────────────────────────────────────────────────────────────

function SlotCard({
  item,
  onReserve,
}: {
  item: AgendaSlot
  onReserve: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const isOpen = item.status === 'AVAILABLE'
  const active = isOpen && hovered

  return (
    <Pressable
      onPress={() => isOpen && onReserve(item.id)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      disabled={!isOpen}
      style={[
        s.card,
        isOpen && s.cardOpen,
        active && s.cardActive,
      ]}
    >
      {/* Period icon */}
      <View style={[s.cardIconWrap, active && s.cardIconWrapActive]}>
        <Ionicons
          name={PERIOD_ICON[item.period] ?? 'calendar-outline'}
          size={18}
          color={active ? colors.ink0 : colors.ink700}
        />
      </View>

      {/* Info */}
      <View style={s.cardBody}>
        <Text style={[s.cardArea, active && s.cardTextInv]}>
          {item.area.name}
        </Text>
        <Text style={[s.cardPeriod, active && s.cardSubInv]}>
          {PERIOD_LABEL[item.period]}
        </Text>
        {item.reservation && (
          <View style={s.reservedRow}>
            <Ionicons
              name="person-outline"
              size={10}
              color={active ? colors.ink400 : colors.ink500}
            />
            <Text style={[s.reservedName, active && s.cardSubInv]}>
              {item.reservation.member.name}
            </Text>
          </View>
        )}
      </View>

      {/* Status badge */}
      <View style={[
        s.badge,
        item.status === 'AVAILABLE' && s.badgeOpen,
        item.status === 'RESERVED' && s.badgeReserved,
        active && s.badgeActiveOverride,
      ]}>
        <Text style={[
          s.badgeText,
          item.status === 'AVAILABLE' && s.badgeOpenText,
          item.status === 'RESERVED' && s.badgeReservedText,
          active && s.badgeActiveText,
        ]}>
          {STATUS_LABEL[item.status]}
        </Text>
      </View>

      {isOpen && (
        <Ionicons
          name="chevron-forward"
          size={14}
          color={active ? colors.ink300 : colors.ink400}
        />
      )}
    </Pressable>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AgendaScreen() {
  const todayRef = useMemo(() => new Date(), [])
  const [selected, setSelected] = useState<Date>(todayRef)
  const [weekAnchor, setWeekAnchor] = useState<Date>(todayRef)
  const [slots, setSlots] = useState<AgendaSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<FilterKey>('ALL')
  const router = useRouter()

  const weekDates = buildWeekDates(weekAnchor)
  const todayYMD = toYMD(todayRef)
  const selectedYMD = toYMD(selected)

  const loadSlots = useCallback((date: Date) => {
    setLoading(true)
    const ymd = toYMD(date)
    api.get<AgendaSlot[]>(`/agendas?dateFrom=${ymd}&dateTo=${ymd}`)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }, [])

  // Reload when date changes
  useEffect(() => { loadSlots(selected) }, [selected, loadSlots])

  // Reload when returning from booking confirmation
  useFocusEffect(
    useCallback(() => { loadSlots(selected) }, [loadSlots, selected]),
  )

  const filtered = useMemo(() => {
    if (filter === 'ALL') return slots
    if (filter === 'AVAILABLE') return slots.filter((s) => s.status === 'AVAILABLE')
    return slots.filter((s) => s.status === 'RESERVED')
  }, [slots, filter])

  function handleReserve(slotId: string) {
    const slot = slots.find((s) => s.id === slotId)
    if (!slot || slot.status !== 'AVAILABLE') return
    router.push(
      `/agenda/${slotId}?areaId=${slot.area.id}&date=${selectedYMD}&period=${slot.period}` as never,
    )
  }

  const monthLabel = selected.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const displayMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  function prevWeek() {
    const d = new Date(weekAnchor)
    d.setDate(d.getDate() - 7)
    setWeekAnchor(d)
  }

  function nextWeek() {
    const d = new Date(weekAnchor)
    d.setDate(d.getDate() + 7)
    setWeekAnchor(d)
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Agenda</Text>
        <Text style={s.headerSub}>{displayMonth}</Text>
      </View>

      {/* ── Week strip ─────────────────────────────────────────────── */}
      <View style={s.weekWrap}>
        <TouchableOpacity
          onPress={prevWeek}
          style={s.weekArrow}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={16} color={colors.ink600} />
        </TouchableOpacity>

        <View style={s.weekDays}>
          {weekDates.map((d) => (
            <DayCell
              key={toYMD(d)}
              d={d}
              isSelected={toYMD(d) === selectedYMD}
              isToday={toYMD(d) === todayYMD}
              onPress={() => setSelected(d)}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={nextWeek}
          style={s.weekArrow}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-forward" size={16} color={colors.ink600} />
        </TouchableOpacity>
      </View>

      {/* ── Filter pills ───────────────────────────────────────────── */}
      <View style={s.pillsRow}>
        {FILTERS.map(({ key, label }) => (
          <FilterPill
            key={key}
            label={label}
            active={filter === key}
            onPress={() => setFilter(key)}
          />
        ))}
      </View>

      {/* ── Slot list ──────────────────────────────────────────────── */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.ink900} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SlotCard
              item={item}
              onReserve={handleReserve}
            />
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="calendar-outline" size={40} color={colors.ink300} />
              <Text style={s.emptyText}>
                {filter !== 'ALL'
                  ? 'Nenhum horário nesta categoria'
                  : 'Nenhum horário cadastrado neste dia'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink200,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink900,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: colors.ink500,
    marginTop: 1,
  },

  // Week strip
  weekWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink200,
  },
  weekArrow: {
    width: 28,
    alignItems: 'center',
  },
  weekDays: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Day cell
  dayCell: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: radii.md,
    gap: 2,
    minWidth: 36,
  },
  dayCellSelected: {
    backgroundColor: colors.ink900,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: colors.ink700,
  },
  dayCellHovered: {
    backgroundColor: colors.ink150,
  },
  dayCellMonth: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.ink500,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  dayCellNum: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink800,
  },
  dayCellNumToday: {
    color: colors.ink900,
  },
  dayCellWeek: {
    fontSize: 9,
    fontWeight: '500',
    color: colors.ink500,
    letterSpacing: 0.2,
  },
  dayCellTextInv: {
    color: colors.ink0,
  },

  // Filter pills
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink200,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radii.full,
    backgroundColor: colors.ink100,
  },
  pillActive: {
    backgroundColor: colors.ink900,
  },
  pillHovered: {
    backgroundColor: colors.ink200,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink500,
  },
  pillTextActive: {
    color: colors.ink0,
  },

  // List
  list: { padding: 16, gap: 10, paddingBottom: 32 },

  // Slot card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ink0,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.ink200,
    padding: 14,
    gap: 12,
    ...shadows.sm,
  },
  cardOpen: {
    borderLeftWidth: 3,
    borderLeftColor: '#16A34A',
  },
  cardActive: {
    backgroundColor: colors.ink900,
    borderColor: colors.ink900,
    borderLeftColor: colors.ink900,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.ink100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconWrapActive: {
    backgroundColor: colors.ink700,
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardArea: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink900,
  },
  cardPeriod: {
    fontSize: 12,
    color: colors.ink500,
  },
  cardTextInv: { color: colors.ink0 },
  cardSubInv: { color: colors.ink400 },

  reservedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  reservedName: {
    fontSize: 11,
    color: colors.ink500,
  },

  // Badges
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeOpen: { backgroundColor: '#F0FDF4' },
  badgeOpenText: { color: '#16A34A' },
  badgeReserved: { backgroundColor: '#FFFBEB' },
  badgeReservedText: { color: '#D97706' },
  badgeClosed: { backgroundColor: colors.ink100 },
  badgeClosedText: { color: colors.ink500 },
  badgeActiveOverride: { backgroundColor: colors.ink700 },
  badgeActiveText: { color: colors.ink200 },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.ink400,
  },
})
