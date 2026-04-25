import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useContext, useEffect, useState, useCallback } from 'react'
import { View, ActivityIndicator } from 'react-native'
import {
  AuthContext,
  AuthUser,
  loadStoredAuth,
  persistAuth,
  clearAuth,
  tryRefresh,
} from '@/lib/auth'
import { setUnauthorizedHandler, resetRedirectingFlag } from '@/lib/api'
import { colors } from '@/constants/theme'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ token: string | null; user: AuthUser | null }>({
    token: null,
    user: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStoredAuth().then((stored) => {
      setState(stored)
      setLoading(false)
    })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Erro ao autenticar.')
    await persistAuth(data.accessToken, data.user, data.refreshToken)
    setState({ token: data.accessToken, user: data.user })
  }, [])

  const logout = useCallback(async () => {
    await clearAuth()
    setState({ token: null, user: null })
  }, [])

  const refresh = useCallback(async (): Promise<boolean> => {
    const result = await tryRefresh()
    if (result) {
      setState({ token: result.token, user: result.user })
      return true
    }
    return false
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const ctx = useContext(AuthContext)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!ctx || ctx.loading) return
    setUnauthorizedHandler(async () => {
      const ok = await ctx.refresh()
      if (ok) {
        resetRedirectingFlag()
      } else {
        await ctx.logout()
        router.replace('/login')
      }
    })
  }, [ctx?.loading])

  useEffect(() => {
    if (!ctx || ctx.loading) return
    const publicScreens = ['login', 'register', 'set-password']
    const onPublicScreen = publicScreens.includes(segments[0] as string)
    if (!ctx.token && !onPublicScreen) {
      router.replace('/login')
    } else if (ctx.token && onPublicScreen) {
      router.replace('/(tabs)')
    }
  }, [ctx?.token, ctx?.loading, segments])

  if (ctx?.loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink100, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.ink700} />
      </View>
    )
  }

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AuthGuard>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="set-password" options={{ headerShown: false }} />
          <Stack.Screen name="bookings/new" options={{ headerShown: false }} />
          <Stack.Screen name="bookings/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="areas/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="agenda/[id]" options={{ headerShown: false }} />
        </Stack>
      </AuthGuard>
    </AuthProvider>
  )
}
