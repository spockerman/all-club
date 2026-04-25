import type { TextStyle, ViewStyle } from 'react-native'

export const TAB_BAR_STYLE: ViewStyle = {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
  borderTopWidth: 0,
  overflow: 'visible',
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 20,
}

export const TAB_BAR_LABEL_STYLE: TextStyle = {
  fontSize: 10,
  fontWeight: '600',
  letterSpacing: 0.4,
  textTransform: 'uppercase',
}

export const TAB_ACTIVE_TINT = '#111827'
export const TAB_INACTIVE_TINT = '#9CA3AF'
