import { useEffect, useState, useCallback } from 'react'
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
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { api } from '@/lib/api'
import { colors, radii, shadows } from '@/constants/theme'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BookingDetail {
  id: string
  date: string
  status: 'CONFIRMADO' | 'CANCELADO' | 'EXPIRADO'
  createdAt: string
  member: { id: string; name: string; email: string }
  area: { id: string; name: string }
  slot: { id: string; dayOfWeek: string; startTime: string; endTime: string }
}

// ── Static maps ───────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Cancelado',
  EXPIRADO: 'Expirado',
}

const STATUS_BADGE_BG: Record<string, string> = {
  CONFIRMADO: '#F0FDF4',
  CANCELADO: '#FEF2F2',
  EXPIRADO: colors.ink100,
}

const STATUS_BADGE_TEXT: Record<string, string> = {
  CONFIRMADO: '#16A34A',
  CANCELADO: '#DC2626',
  EXPIRADO: colors.ink500,
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── InfoRow ───────────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  label: string
  value: string
}) {
  return (
    <View style={r.infoRow}>
      <View style={r.infoIconWrap}>
        <Ionicons name={icon} size={14} color={colors.ink600} />
      </View>
      <View style={r.infoTexts}>
        <Text style={r.infoLabel}>{label}</Text>
        <Text style={r.infoValue}>{value}</Text>
      </View>
    </View>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    api.get<BookingDetail>(`/bookings/${id}`)
      .then(setBooking)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  function confirmCancel() {
    if (!booking) return
    Alert.alert(
      'Cancelar reserva',
      `Deseja cancelar a reserva da ${booking.area.name} em ${formatDate(booking.date)}?`,
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Cancelar reserva',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true)
            try {
              await api.patch(`/bookings/${id}/status`, { status: 'CANCELADO' })
              setBooking((prev) => prev ? { ...prev, status: 'CANCELADO' } : prev)
            } catch {
              Alert.alert('Erro', 'Não foi possível cancelar a reserva.')
            } finally {
              setCancelling(false)
            }
          },
        },
      ],
    )
  }

  const isConfirmed = booking?.status === 'CONFIRMADO'

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.ink700} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>Detalhes da Reserva</Text>
        <View style={s.headerBtn} />
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.ink900} />
        </View>
      ) : error || !booking ? (
        <View style={s.center}>
          <Ionicons name="cloud-offline-outline" size={36} color={colors.ink300} />
          <Text style={s.errorText}>Não foi possível carregar a reserva</Text>
          <TouchableOpacity style={s.retryBtn} onPress={load}>
            <Text style={s.retryText}>Tentar novamente</Text>
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
              <View style={[
                s.heroIcon,
                { borderColor: STATUS_BADGE_BG[booking.status] ?? colors.ink200 },
              ]}>
                <Ionicons name="receipt-outline" size={32} color={colors.ink700} />
              </View>
              <Text style={s.heroArea}>{booking.area.name}</Text>

              {/* Status badge */}
              <View style={[
                s.statusBadge,
                { backgroundColor: STATUS_BADGE_BG[booking.status] ?? colors.ink100 },
              ]}>
                <View style={[
                  s.statusDot,
                  { backgroundColor: STATUS_BADGE_TEXT[booking.status] ?? colors.ink500 },
                ]} />
                <Text style={[
                  s.statusText,
                  { color: STATUS_BADGE_TEXT[booking.status] ?? colors.ink500 },
                ]}>
                  {STATUS_LABEL[booking.status] ?? booking.status}
                </Text>
              </View>
            </View>

            {/* Info card */}
            <View style={s.infoCard}>
              <InfoRow
                icon="calendar-outline"
                label="Data"
                value={formatDate(booking.date)}
              />
              <View style={s.divider} />
              <InfoRow
                icon="time-outline"
                label="Horário"
                value={`${booking.slot.startTime} – ${booking.slot.endTime}`}
              />
              <View style={s.divider} />
              <InfoRow
                icon="calendar-number-outline"
                label="Dia da semana"
                value={DAY_LABEL[booking.slot.dayOfWeek] ?? booking.slot.dayOfWeek}
              />
            </View>

            {/* Member card */}
            <View style={s.section}>
              <Text style={s.sectionLabel}>Titular da reserva</Text>
              <View style={s.infoCard}>
                <InfoRow
                  icon="person-outline"
                  label="Nome"
                  value={booking.member.name}
                />
                <View style={s.divider} />
                <InfoRow
                  icon="mail-outline"
                  label="E-mail"
                  value={booking.member.email}
                />
              </View>
            </View>

            {/* Metadata */}
            <View style={s.section}>
              <Text style={s.sectionLabel}>Informações da reserva</Text>
              <View style={s.infoCard}>
                <InfoRow
                  icon="finger-print-outline"
                  label="ID"
                  value={booking.id.slice(0, 8).toUpperCase()}
                />
                <View style={s.divider} />
                <InfoRow
                  icon="create-outline"
                  label="Criada em"
                  value={formatDateTime(booking.createdAt)}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={s.footer}>
            {isConfirmed ? (
              <Pressable
                style={({ pressed }) => [s.cancelBtn, (pressed || cancelling) && s.cancelBtnPressed]}
                onPress={confirmCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <ActivityIndicator color="#DC2626" />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                    <Text style={s.cancelBtnText}>Cancelar reserva</Text>
                  </>
                )}
              </Pressable>
            ) : (
              <View style={s.inactiveFooter}>
                <Ionicons
                  name={booking.status === 'CANCELADO' ? 'close-circle-outline' : 'time-outline'}
                  size={16}
                  color={colors.ink500}
                />
                <Text style={s.inactiveText}>
                  {booking.status === 'CANCELADO' ? 'Reserva cancelada' : 'Reserva expirada'}
                </Text>
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

  scroll: { padding: 20, gap: 20, paddingBottom: 16 },

  // Hero
  hero: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    backgroundColor: colors.ink100,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  heroArea: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink900,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 13, fontWeight: '700' },

  // Info card
  infoCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.ink200,
    overflow: 'hidden',
    ...shadows.sm,
  },
  divider: { height: 1, backgroundColor: colors.ink150 },

  section: { gap: 10 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.ink500,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.ink200,
    backgroundColor: colors.ink0,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  cancelBtnPressed: { opacity: 0.75 },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
  inactiveFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.sm,
    backgroundColor: colors.ink100,
    borderWidth: 1,
    borderColor: colors.ink200,
  },
  inactiveText: { fontSize: 15, fontWeight: '600', color: colors.ink500 },

  // Error
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

// ── InfoRow styles (separate to avoid lint warning on unused `r`) ─────────────

const r = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  infoIconWrap: {
    width: 30,
    height: 30,
    borderRadius: radii.xs,
    backgroundColor: colors.ink100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTexts: { flex: 1, gap: 2 },
  infoLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.ink500,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  infoValue: { fontSize: 14, fontWeight: '500', color: colors.ink900 },
})
