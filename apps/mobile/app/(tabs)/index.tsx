import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  StatusBar,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useState, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { HomeTopBar } from '@/components/ui/HomeTopBar'

const { width: SCREEN_W } = Dimensions.get('window')
const CAROUSEL_ITEM_W = SCREEN_W - 48
const CAROUSEL_ITEM_H = Math.round(CAROUSEL_ITEM_W * 1.35)
const MEDIA_IMG_H = Math.round((SCREEN_W - 32) * (9 / 16))

// ── Types ──────────────────────────────────────────────────────────────────────
type MarketingMedia = {
  id: string
  title: string
  type: 'NOTICE' | 'MEDIA'
  imageUrl: string
  active: boolean
  createdAt: string
}

type AgendaBooking = {
  id: string
  date: string
  period: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ALL_DAY'
  status: 'AVAILABLE' | 'RESERVED'
  area: { id: string; name: string }
  reservation: { id: string; status: 'CONFIRMED' | 'CANCELLED'; member: { id: string; name: string } } | null
}

const PERIOD_LABEL: Record<string, string> = {
  MORNING: 'Manhã',
  AFTERNOON: 'Tarde',
  EVENING: 'Noite',
  ALL_DAY: 'Dia todo',
}

function formatMediaDate(iso: string) {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  )
}

