import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  focused: boolean
}

const CIRCLE = 52

// O wrapper expõe apenas metade da altura para o React Navigation,
// mantendo o label alinhado com os demais tabs. O círculo flutua
// para cima via position absolute + bottom:0 + overflow visible.
export function AgendaTabIcon({ focused }: Props) {
  return (
    <View
      style={{
        width: CIRCLE,
        height: CIRCLE / 2,
        overflow: 'visible',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: CIRCLE,
          height: CIRCLE,
          borderRadius: CIRCLE / 2,
          backgroundColor: focused ? '#FFFFFF' : '#374151',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#111827',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.28,
          shadowRadius: 10,
          elevation: 10,
          marginBottom: 5,
        }}
      >
        <Ionicons
          name={focused ? 'calendar-outline' : 'calendar'}
          size={26}
          color={focused ? '#000000' : '#FFFFFF'}
        />
      </View>
    </View>
  )
}
