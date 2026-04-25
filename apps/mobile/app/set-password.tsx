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
  Alert,
} from 'react-native'
import { useState, useEffect } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export default function SetPasswordScreen() {
  const router = useRouter()
  const { token } = useLocalSearchParams<{ token: string }>()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      Alert.alert('Link inválido', 'O link de ativação não contém um token válido.')
    }
  }, [token])

  async function handleSubmit() {
    setError(null)

    if (!PASSWORD_POLICY.test(password)) {
      setError('Senha deve ter mínimo 8 caracteres, com ao menos 1 maiúscula, 1 minúscula e 1 número.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword: password })
      Alert.alert('Senha criada!', 'Sua senha foi criada com sucesso. Faça login para continuar.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Não foi possível criar a senha.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = password.length > 0 && confirm.length > 0 && !!token && !loading

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
          <View style={styles.header}>
            <Text style={styles.title}>Criar senha</Text>
            <Text style={styles.subtitle}>Defina sua senha para acessar o aplicativo.</Text>
          </View>

          <View style={styles.card}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Nova senha */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nova senha</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={16}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>Mín. 8 caracteres, com maiúscula, minúscula e número.</Text>
            </View>

            {/* Confirmar senha */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmar senha</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirm}
                  value={confirm}
                  onChangeText={setConfirm}
                  onSubmitEditing={handleSubmit}
                  returnKeyType="done"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirm((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={16}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
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
                <Text style={styles.submitBtnText}>CONFIRMAR SENHA</Text>
              )}
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
  header: { marginBottom: 24, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
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
  hint: { fontSize: 11, color: '#9CA3AF' },
  inputRow: { position: 'relative' },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  inputWithIcon: { paddingRight: 42 },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  submitBtn: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
})
