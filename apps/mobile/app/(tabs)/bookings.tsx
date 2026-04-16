import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PRIMARY_BUTTON_BG } from '@/constants/theme'
import { api } from '@/lib/api'

interface BookingSummary {
  id: string
  date: string
  status: string
  area: { id: string; name: string }
  slot: { startTime: string; endTime: string }
}

const STATUS_LABEL: Record<string, string> = {
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Cancelado',
  EXPIRADO: 'Expirado',
}

const STATUS_COLOR: Record<string, string> = {
  CONFIRMADO: '#16a34a',
  CANCELADO: '#dc2626',
  EXPIRADO: '#94a3b8',
}

// TODO: substituir pelo memberId do usuário logado
const MOCK_MEMBER_ID = ''

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<BookingSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const query = MOCK_MEMBER_ID ? `?memberId=${MOCK_MEMBER_ID}` : ''
    api.get<BookingSummary[]>(`/bookings${query}`)
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const cancelBooking = async (id: string) => {
    await api.patch(`/bookings/${id}/status`, { status: 'CANCELADO' })
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'CANCELADO' } : b)))
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={PRIMARY_BUTTON_BG} /></View>
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Meus Agendamentos</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.areaName}>{item.area.name}</Text>
              <Text style={[styles.status, { color: STATUS_COLOR[item.status] }]}>
                {STATUS_LABEL[item.status]}
              </Text>
            </View>
            <Text style={styles.dateTime}>
              {new Date(item.date).toLocaleDateString('pt-BR')} · {item.slot.startTime}–{item.slot.endTime}
            </Text>
            {item.status === 'CONFIRMADO' && (
              <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelBooking(item.id)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Você não tem agendamentos</Text>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#1e293b', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  list: { padding: 20, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  areaName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  status: { fontSize: 12, fontWeight: '600' },
  dateTime: { fontSize: 13, color: '#64748b', marginTop: 6 },
  cancelBtn: { marginTop: 12, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#dc2626', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  cancelText: { fontSize: 12, color: '#dc2626', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
})
