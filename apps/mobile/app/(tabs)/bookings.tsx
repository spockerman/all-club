import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { colors, radii, shadows } from '@/constants/theme'
import { ScreenHeader } from '@/components/ui/ScreenHeader'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BookingSummary {
  id: string
  date: string
  period: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ALL_DAY'
  status: 'AVAILABLE' | 'RESERVED'
  area: { id: string; name: string }
  reservation: { id: string; status: 'CONFIRMED' | 'CANCELLED'; member: { id: string; name: string } } | null
}

// ── Static maps ───────────────────────────────────────────────────────────────

const PERIOD_LABEL: Record<string, string> = {
  MORNING: 'Manhã',
  AFTERNOON: 'Tarde',
  EVENING: 'Noite',
  ALL_DAY: 'Dia todo',
}

const RESERVATION_STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
}

const STATUS_BADGE_BG: Record<string, string> = {
  CONFIRMED: '#F0FDF4',
  CANCELLED: '#FEF2F2',
}

const STATUS_BADGE_TEXT: Record<string, string> = {
  CONFIRMED: '#16A34A',
  CANCELLED: '#DC2626',
}

const STATUS_BORDER: Record<string, string> = {
  CONFIRMED: '#16A34A',
  CANCELLED: '#DC2626',
}

// ── BookingCard ───────────────────────────────────────────────────────────────

function BookingCard({ item }: { item: BookingSummary }) {
  const [hovered, setHovered] = useState(false)
  const reservationStatus = item.reservation?.status ?? 'CONFIRMED'

  const dateStr = new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        s.card,
        { borderLeftColor: STATUS_BORDER[reservationStatus] ?? colors.ink300 },
        hovered && s.cardHovered,
      ]}
    >
      {/* Icon */}
      <View style={[s.cardIcon, hovered && s.cardIconHovered]}>
        <Ionicons
          name="receipt-outline"
          size={18}
          color={hovered ? colors.ink0 : colors.ink700}
        />
      </View>

      {/* Info */}
      <View style={s.cardBody}>
        <Text style={[s.cardArea, hovered && s.cardTextInv]} numberOfLines={1}>
          {item.area.name}
        </Text>
        <View style={s.cardMeta}>
          <Ionicons name="calendar-outline" size={11} color={hovered ? colors.ink400 : colors.ink500} />
          <Text style={[s.cardMetaText, hovered && s.cardSubInv]}>{dateStr}</Text>
          <Text style={[s.cardDot, hovered && s.cardSubInv]}>·</Text>
          <Ionicons name="time-outline" size={11} color={hovered ? colors.ink400 : colors.ink500} />
          <Text style={[s.cardMetaText, hovered && s.cardSubInv]}>
            {PERIOD_LABEL[item.period] ?? item.period}
          </Text>
        </View>
      </View>

      {/* Badge */}
      <View style={[
        s.badge,
        hovered
          ? s.badgeHovered
          : { backgroundColor: STATUS_BADGE_BG[reservationStatus] ?? colors.ink100 },
      ]}>
        <Text style={[
          s.badgeText,
          hovered
            ? s.badgeTextHovered
            : { color: STATUS_BADGE_TEXT[reservationStatus] ?? colors.ink500 },
        ]}>
          {RESERVATION_STATUS_LABEL[reservationStatus] ?? reservationStatus}
        </Text>
      </View>
    </Pressable>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<BookingSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState('')
  const { user } = useAuth()

  const load = useCallback(() => {
    const memberId = user?.memberId
    if (!memberId) { setLoading(false); return }
    setLoading(true)
    setError(false)
    api.get<BookingSummary[]>(`/agendas?memberId=${memberId}`)
      .then(setBookings)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [user?.memberId])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return bookings
    return bookings.filter((b) => b.area.name.toLowerCase().includes(q) || PERIOD_LABEL[b.period]?.toLowerCase().includes(q))
  }, [bookings, query])

  return (
    <SafeAreaView style={s.root} edges={['top']}>

      <ScreenHeader title="Minhas Reservas" />

      {/* Search */}
      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={16} color={colors.ink500} style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar por área..."
          placeholderTextColor={colors.ink500}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* List */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.ink900} />
        </View>
      ) : error ? (
        <View style={s.center}>
          <Ionicons name="cloud-offline-outline" size={36} color={colors.ink300} />
          <Text style={s.message}>Não foi possível carregar as reservas</Text>
          <Pressable style={s.retryBtn} onPress={load}>
            <Text style={s.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <BookingCard item={item} />}
          ListEmptyComponent={
            <View style={s.center}>
              <Ionicons name="receipt-outline" size={40} color={colors.ink300} />
              <Text style={s.message}>
                {query.trim() ? 'Nenhuma reserva encontrada' : 'Você não tem reservas'}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: colors.ink100,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink900 },

  list: { padding: 16, gap: 10, paddingBottom: 32 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ink0,
    borderRadius: radii.md,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: colors.ink200,
    padding: 14,
    gap: 12,
    ...shadows.sm,
  },
  cardHovered: {
    backgroundColor: colors.ink900,
    borderColor: colors.ink900,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.ink100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconHovered: { backgroundColor: colors.ink700 },
  cardBody: { flex: 1, gap: 4 },
  cardArea: { fontSize: 14, fontWeight: '600', color: colors.ink900 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontSize: 11, color: colors.ink500 },
  cardDot: { fontSize: 11, color: colors.ink300 },
  cardTextInv: { color: colors.ink0 },
  cardSubInv: { color: colors.ink400 },

  cardRight: { alignItems: 'flex-end', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.full },
  badgeHovered: { backgroundColor: colors.ink700 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextHovered: { color: colors.ink200 },

  message: { fontSize: 14, color: colors.ink400 },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.ink900,
    borderRadius: radii.sm,
  },
  retryText: { fontSize: 13, fontWeight: '600', color: colors.ink0 },
})
