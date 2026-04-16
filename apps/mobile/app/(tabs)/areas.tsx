import { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { PRIMARY_BUTTON_BG } from '@/constants/theme'
import { api } from '@/lib/api'
import type { Area } from '@all-club/shared'

interface AreaWithSlots extends Area {
  availabilitySlots: { id: string; dayOfWeek: string; startTime: string; endTime: string }[]
}

export default function AreasScreen() {
  const [areas, setAreas] = useState<AreaWithSlots[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    api.get<AreaWithSlots[]>('/areas')
      .then(setAreas)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={PRIMARY_BUTTON_BG} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Áreas Comuns</Text>
      <FlatList
        data={areas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/bookings/new', params: { areaId: item.id, areaName: item.name } })}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            {item.description && <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>}
            <View style={styles.meta}>
              <Text style={styles.metaText}>Cap.: {item.capacity} pessoas</Text>
              <Text style={styles.metaText}>{item.availabilitySlots.length} horários</Text>
            </View>
            <Text style={styles.action}>Agendar →</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma área disponível</Text>
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
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  cardDesc: { fontSize: 13, color: '#64748b', marginTop: 4 },
  meta: { flexDirection: 'row', gap: 16, marginTop: 10 },
  metaText: { fontSize: 12, color: '#94a3b8' },
  action: { marginTop: 10, fontSize: 13, fontWeight: '600', color: PRIMARY_BUTTON_BG },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
})
