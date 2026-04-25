import { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { AreaCard, type AreaSummary } from '@/components/areas/AreaCard'

export default function AreasScreen() {
  const [areas, setAreas] = useState<AreaSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<'auth' | 'network' | null>(null)
  const [query, setQuery] = useState('')
  const router = useRouter()
  const { logout } = useAuth()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return areas
    return areas.filter((a) => a.name.toLowerCase().includes(q))
  }, [areas, query])

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api.get<AreaSummary[]>('/areas')
      .then(setAreas)
      .catch((e) => setError(e instanceof ApiError && e.status === 401 ? 'auth' : 'network'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Áreas Comuns</Text>
        <TouchableOpacity
          style={s.notifBtn}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="notifications-outline" size={22} color="#374151" />
        </TouchableOpacity>
      </View>

      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={16} color="#9CA3AF" style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar área..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color="#111827" />
        </View>
      ) : error === 'auth' ? (
        <View style={s.center}>
          <Ionicons name="lock-closed-outline" size={36} color="#D1D5DB" />
          <Text style={s.message}>Sessão expirada</Text>
          <TouchableOpacity style={s.retryBtn} onPress={async () => { await logout(); router.replace('/login') }}>
            <Text style={s.retryText}>Fazer login novamente</Text>
          </TouchableOpacity>
        </View>
      ) : error === 'network' ? (
        <View style={s.center}>
          <Ionicons name="cloud-offline-outline" size={36} color="#D1D5DB" />
          <Text style={s.message}>Não foi possível carregar as áreas</Text>
          <TouchableOpacity style={s.retryBtn} onPress={load}>
            <Text style={s.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <AreaCard item={item} onPress={(id) => router.push(`/areas/${id}` as never)} />
          )}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={s.message}>
                {query.trim() ? 'Nenhuma área encontrada' : 'Nenhuma área cadastrada'}
              </Text>
            </View>
          }
        />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827', letterSpacing: -0.3 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },

  list: { padding: 16, gap: 10, paddingBottom: 32 },
  message: { fontSize: 14, color: '#9CA3AF' },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#111827',
    borderRadius: 8,
  },
  retryText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
})
