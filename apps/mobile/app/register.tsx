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
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { api } from '@/lib/api'

const logo = require('@/assets/images/logo.png')

export default function RegisterScreen() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [membershipNumber, setMembershipNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!email.trim() || !membershipNumber.trim()) return
    setError(null)
    setLoading(true)
    try {
      await api.post('/auth/request-otp', {
        email: email.trim().toLowerCase(),
        membershipNumber: membershipNumber.trim(),
      })
      router.push({ pathname: '/verify-otp', params: { email: email.trim().toLowerCase() } })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Não foi possível conectar ao servidor.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = email.trim().length > 0 && membershipNumber.trim().length > 0 && !loading

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
            <Text style={styles.cardTitle}>Fazer cadastro</Text>
            <Text style={styles.cardSubtitle}>
              Informe seu e-mail e o número do título de associado.
            </Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="nome@email.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Número do título</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 1042"
                placeholderTextColor="#9CA3AF"
                keyboardType="default"
                value={membershipNumber}
                onChangeText={setMembershipNumber}
                onSubmitEditing={handleSubmit}
                returnKeyType="send"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>CONTINUAR</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
              <Text style={styles.loginLinkText}>Já tenho cadastro — Entrar</Text>
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
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  cardSubtitle: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginTop: -8 },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: { fontSize: 14, color: '#B91C1C', lineHeight: 20 },
  fieldGroup: { gap: 6 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#6B7280',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
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
  loginLink: { alignItems: 'center' },
  loginLinkText: { fontSize: 13, color: '#6B7280' },
})
