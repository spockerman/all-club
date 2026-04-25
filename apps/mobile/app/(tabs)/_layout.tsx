import { Tabs } from 'expo-router'
import { TabIcon } from '@/components/navigation/TabIcon'
import { AgendaTabIcon } from '@/components/navigation/AgendaTabIcon'
import {
  TAB_BAR_STYLE,
  TAB_BAR_LABEL_STYLE,
  TAB_ACTIVE_TINT,
  TAB_INACTIVE_TINT,
} from '@/components/navigation/tab-bar.config'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TAB_ACTIVE_TINT,
        tabBarInactiveTintColor: TAB_INACTIVE_TINT,
        tabBarLabelStyle: TAB_BAR_LABEL_STYLE,
        tabBarStyle: TAB_BAR_STYLE,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="areas"
        options={{
          title: 'Áreas',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ focused }) => <AgendaTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="receipt-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}
