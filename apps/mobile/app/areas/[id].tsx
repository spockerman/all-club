import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { api } from '@/lib/api'

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

const DAY_LABEL: Record<string, string> = {
  SEGUNDA: 'Segunda-feira',
  TERCA:   'Terça-feira',
  QUARTA:  'Quarta-feira',
  QUINTA:  'Quinta-feira',
  SEXTA:   'Sexta-feira',
  SABADO:  'Sábado',
  DOMINGO: 'Domingo',
}

const DAY_ORDER: Record<string, number> = {
  SEGUNDA: 0, TERCA: 1, QUARTA: 2, QUINTA: 3,
  SEXTA: 4, SABADO: 5, DOMINGO: 6,
}

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

export default function AreaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [area, setArea] = useState<AreaDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.get<AreaDetail>(`/areas/${id}`)
      .then(setArea)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>
          {area?.name ?? 'Área'}
        </Text>
        <TouchableOpacity
          style={s.headerBtn}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="notifications-outline" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color="#111827" />
        </View>
      ) : error || !area ? (
        <View style={s.center}>
          <Ionicons name="cloud-offline-outline" size={36} color="#D1D5DB" />
          <Text style={s.errorText}>Não foi possível carregar a área</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Icon + name block */}
          <View style={s.hero}>
            <View style={s.heroIcon}>
              <MaterialIcons name="outdoor-grill" size={36} color="#374151" />
            </View>
            <Text style={s.heroName}>{area.name}</Text>
            <View style={s.capacityRow}>
              <Ionicons name="people-outline" size={14} color="#9CA3AF" />
              <Text style={s.capacityText}>{area.capacity} pessoas</Text>
            </View>
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
                <Ionicons name="information-circle-outline" size={15} color="#6B7280" />
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
                          <Ionicons name="time-outline" size={11} color="#6B7280" />
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
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
    textAlign: 'center',
  },

  scroll: { padding: 20, gap: 24, paddingBottom: 40 },

  hero: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: { fontSize: 22, fontWeight: '700', color: '#111827', letterSpacing: -0.3 },
  capacityRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  capacityText: { fontSize: 13, color: '#9CA3AF' },

  section: { gap: 10 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionText: { fontSize: 14, color: '#4B5563', lineHeight: 21 },

  rulesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
  },
  rulesText: { flex: 1, fontSize: 13, color: '#6B7280', lineHeight: 19 },

  scheduleGrid: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  scheduleDay: {
    width: 110,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    paddingTop: 2,
  },
  timesList: { flex: 1, gap: 6 },
  timeChip: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timeText: { fontSize: 13, color: '#6B7280' },

  errorText: { fontSize: 14, color: '#9CA3AF' },
})
