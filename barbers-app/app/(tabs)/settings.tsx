import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Modal } from 'react-native'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import { useAppTheme } from '@/context/ThemeContext'

export default function SettingsScreen() {
  const { theme, colors, toggleTheme, pushEnabled, togglePush } = useAppTheme()

  const [profileName, setProfileName] = useState('Carregando...')
  const [profileEmail, setProfileEmail] = useState('...')
  const [planName, setPlanName] = useState('Básico')
  const [planStatus, setPlanStatus] = useState('active')
  const [showSubModal, setShowSubModal] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setIsAdmin(true)
      return
    }

    setProfileEmail(userData.user.email || 'Sem e-mail')

    const { data: shops } = await supabase
      .from('barbershops')
      .select('name, plan, plan_status')
      .eq('owner_id', userData.user.id)
      .limit(1)
    
    const shop = shops?.[0]
    if (shop) {
      setProfileName(shop.name)
      setPlanName(shop.plan)
      setPlanStatus(shop.plan_status)
      setIsAdmin(true)
    } else {
      setProfileName('Barbeiro Pro')
      setIsAdmin(true)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/(auth)/login')
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      
      {/* Remove absolute gradient if in light mode, or adapt it */}
      {theme === 'dark' && (
        <LinearGradient colors={['#050505', '#111']} style={StyleSheet.absoluteFillObject} />
      )}

      <Animated.View entering={FadeInDown.duration(600)} style={styles.profileHeader}>
        <View style={[styles.avatar, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Ionicons name="person" size={40} color={colors.text} />
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>{profileName}</Text>
        <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{profileEmail}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferências</Text>
        
        <View style={[styles.listItem, { backgroundColor: colors.card, borderBottomColor: colors.border, borderTopLeftRadius: 16, borderTopRightRadius: 16 }]}>
          <View style={styles.listItemLeft}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="notifications-outline" size={20} color="#3b82f6" />
            </View>
            <Text style={[styles.listItemText, { color: colors.text }]}>Notificações Push</Text>
          </View>
          <Switch 
            value={pushEnabled} 
            onValueChange={togglePush} 
            trackColor={{ false: '#767577', true: '#34d399' }}
          />
        </View>

        <TouchableOpacity 
          style={[styles.listItem, { backgroundColor: colors.card, borderBottomColor: colors.border, borderBottomWidth: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }]}
          onPress={toggleTheme}
        >
          <View style={styles.listItemLeft}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name={theme === 'dark' ? "moon-outline" : "sunny-outline"} size={20} color="#10b981" />
            </View>
            <Text style={[styles.listItemText, { color: colors.text }]}>Tema do App</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.listItemValue, { color: colors.textSecondary }]}>{theme === 'dark' ? 'Escuro' : 'Claro'}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ marginLeft: 8 }} />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {isAdmin && (
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Administração</Text>
          
          <TouchableOpacity 
            style={[styles.listItem, { backgroundColor: colors.card, borderBottomWidth: 0, borderRadius: 16 }]}
            onPress={() => router.push('/admin')}
          >
            <View style={styles.listItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
                <Ionicons name="bar-chart-outline" size={20} color={colors.text} />
              </View>
              <Text style={[styles.listItemText, { color: colors.text }]}>Painel Administrativo</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.listItemValue, { color: colors.textSecondary }]}>Visualizar Métricas</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ marginLeft: 8 }} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Conta</Text>

        <TouchableOpacity 
          style={[styles.listItem, { backgroundColor: colors.card, borderBottomColor: colors.border, borderTopLeftRadius: 16, borderTopRightRadius: 16 }]}
          onPress={() => setShowSubModal(true)}
        >
          <View style={styles.listItemLeft}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Ionicons name="card-outline" size={20} color="#f59e0b" />
            </View>
            <Text style={[styles.listItemText, { color: colors.text }]}>Assinatura BarberSuite</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {planStatus === 'active' && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#34d399', marginRight: 8 }} />}
            <Text style={[styles.listItemValue, { color: colors.textSecondary, textTransform: 'capitalize' }]}>{planName}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ marginLeft: 8 }} />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.listItem, { backgroundColor: colors.card, borderBottomWidth: 0, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }]} onPress={handleLogout}>
          <View style={styles.listItemLeft}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            </View>
            <Text style={[styles.listItemText, { color: '#ef4444' }]}>Sair da Conta</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Subscription Modal */}
      <Modal visible={showSubModal} animationType="fade" transparent={true} onRequestClose={() => setShowSubModal(false)}>
        <BlurView intensity={theme === 'dark' ? 40 : 20} tint={theme === 'dark' ? "dark" : "light"} style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowSubModal(false)} activeOpacity={1} />
          
          <Animated.View entering={SlideInDown.springify().damping(20).stiffness(100)} style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalDragIndicator, { backgroundColor: colors.border }]} />
            
            <View style={styles.modalHeader}>
               <Ionicons name="diamond-outline" size={60} color="#f59e0b" style={{ marginBottom: 16 }} />
               <Text style={[styles.modalTitle, { color: colors.text }]}>Plano {planName.toUpperCase()}</Text>
               <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Status: <Text style={{ color: planStatus === 'active' ? '#34d399' : '#ef4444', fontWeight: 'bold' }}>{planStatus.toUpperCase()}</Text></Text>
            </View>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}><Ionicons name="checkmark-circle" size={20} color="#34d399" style={{ marginRight: 8 }}/><Text style={{ color: colors.text }}>Agendamento Ilimitado</Text></View>
              <View style={styles.featureItem}><Ionicons name="checkmark-circle" size={20} color="#34d399" style={{ marginRight: 8 }}/><Text style={{ color: colors.text }}>Gestão de Equipe (Barbeiros)</Text></View>
              <View style={styles.featureItem}><Ionicons name="checkmark-circle" size={20} color="#34d399" style={{ marginRight: 8 }}/><Text style={{ color: colors.text }}>Notificações Push / Realtime</Text></View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowSubModal(false)}>
              <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.closeBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.closeBtnText}>Fechar Painel</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </BlurView>
      </Modal>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 100,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemValue: {
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
  modalTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  featuresList: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 'auto',
  },
  closeBtnGradient: {
    padding: 16,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
})
