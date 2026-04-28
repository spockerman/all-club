import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radii } from '@/constants/theme'

type Props = {
  title: string
  onNotificationPress?: () => void
}

export function ScreenHeader({ title, onNotificationPress }: Props) {
  return (
    <View style={s.header}>
      <Text style={s.title}>{title}</Text>
      <TouchableOpacity
        style={s.bellBtn}
        onPress={onNotificationPress}
        disabled={!onNotificationPress}
        activeOpacity={onNotificationPress ? 0.7 : 1}
      >
        <Ionicons name="notifications-outline" size={22} color={colors.ink700} />
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink200,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink900,
    letterSpacing: -0.3,
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
