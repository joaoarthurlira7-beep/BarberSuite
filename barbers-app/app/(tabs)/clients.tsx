import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated'
import { supabase } from '@/lib/supabase'
import { useAppTheme } from '@/context/ThemeContext'

interface Client {
  id: string
  name: string
  phone: string
  lastVisit: string
  totalVisits: number
  color: string
}

const PASTEL_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6']

export default function ClientsScreen() {
  const { theme, colors } = useAppTheme()
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: shops } = await supabase
        .from('barbershops')
        .select('id')
        .eq('owner_id', userData.user.id)
        .limit(1)
      
      const shop = shops?.[0]
      if (!shop) return

      const { data: appts } = await supabase
        .from('appointments')
        .select('client_name, client_phone, scheduled_at')
        .eq('barbershop_id', shop.id)
        .order('scheduled_at', { ascending: false })

      if (appts) {
        const clientMap = new Map<string, Client>()
        
        appts.forEach((appt) => {
          const phone = appt.client_phone || 'Sem Telefone'
          if (!clientMap.has(phone)) {
            const randomColor = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)]
            clientMap.set(phone, {
              id: phone,
              name: appt.client_name,
              phone: phone,
              lastVisit: new Date(appt.scheduled_at).toLocaleDateString(),
              totalVisits: 1,
              color: randomColor
            })
          } else {
            const existing = clientMap.get(phone)!
            existing.totalVisits += 1
            clientMap.set(phone, existing)
          }
        })

        setClients(Array.from(clientMap.values()))
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  )

  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {theme === 'dark' && (
        <LinearGradient colors={['#050505', '#111']} style={StyleSheet.absoluteFillObject} />
      )}

      <View style={styles.header}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar cliente..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Nenhum cliente encontrado.</Text>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
            <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setSelectedClient(item)} activeOpacity={0.7}>
              <View style={[styles.cardAvatar, { backgroundColor: item.color + '33' }]}>
                <Text style={[styles.avatarText, { color: item.color }]}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.clientName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.clientPhone, { color: colors.textSecondary }]}>{item.phone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </Animated.View>
        )}
      />

      <Modal
        visible={!!selectedClient}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedClient(null)}
      >
        <BlurView intensity={theme === 'dark' ? 40 : 20} tint={theme === 'dark' ? "dark" : "light"} style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setSelectedClient(null)} activeOpacity={1} />
          
          <Animated.View entering={SlideInDown.springify().damping(20).stiffness(100)} style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {selectedClient && (
              <>
                <View style={[styles.modalDragIndicator, { backgroundColor: colors.border }]} />
                
                <View style={styles.modalHeader}>
                  <View style={[styles.modalAvatar, { backgroundColor: selectedClient.color + '22' }]}>
                    <Text style={[styles.modalAvatarText, { color: selectedClient.color }]}>{selectedClient.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.modalName, { color: colors.text }]}>{selectedClient.name}</Text>
                  <Text style={[styles.modalPhone, { color: colors.textSecondary }]}>{selectedClient.phone}</Text>
                </View>
                
                <View style={styles.statsContainer}>
                  <View style={[styles.statBox, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
                    <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={{ marginBottom: 8 }} />
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Última Visita</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>{selectedClient.lastVisit}</Text>
                  </View>
                  <View style={[styles.statBox, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
                    <Ionicons name="cut-outline" size={20} color={colors.textSecondary} style={{ marginBottom: 8 }} />
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Visitas</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>{selectedClient.totalVisits}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.closeBtn} 
                  onPress={() => setSelectedClient(null)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#ffffff', '#e0e0e0']}
                    style={styles.closeBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.closeBtnText}>Fechar Perfil</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </BlurView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    paddingTop: 100,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: 450,
    borderTopWidth: 1,
  },
  modalDragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAvatarText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  modalName: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  modalPhone: {
    fontSize: 16,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  closeBtnGradient: {
    padding: 16,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#000',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
})
