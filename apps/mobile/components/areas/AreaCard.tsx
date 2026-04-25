import { useState } from 'react'
import { Pressable, View, Text, StyleSheet } from 'react-native'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'

export type AreaSummary = {
  id: string
  name: string
  capacity: number
  description?: string
}

type Props = {
  item: AreaSummary
  onPress: (id: string) => void
}

export function AreaCard({ item, onPress }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <Pressable
      style={({ pressed }) => [s.card, (hovered || pressed) && s.cardActive]}
      onPress={() => onPress(item.id)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      android_ripple={{ color: '#374151' }}
    >
      {({ pressed }) => {
        const active = hovered || pressed
        return (
          <>
            <View style={[s.iconWrap, active && s.iconWrapActive]}>
              <MaterialIcons
                name="outdoor-grill"
                size={24}
                color={active ? '#FFFFFF' : '#374151'}
              />
            </View>

            <View style={s.info}>
              <Text style={[s.name, active && s.textActive]}>{item.name}</Text>
              <View style={s.capacityRow}>
                <Ionicons
                  name="people-outline"
                  size={12}
                  color={active ? '#D1D5DB' : '#9CA3AF'}
                />
                <Text style={[s.capacity, active && s.capacityActive]}>
                  {item.capacity} pessoas
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={16}
              color={active ? '#9CA3AF' : '#D1D5DB'}
            />
          </>
        )
      }}
    </Pressable>
  )
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 12,
  },
  cardActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },

  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#374151',
  },

  info: { flex: 1, gap: 4 },

  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  textActive: {
    color: '#FFFFFF',
  },

  capacityRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  capacity: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  capacityActive: {
    color: '#D1D5DB',
  },
})
