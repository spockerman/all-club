import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native'
import { useState, useRef } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api, ApiError } from '@/lib/api'

const logo = require('@/assets/images/logo.png')

export default function VerifyOtpScreen() {
  const router = useRouter()
  const { email } = useLocalSearchParams<{ email: string }>()

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const inputRef = useRef<TextInput>(null)

  async function handleVerify() {
    if (code.length !== 6) return
    setError(null)
    setLoading(true)
    try {
      const result = await api.post<{ setupToken: string }>('/auth/verify-otp', {
        email,
        code,
      })
      router.replace({ pathname: '/set-password', params: { token: result.setupToken } })
    } catch (e: unknown) {
      const msg =
        e instanceof ApiError
          ? e.message
          : 'Não foi possível conectar ao servidor.'
      setError(msg)
      setCode('')
      inputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!email || resending) return
    setResendMessage(null)
    setError(null)
    setResending(true)
    try {
      // request-otp with the same email; membershipNumber is not needed again
      // (we pass a placeholder — the API silently ignores mismatches for privacy)
      // Actually we need to go back to register to resend properly
      router.back()
    } finally {
      setResending(false)
    }
  }

  const canSubmit = code.length === 6 && !loading

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.logoWrap}>
            <Image source={logo} style={styles.logoImage} resizeMode="contain" />
          </View>

          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name="chatbubble-ellipses-outline" size={40} color="#374151" />
            </View>

            <Text style={styles.cardTitle}>Código enviado</Text>
            <Text style={styles.cardSubtitle}>
              Enviamos um código de 6 dígitos por SMS para o celular cadastrado em{' '}
              <Text style={styles.emailHighlight}>{email}</Text>. Digite o código abaixo.
            </Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {resendMessage && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>{resendMessage}</Text>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Código de 6 dígitos</Text>
              <TextInput
                ref={inputRef}
                style={[styles.codeInput, code.length > 0 && styles.codeInputActive]}
                placeholder="000000"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={(v) => setCode(v.replace(/\D/g, ''))}
                onSubmitEditing={handleVerify}
                returnKeyType="done"
                editable={!loading}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={handleVerify}
              disabled={!canSubmit}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>VERIFICAR</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendLink}
              onPress={handleResend}
              disabled={resending}
            >
              <Text style={styles.resendLinkText}>
                {resending ? 'Voltando…' : 'Não recebi o código — Tentar novamente'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 48,
  },
  container: { width: '100%', maxWidth: 384 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoImage: { width: 240, height: 96 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 32,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconWrap: { alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', textAlign: 'center' },
  cardSubtitle: { fontSize: 13, color: '#6B7280', lineHeight: 20, textAlign: 'center', marginTop: -8 },
  emailHighlight: { color: '#374151', fontWeight: '600' },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: { fontSize: 14, color: '#B91C1C', lineHeight: 20 },
  infoBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoText: { fontSize: 14, color: '#166534', lineHeight: 20 },
  fieldGroup: { gap: 6 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#6B7280',
  },
  codeInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 12,
    textAlign: 'center',
  },
  codeInputActive: {
    borderColor: '#374151',
    backgroundColor: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', letterSpacing: 1.5 },
  resendLink: { alignItems: 'center' },
  resendLinkText: { fontSize: 13, color: '#6B7280' },
})
