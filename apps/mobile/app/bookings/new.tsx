import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { PRIMARY_BUTTON_BG } from '@/constants/theme'
import { api } from '@/lib/api'

interface Slot {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  available: boolean
}

interface Availability {
  blocked: boolean
  reason?: string
  slots: Slot[]
}

// TODO: substituir pelo memberId do usuário logado
const MOCK_MEMBER_ID = 'MEMBER_ID_PLACEHOLDER'

export default function NewBookingScreen() {
  const { areaId, areaName } = useLocalSearchParams<{ areaId: string; areaName: string }>()
  const router = useRouter()

  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!areaId) return
    setLoading(true)
    api.get<Availability>(`/areas/${areaId}/availability?date=${selectedDate}`)
      .then(setAvailability)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [areaId, selectedDate])

  const book = async (slot: Slot) => {
    if (!slot.available) return
    setSubmitting(true)
    try {
      await api.post(`/bookings?memberId=${MOCK_MEMBER_ID}`, {
        areaId,
        slotId: slot.id,
        date: selectedDate,
      })
      Alert.alert('Agendado!', `${areaName} reservado para ${slot.startTime}–${slot.endTime}`, [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao agendar'
      Alert.alert('Erro', message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{areaName}</Text>
      <Text style={styles.subtitle}>Selecione um horário disponível</Text>

      {/* Date picker simples — próximos 7 dias */}
      <FlatList
        horizontal
        data={Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() + i)
          return d.toISOString().split('T')[0]
        })}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.dateList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.dateChip, item === selectedDate && styles.dateChipActive]}
            onPress={() => setSelectedDate(item)}
          >
            <Text style={[styles.dateChipText, item === selectedDate && styles.dateChipTextActive]}>
              {new Date(item + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={PRIMARY_BUTTON_BG} style={{ marginTop: 40 }} />
      ) : availability?.blocked ? (
        <Text style={styles.blocked}>Área bloqueada: {availability.reason ?? 'indisponível'}</Text>
      ) : (
        <FlatList
          data={availability?.slots ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.slotList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.slot, !item.available && styles.slotUnavailable]}
              onPress={() => book(item)}
              disabled={!item.available || submitting}
            >
              <Text style={[styles.slotTime, !item.available && styles.slotTimeUnavailable]}>
                {item.startTime} – {item.endTime}
              </Text>
              <Text style={[styles.slotStatus, { color: item.available ? '#16a34a' : '#dc2626' }]}>
                {item.available ? 'Disponível' : 'Ocupado'}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Sem horários para este dia</Text>}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  title: { fontSize: 20, fontWeight: '700', color: '#1e293b', paddingHorizontal: 20, paddingTop: 16 },
  subtitle: { fontSize: 13, color: '#64748b', paddingHorizontal: 20, marginTop: 4, marginBottom: 12 },
  dateList: { paddingHorizontal: 20, gap: 8, paddingBottom: 12 },
  dateChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0' },
  dateChipActive: { backgroundColor: PRIMARY_BUTTON_BG },
  dateChipText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  dateChipTextActive: { color: '#fff' },
  slotList: { padding: 20, gap: 10 },
  slot: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  slotUnavailable: { opacity: 0.5 },
  slotTime: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  slotTimeUnavailable: { color: '#94a3b8' },
  slotStatus: { fontSize: 12, fontWeight: '600' },
  blocked: { textAlign: 'center', color: '#dc2626', marginTop: 40, paddingHorizontal: 20 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
})
