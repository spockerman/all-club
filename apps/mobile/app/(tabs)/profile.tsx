import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>
      <View style={styles.card}>
        <Text style={styles.placeholder}>
          Autenticação via Supabase Auth será integrada aqui.{'\n'}
          Login com e-mail/senha ou magic link.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  placeholder: { fontSize: 14, color: '#64748b', lineHeight: 22 },
})
