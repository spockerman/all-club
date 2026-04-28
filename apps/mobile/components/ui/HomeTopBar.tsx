import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radii } from '@/constants/theme'

const bandIcon = require('@/assets/images/band.png')

type Props = {
  name: string
}

export function HomeTopBar({ name }: Props) {
  return (
    <View style={s.topBar}>
      <Image source={bandIcon} style={s.bandIcon} resizeMode="contain" />
      <Text style={s.greetName}>Olá, {name}</Text>
      <TouchableOpacity style={s.bellBtn} disabled activeOpacity={1}>
        <Ionicons name="notifications-outline" size={22} color={colors.ink700} />
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.ink0,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink200,
  },
  bandIcon: {
    width: 36,
    height: 36,
  },
  greetName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink900,
    letterSpacing: -0.2,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.xl,
    backgroundColor: colors.ink100,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
