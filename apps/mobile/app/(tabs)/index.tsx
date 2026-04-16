import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, sócio!</Text>
        <Text style={styles.subtitle}>Bem-vindo ao All Club</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Acesso rápido</Text>
        <Text style={styles.cardText}>Use a aba Áreas para ver as áreas disponíveis e fazer agendamentos.</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
  cardText: { fontSize: 14, color: '#64748b', lineHeight: 20 },
})
