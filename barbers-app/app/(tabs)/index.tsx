import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import * as Notifications from 'expo-notifications'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useAppTheme } from '@/context/ThemeContext'

// --- Types ---
interface Barber {
  id: string
  name: string
  photo_url: string | null
}

interface Appointment {
  id: string
  barber_id: string
  client_name: string
  client_phone: string
  scheduled_at: string
  duration_min: number
  status: string
  payment_status: string
  source: string
  services?: {
    name: string
    price: number
  } | null
}

const HOUR_HEIGHT = 80 // pixels per hour
const COL_WIDTH = 140
const START_HOUR = 8

const timeSlots = Array.from({ length: 22 }, (_, i) => {
  const hr = START_HOUR + Math.floor(i / 2)
  const min = i % 2 === 0 ? '00' : '30'
  return `${hr.toString().padStart(2, '0')}:${min}`
})

export default function ScheduleGridScreen() {
  const { theme, colors, pushEnabled } = useAppTheme()
  const [loading, setLoading] = useState(true)
  const [barbershopId, setBarbershopId] = useState<string | null>(null)
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (!barbershopId) return

    Notifications.setNotificationHandler({
      handleNotification: async (): Promise<any> => ({
        shouldShowAlert: pushEnabled,
        shouldPlaySound: pushEnabled,
        shouldSetBadge: false,
      }),
    })

    const channel = supabase
      .channel('realtime_appointments')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'appointments',
        filter: `barbershop_id=eq.${barbershopId}`
      }, (payload) => {
        const newAppt = payload.new as Appointment
        
        if (pushEnabled) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: '📅 Novo Agendamento!',
              body: `${newAppt.client_name} agendou um horário.`,
              sound: true,
            },
            trigger: null,
          })
        }
        
        // Refresh to get the JOIN data (services)
        fetchAppointments(barbershopId)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [barbershopId, pushEnabled])

  const fetchInitialData = async () => {
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
      setBarbershopId(shop.id)

      const { data: barbersData } = await supabase
        .from('barbers')
        .select('id, name, photo_url')
        .eq('barbershop_id', shop.id)
      
      if (barbersData) setBarbers(barbersData)

      await fetchAppointments(shop.id)
    } catch (error) {
      console.error(error)
      Alert.alert('Erro', 'Não foi possível carregar os dados.')
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointments = async (shopId: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: apptData, error } = await supabase
      .from('appointments')
      .select('*, services(name, price)')
      .eq('barbershop_id', shopId)
      .gte('scheduled_at', today.toISOString())
      .lt('scheduled_at', tomorrow.toISOString())

    if (error) console.error('Fetch appts error:', error)
    if (apptData) setAppointments(apptData as any)
  }

  const getEventPosition = (dateStr: string, duration: number) => {
    const d = new Date(dateStr)
    const hours = d.getHours()
    const minutes = d.getMinutes()
    const top = ((hours - START_HOUR) + (minutes / 60)) * HOUR_HEIGHT
    const height = (duration / 60) * HOUR_HEIGHT
    return { top, height }
  }

  const handlePayment = async (appt: Appointment) => {
    // Simulando o processo de Checkout do Stripe (Para UX)
    Alert.alert(
      'Cobrança via Stripe', 
      `Iniciando a cobrança de R$ ${appt.services?.price?.toFixed(2)} para ${appt.client_name}...\n(Modo Sandbox)`,
      [
        {
          text: 'Simular Pagamento Aprovado',
          onPress: async () => {
            setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, payment_status: 'paid' } : a))
            await supabase.from('appointments').update({ payment_status: 'paid' }).eq('id', appt.id)
            Alert.alert('Sucesso!', 'Pagamento processado e faturado via Stripe com sucesso.')
          }
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    )
  }

  const handleApptPress = (appt: Appointment) => {
    const options: any[] = []
    
    if (appt.status === 'pending') {
      options.push({ text: 'Iniciar Corte', onPress: async () => {
        setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'in_progress' } : a))
        await supabase.from('appointments').update({ status: 'in_progress' }).eq('id', appt.id)
      }})
    } else if (appt.status === 'in_progress') {
      options.push({ text: 'Concluir Corte', onPress: async () => {
        setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'completed' } : a))
        await supabase.from('appointments').update({ status: 'completed' }).eq('id', appt.id)
      }})
    }

    if (appt.payment_status === 'pending') {
      // Nova Opção de Cobrança (Stripe)
      if (appt.services && appt.services.price > 0) {
        options.push({ text: '💳 Cobrar no App (Stripe)', onPress: () => handlePayment(appt) })
      }
      
      options.push({ text: 'Marcar Dinheiro/Pix Recebido', onPress: async () => {
        setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, payment_status: 'paid' } : a))
        await supabase.from('appointments').update({ payment_status: 'paid' }).eq('id', appt.id)
      }})
    }

    options.push({ text: 'Voltar', style: 'cancel' })

    Alert.alert('Gerenciar Atendimento', `Cliente: ${appt.client_name}`, options)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return { bg: '#34d39933', border: '#34d399', text: '#34d399' }
      case 'in_progress': return { bg: '#60a5fa33', border: '#60a5fa', text: '#60a5fa' }
      default: return { bg: '#fbbf2433', border: '#fbbf24', text: '#fbbf24' }
    }
  }

  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerRow, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <View style={[styles.timeColHeader, { borderRightColor: colors.border }]}>
          <Ionicons name="calendar-outline" size={24} color={colors.textSecondary} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.barbersScroll}>
          {barbers.map(barber => (
            <View key={barber.id} style={[styles.barberHeaderCard, { borderRightColor: colors.border }]}>
              <View style={[styles.avatar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.avatarText, { color: colors.text }]}>{barber.name.charAt(0)}</Text>
              </View>
              <Text style={[styles.barberName, { color: colors.textSecondary }]} numberOfLines={1}>{barber.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.mainScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          
          <View style={[styles.timeAxis, { backgroundColor: colors.background, borderRightColor: colors.border }]}>
            {timeSlots.map(time => (
              <View key={time} style={styles.timeSlot}>
                <Text style={[styles.timeText, { backgroundColor: colors.background, color: colors.textSecondary }]}>{time}</Text>
              </View>
            ))}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={StyleSheet.absoluteFill}>
              {timeSlots.map((time, idx) => (
                <View key={`line-${idx}`} style={[styles.gridLine, { top: idx * (HOUR_HEIGHT / 2), backgroundColor: colors.border }]} />
              ))}
            </View>

            {barbers.map(barber => {
              const barberAppts = appointments.filter(a => a.barber_id === barber.id)
              
              return (
                <View key={barber.id} style={[styles.dayCol, { borderRightColor: colors.border }]}>
                  {barberAppts.map((appt) => {
                    const { top, height } = getEventPosition(appt.scheduled_at, appt.duration_min)
                    const statusColors = getStatusColor(appt.status)
                    const isOnline = appt.source === 'website'
                    const isPaid = appt.payment_status === 'paid'
                    
                    return (
                      <Animated.View 
                        key={appt.id} 
                        entering={FadeIn}
                        style={[
                          styles.eventBlock,
                          { top, height, backgroundColor: statusColors.bg, borderColor: statusColors.border }
                        ]}
                      >
                        <TouchableOpacity 
                          style={{ flex: 1 }} 
                          onPress={() => handleApptPress(appt)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.eventHeader}>
                            <Text style={[styles.eventClient, { color: statusColors.text }]} numberOfLines={1}>
                              {appt.client_name}
                            </Text>
                            {isOnline && <Text style={styles.badgeSource}>👑 App</Text>}
                          </View>

                          {appt.services && (
                            <Text style={[styles.eventService, { color: theme === 'dark' ? '#ccc' : '#444' }]} numberOfLines={1}>
                              {appt.services.name}
                            </Text>
                          )}
                          
                          <View style={styles.eventFooter}>
                            <Text style={styles.eventTime} numberOfLines={1}>
                              {new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            <View style={styles.paymentInfo}>
                              {appt.services?.price && (
                                <Text style={[styles.eventPrice, { color: statusColors.text }]}>
                                  R$ {appt.services.price.toFixed(2)}
                                </Text>
                              )}
                              <View style={[styles.paymentDot, { backgroundColor: isPaid ? '#34d399' : '#fbbf24' }]} />
                            </View>
                          </View>

                        </TouchableOpacity>
                      </Animated.View>
                    )
                  })}
                </View>
              )
            })}
          </ScrollView>

        </View>
      </ScrollView>
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
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    height: 70,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  timeColHeader: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
  },
  barbersScroll: {
    flex: 1,
  },
  barberHeaderCard: {
    width: COL_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  barberName: {
    fontSize: 12,
    fontWeight: '500',
  },
  mainScroll: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    height: timeSlots.length * (HOUR_HEIGHT / 2),
  },
  timeAxis: {
    width: 60,
    borderRightWidth: 1,
    zIndex: 5,
  },
  timeSlot: {
    height: HOUR_HEIGHT / 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 10,
    marginTop: -7,
    paddingHorizontal: 2,
  },
  gridLine: {
    height: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    width: 1000,
  },
  dayCol: {
    width: COL_WIDTH,
    borderRightWidth: 1,
    position: 'relative',
  },
  eventBlock: {
    position: 'absolute',
    left: 2,
    right: 2,
    borderRadius: 8,
    borderLeftWidth: 3,
    padding: 4,
    overflow: 'hidden',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventClient: {
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  badgeSource: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#d4a017',
    marginLeft: 4,
  },
  eventService: {
    fontSize: 10,
    marginTop: 2,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  eventTime: {
    fontSize: 10,
    color: '#888',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventPrice: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  paymentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  }
})
