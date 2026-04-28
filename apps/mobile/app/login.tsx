import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '@/lib/auth'

const logo = require('@/assets/images/logo.png')

export default function LoginScreen() {
  const { login } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email.trim() || !password) return
    setError(null)
    setLoading(true)
    try {
      await login(email.trim(), password)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Não foi possível conectar ao servidor.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading

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

          {/* ── Logo ───────────────────────────────────────────────── */}
          <View style={styles.logoWrap}>
            <Image
              source={logo}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* ── Card ───────────────────────────────────────────────── */}
          <View style={styles.card}>

            {/* Error */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="nome@empresa.com"
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

            {/* Password */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Senha</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotLink}>Esqueceu?</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                textContentType="password"
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={handleLogin}
                returnKeyType="go"
                editable={!loading}
              />
            </View>

            {/* Remember me */}
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => setRememberMe((v) => !v)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && (
                  <Ionicons name="checkmark" size={11} color="#fff" />
                )}
              </View>
              <Text style={styles.checkLabel}>Lembrar-me</Text>
            </TouchableOpacity>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={handleLogin}
              disabled={!canSubmit}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Entrar</Text>
                  <Text style={styles.submitBtnArrow}>→</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Register link */}
            <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/register')}>
              <Text style={styles.registerLinkText}>Ainda não tem cadastro? <Text style={styles.registerLinkBold}>Fazer cadastro</Text></Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 48,
  },
  container: {
    width: '100%',
    maxWidth: 384,
  },

  // ── Logo ────────────────────────────────────────────────────────────────────
  logoWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 240,
    height: 96,
  },

  // ── Card ────────────────────────────────────────────────────────────────────
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

  // ── Error ───────────────────────────────────────────────────────────────────
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    lineHeight: 20,
  },

  // ── Fields ──────────────────────────────────────────────────────────────────
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#6B7280',
  },
  forgotLink: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  // ── Checkbox ────────────────────────────────────────────────────────────────
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  checkLabel: {
    fontSize: 14,
    color: '#6B7280',
  },

  // ── Submit button ───────────────────────────────────────────────────────────
  submitBtn: {
    backgroundColor: '#4B5563',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  submitBtnArrow: {
    color: '#FFFFFF',
    fontSize: 14,
  },

  // ── Register link ────────────────────────────────────────────────────────────
  registerLink: {
    alignItems: 'center',
    paddingTop: 4,
  },
  registerLinkText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  registerLinkBold: {
    color: '#374151',
    fontWeight: '700',
  },
})