function formatBookingDate(iso: string) {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' })
  const dateStr = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dateStr}`
}

// ── Fullscreen image viewer ────────────────────────────────────────────────────
function FullscreenViewer({ uri, onClose }: { uri: string; onClose: () => void }) {
  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <StatusBar hidden />
      <View style={fs.root}>
        <Image source={{ uri }} style={fs.image} resizeMode="contain" />
        <TouchableOpacity style={fs.closeBtn} onPress={onClose} hitSlop={16}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

// ── Notice carousel ────────────────────────────────────────────────────────────
function NoticeCarousel({ items }: { items: MarketingMedia[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [viewer, setViewer] = useState<string | null>(null)

  if (items.length === 0) return null

  return (
    <View style={{ marginBottom: 28 }}>
      <View style={s.sectionHead}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="megaphone-outline" size={15} color="#DC2626" />
          <Text style={[s.sectionTitle, { color: '#DC2626' }]}>Avisos</Text>
        </View>
        <Text style={s.sectionMeta}>{items.length} aviso{items.length > 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={items}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CAROUSEL_ITEM_W + 12}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        keyExtractor={(item) => item.id}
        onScroll={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (CAROUSEL_ITEM_W + 12))
          setActiveIndex(Math.max(0, Math.min(idx, items.length - 1)))
        }}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => setViewer(item.imageUrl)}
            style={{ width: CAROUSEL_ITEM_W }}
          >
            <View style={nc.card}>
              <Image
                source={{ uri: item.imageUrl }}
                style={[nc.image, { height: CAROUSEL_ITEM_H }]}
                resizeMode="cover"
              />
              <View style={nc.overlay}>
                <Text style={nc.title} numberOfLines={2}>{item.title}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {items.length > 1 && (
        <View style={nc.dots}>
          {items.map((_, i) => (
            <View
              key={i}
              style={[nc.dot, i === activeIndex ? nc.dotActive : nc.dotInactive]}
            />
          ))}
        </View>
      )}

      {viewer && <FullscreenViewer uri={viewer} onClose={() => setViewer(null)} />}
    </View>
  )
}

// ── Booking highlight ──────────────────────────────────────────────────────────
function BookingHighlight({ bookings }: { bookings: AgendaBooking[] }) {
  const router = useRouter()
  if (bookings.length === 0) return null

  const next = bookings[0]
  const extra = bookings.length - 1

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Meus agendamentos</Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/(tabs)/bookings')}
        style={bk.card}
      >
        <View style={bk.iconCol}>
          <View style={bk.iconBg}>
            <Ionicons name="calendar" size={22} color="#111827" />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={bk.area}>{next.area.name}</Text>
          <Text style={bk.date}>{formatBookingDate(next.date)}</Text>
          <Text style={bk.time}>{PERIOD_LABEL[next.period]}</Text>
          {extra > 0 && (
            <Text style={bk.extra}>
              + {extra} outro{extra > 1 ? 's' : ''} agendamento{extra > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <View style={bk.badge}>
          <Text style={bk.badgeText}>CONFIRMADO</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

// ── Media feed card ────────────────────────────────────────────────────────────
function MediaCard({ item }: { item: MarketingMedia }) {
  const [viewer, setViewer] = useState(false)
  return (
    <>
      <TouchableOpacity activeOpacity={0.9} onPress={() => setViewer(true)} style={mc.wrap}>
        <Image
          source={{ uri: item.imageUrl }}
          style={[mc.image, { height: MEDIA_IMG_H }]}
          resizeMode="cover"
        />
        <View style={mc.body}>
          <Text style={mc.caption}>{item.title}</Text>
          <View style={mc.footer}>
            <Ionicons name="time-outline" size={11} color="#9CA3AF" />
            <Text style={mc.date}>{formatMediaDate(item.createdAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
      {viewer && <FullscreenViewer uri={item.imageUrl} onClose={() => setViewer(false)} />}
    </>
  )
}

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuth()

  const [notices, setNotices] = useState<MarketingMedia[]>([])
  const [media, setMedia] = useState<MarketingMedia[]>([])
  const [bookings, setBookings] = useState<AgendaBooking[]>([])
  const [loading, setLoading] = useState(true)

  const firstName = user?.name?.split(' ')[0] ?? 'Sócio'

  const loadBookings = useCallback(() => {
    if (!user?.memberId) { setBookings([]); return }
    const todayStr = new Date().toISOString().split('T')[0]
    api.get<AgendaBooking[]>(`/agendas?memberId=${user.memberId}&dateFrom=${todayStr}`)
      .then((bks) => {
        const upcoming = bks
          .filter((b) => b.reservation?.status === 'CONFIRMED')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        setBookings(upcoming)
      })
      .catch(() => setBookings([]))
  }, [user?.memberId])

  // Marketing: carrega uma vez
  useEffect(() => {
    api.get<MarketingMedia[]>('/marketing/active')
      .then((mkt) => {
        setNotices(mkt.filter((m) => m.type === 'NOTICE'))
        setMedia(mkt.filter((m) => m.type === 'MEDIA'))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Agendamentos: atualiza ao ganhar foco (cobre volta da tela de agenda)
  useFocusEffect(useCallback(() => { loadBookings() }, [loadBookings]))

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <HomeTopBar name={firstName} />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 48 }} color="#6B7280" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* 1 — Agendamentos em destaque */}
          <BookingHighlight bookings={bookings} />

          {/* 2 — Avisos (carrossel) */}
          <NoticeCarousel items={notices} />

          {/* 3 — Mídias (feed vertical) */}
          {media.length > 0 && (
            <View>
              <View style={s.sectionHead}>
                <Text style={s.sectionTitle}>Novidades</Text>
                <Text style={s.sectionMeta}>Canal do clube</Text>
              </View>
              <View style={{ gap: 12 }}>
                {media.map((item) => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </View>
            </View>
          )}

          {notices.length === 0 && media.length === 0 && bookings.length === 0 && (
            <View style={s.empty}>
              <Ionicons name="newspaper-outline" size={36} color="#D1D5DB" />
              <Text style={s.emptyText}>Nenhuma novidade disponível</Text>
            </View>
          )}

          <View style={s.footer}>
            <Text style={s.footerText}>Centro Avareense · Canal oficial</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

// ── Fullscreen styles ──────────────────────────────────────────────────────────
const fs = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

// ── Notice carousel styles ─────────────────────────────────────────────────────
const nc = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 18,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
    backgroundColor: '#111827',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#D1D5DB',
  },
})

// ── Booking highlight styles ───────────────────────────────────────────────────
const bk = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCol: {
    paddingTop: 2,
  },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  area: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 1,
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
  },
  extra: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#166534',
    letterSpacing: 0.5,
  },
})

// ── Media card styles ──────────────────────────────────────────────────────────
const mc = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    backgroundColor: '#F3F4F6',
  },
  body: {
    padding: 14,
    gap: 8,
  },
  caption: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 11,
    color: '#9CA3AF',
    letterSpacing: 0.3,
    fontVariant: ['tabular-nums'],
  },
})

// ── Screen styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    paddingTop: 20,
    paddingBottom: 32,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
  },
  sectionMeta: {
    fontSize: 11,
    color: '#9CA3AF',
    letterSpacing: 0.3,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 56,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 28,
    marginTop: 12,
  },
  footerText: {
    fontSize: 10,
    color: '#D1D5DB',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
})
