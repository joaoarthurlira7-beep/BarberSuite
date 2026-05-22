import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions } from 'react-native'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import { useAppTheme } from '@/context/ThemeContext'

const { width } = Dimensions.get('window')

// --- Types ---
interface BarberStat {
  id: string
  name: string
  photo_url: string | null
  cutsCount: number
  grossRevenue: number
  commission: number
}

interface ProductAlert {
  id: string
  name: string
  sku: string | null
  stock_qty: number
  low_stock_alert: number
}

export default function AdminDashboardScreen() {
  const { colors, theme } = useAppTheme()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month') // 'today' | 'week' | 'month'
  
  // Data States
  const [barbershopId, setBarbershopId] = useState<string | null>(null)
  const [shopName, setShopName] = useState('Minha Barbearia')
  
  // Compiled Stats
  const [revenue, setRevenue] = useState(0)
  const [cuts, setCuts] = useState(0)
  const [ticket, setTicket] = useState(0)
  const [commissions, setCommissions] = useState(0)
  
  // Detailed lists
  const [barberStats, setBarberStats] = useState<BarberStat[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<ProductAlert[]>([])
  
  // CRM Insights
  const [vipCount, setVipCount] = useState(0)
  const [inactiveCount, setInactiveCount] = useState(0)
  const [totalClientsCount, setTotalClientsCount] = useState(0)

  useEffect(() => {
    fetchBarbershopData()
  }, [period])

  const fetchBarbershopData = async () => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        // Fallback for Demo/Testing
        loadDemoStats()
        setLoading(false)
        return
      }

      // 1. Fetch Barbershop
      const { data: shop, error: shopErr } = await supabase
        .from('barbershops')
        .select('id, name')
        .eq('owner_id', userData.user.id)
        .single()

      if (shopErr || !shop) {
        // Fallback if no shop is owned by this user
        loadDemoStats()
        setLoading(false)
        return
      }

      setBarbershopId(shop.id)
      setShopName(shop.name)

      // Calculate time boundaries based on the selected period
      const now = new Date()
      const startDate = new Date()
      if (period === 'today') {
        startDate.setHours(0, 0, 0, 0)
      } else if (period === 'week') {
        startDate.setDate(now.getDate() - 7)
      } else if (period === 'month') {
        startDate.setDate(now.getDate() - 30)
      }

      // 2. Fetch Appointments with Services joined
      const { data: apptsData, error: apptsErr } = await supabase
        .from('appointments')
        .select('*, services(name, price)')
        .eq('barbershop_id', shop.id)
        .gte('scheduled_at', startDate.toISOString())
        .eq('status', 'completed') // Only completed counts as faturamento/cuts

      if (apptsErr) throw apptsErr

      const appts = apptsData || []

      // 3. Fetch Barbers list
      const { data: barbersData, error: barbersErr } = await supabase
        .from('barbers')
        .select('*')
        .eq('barbershop_id', shop.id)

      if (barbersErr) throw barbersErr
      const barbersList = barbersData || []

      // Aggregate core numbers
      const totalCuts = appts.length
      const totalRevenue = appts.reduce((sum, curr) => sum + (curr.services?.price || 0), 0)
      const avgTicket = totalCuts > 0 ? totalRevenue / totalCuts : 0

      setCuts(totalCuts)
      setRevenue(totalRevenue)
      setTicket(avgTicket)

      // Calculate Barber Individual stats and Total Commissions
      let accumulatedCommissions = 0
      const calculatedBarbers: BarberStat[] = barbersList.map(barber => {
        const barberAppts = appts.filter(a => a.barber_id === barber.id)
        const barberCuts = barberAppts.length
        const barberGross = barberAppts.reduce((sum, curr) => sum + (curr.services?.price || 0), 0)
        
        const commPct = barber.commission_percent ?? 50
        const barberComm = (barberGross * commPct) / 100
        accumulatedCommissions += barberComm

        return {
          id: barber.id,
          name: barber.name,
          photo_url: barber.photo_url,
          cutsCount: barberCuts,
          grossRevenue: barberGross,
          commission: barberComm
        }
      }).sort((a, b) => b.grossRevenue - a.grossRevenue) // rank by revenue

      setBarberStats(calculatedBarbers)
      setCommissions(accumulatedCommissions)

      // 4. Fetch Products for Stock Warning
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, sku, stock_qty, low_stock_alert')
        .eq('barbershop_id', shop.id)

      if (productsData) {
        const warnings = productsData.filter(p => (p.stock_qty ?? 0) <= (p.low_stock_alert ?? 3))
        setLowStockProducts(warnings)
      }

      // 5. Fetch Clients for CRM metrics
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .eq('barbershop_id', shop.id)

      if (clientsData) {
        setTotalClientsCount(clientsData.length)
        const vip = clientsData.filter(c => (c.total_visits ?? 0) > 10 || (c.total_spent ?? 0) > 500).length
        
        // Inactive: older than 60 days
        const sixtyDaysAgo = new Date()
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
        const inactive = clientsData.filter(c => {
          if (!c.last_visit_at) return true
          return new Date(c.last_visit_at) < sixtyDaysAgo
        }).length

        setVipCount(vip)
        setInactiveCount(inactive)
      }

    } catch (err) {
      console.error('Error fetching admin dashboard data:', err)
      loadDemoStats()
    } finally {
      setLoading(false)
    }
  }

  const loadDemoStats = () => {
    // Generate beautiful demo stats if Supabase is offline or user is demo
    const coef = period === 'today' ? 0.05 : period === 'week' ? 0.25 : 1
    
    setShopName('Valen Barbearia (SaaS)')
    
    const demoRev = Math.round(5240 * coef)
    const demoCuts = Math.round(92 * coef)
    const demoTicket = demoCuts > 0 ? demoRev / demoCuts : 57
    const demoComm = Math.round(demoRev * 0.5)

    setRevenue(demoRev)
    setCuts(demoCuts)
    setTicket(demoTicket)
    setCommissions(demoComm)

    setBarberStats([
      { id: 'b1', name: 'José Shaper', photo_url: null, cutsCount: Math.round(48 * coef), grossRevenue: Math.round(2700 * coef), commission: Math.round(1350 * coef) },
      { id: 'b2', name: 'Carlos Barber', photo_url: null, cutsCount: Math.round(30 * coef), grossRevenue: Math.round(1740 * coef), commission: Math.round(870 * coef) },
      { id: 'b3', name: 'Rafael Nunes', photo_url: null, cutsCount: Math.round(14 * coef), grossRevenue: Math.round(800 * coef), commission: Math.round(400 * coef) }
    ])

    setLowStockProducts([
      { id: 'p2', name: 'Óleo Hidratante para Barba Premium', sku: 'OL-BRB-02', stock_qty: 3, low_stock_alert: 5 },
      { id: 'p4', name: 'Cera Modeladora Strong Hold 100g', sku: 'CER-STR-04', stock_qty: 0, low_stock_alert: 3 }
    ])

    setTotalClientsCount(120)
    setVipCount(28)
    setInactiveCount(15)
  }

  const fmtCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Background Gradient for Dark Theme */}
      {theme === 'dark' && (
        <LinearGradient colors={['#070707', '#111111']} style={StyleSheet.absoluteFillObject} />
      )}

      {/* Custom Premium Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>PAINEL ADMIN</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>{shopName}</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchBarbershopData} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Ionicons name="refresh" size={22} color={colors.text} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Period Selector Slider Tabs */}
        <Animated.View entering={FadeInDown.duration(500)} style={[styles.periodTabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { id: 'today', label: 'Hoje' },
            { id: 'week', label: '7 Dias' },
            { id: 'month', label: '30 Dias' }
          ].map(tab => (
            <TouchableOpacity 
              key={tab.id}
              onPress={() => setPeriod(tab.id as any)}
              style={[
                styles.periodTab,
                period === tab.id && { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#fff', borderRadius: 10 }
              ]}
            >
              <Text 
                style={[
                  styles.periodTabText, 
                  { color: period === tab.id ? colors.text : colors.textSecondary, fontWeight: period === tab.id ? 'bold' : 'normal' }
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {loading && barbershopId ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={colors.text} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Atualizando estatísticas...</Text>
          </View>
        ) : (
          <Animated.View entering={FadeIn}>
            
            {/* Core KPI Financial Cards Grid */}
            <View style={styles.kpiGrid}>
              
              {/* Gross Revenue KPI Card */}
              <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.kpiHeader}>
                  <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Faturamento</Text>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="cash" size={18} color="#10b981" />
                  </View>
                </View>
                <Text style={[styles.kpiValue, { color: colors.text }]} numberOfLines={1}>
                  {fmtCurrency(revenue)}
                </Text>
                <Text style={[styles.kpiDesc, { color: '#10b981' }]}>
                  {period === 'today' ? 'Fechado hoje' : 'Período acumulado'}
                </Text>
              </View>

              {/* Total Cuts KPI Card */}
              <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.kpiHeader}>
                  <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Atendimentos</Text>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                    <Ionicons name="cut" size={18} color="#3b82f6" />
                  </View>
                </View>
                <Text style={[styles.kpiValue, { color: colors.text }]}>
                  {cuts}
                </Text>
                <Text style={[styles.kpiDesc, { color: '#3b82f6' }]}>
                  Cortes concluídos
                </Text>
              </View>

              {/* Average Ticket KPI Card */}
              <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.kpiHeader}>
                  <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Ticket Médio</Text>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                    <Ionicons name="analytics" size={18} color="#8b5cf6" />
                  </View>
                </View>
                <Text style={[styles.kpiValue, { color: colors.text }]} numberOfLines={1}>
                  {fmtCurrency(ticket)}
                </Text>
                <Text style={[styles.kpiDesc, { color: '#8b5cf6' }]}>
                  Média por cliente
                </Text>
              </View>

              {/* Commissions KPI Card */}
              <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.kpiHeader}>
                  <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Comissões</Text>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                    <Ionicons name="people" size={18} color="#f59e0b" />
                  </View>
                </View>
                <Text style={[styles.kpiValue, { color: colors.text }]} numberOfLines={1}>
                  {fmtCurrency(commissions)}
                </Text>
                <Text style={[styles.kpiDesc, { color: '#f59e0b' }]}>
                  Repasses gerados
                </Text>
              </View>
            </View>

            {/* Barber Performance list section */}
            <View style={styles.sectionHeaderContainer}>
              <Ionicons name="bar-chart-outline" size={20} color={colors.text} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Desempenho da Equipe</Text>
            </View>

            <View style={[styles.cardList, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {barberStats.map((barber, index) => (
                <View 
                  key={barber.id} 
                  style={[
                    styles.barberRow, 
                    { borderBottomColor: colors.border, borderBottomWidth: index === barberStats.length - 1 ? 0 : 1 }
                  ]}
                >
                  <View style={styles.barberProfile}>
                    <View style={[styles.barberAvatar, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      {barber.photo_url ? (
                        <Image source={{ uri: barber.photo_url }} style={styles.barberPhoto} />
                      ) : (
                        <Text style={[styles.avatarInitial, { color: colors.text }]}>{barber.name.charAt(0)}</Text>
                      )}
                    </View>
                    <View style={styles.barberInfo}>
                      <Text style={[styles.barberNameText, { color: colors.text }]}>{barber.name}</Text>
                      <Text style={[styles.barberSubtitleText, { color: colors.textSecondary }]}>
                        ✂️ {barber.cutsCount} cortes realizados
                      </Text>
                    </View>
                  </View>

                  <View style={styles.barberFinancials}>
                    <Text style={[styles.barberGross, { color: colors.text }]}>{fmtCurrency(barber.grossRevenue)}</Text>
                    <Text style={styles.barberComish}>Comissão: {fmtCurrency(barber.commission)}</Text>
                  </View>
                </View>
              ))}

              {barberStats.length === 0 && (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhum barbeiro ativo no período.</Text>
              )}
            </View>

            {/* CRM Loyalty Insights Section */}
            <View style={styles.sectionHeaderContainer}>
              <Ionicons name="people-outline" size={20} color={colors.text} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Indicadores de Fidelidade</Text>
            </View>

            <View style={styles.crmStatsRow}>
              
              {/* VIP Clients Box */}
              <View style={[styles.crmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={styles.crmLabel}>Clientes VIP 👑</Text>
                <Text style={[styles.crmValue, { color: colors.text }]}>{vipCount}</Text>
                <Text style={styles.crmDesc}>Gasto &gt; R$500 ou +10 visitas</Text>
              </View>

              {/* Inactive Alert Box */}
              <View style={[styles.crmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={styles.crmLabel}>Clientes Inativos ⚠️</Text>
                <Text style={[styles.crmValue, { color: '#ef4444' }]}>{inactiveCount}</Text>
                <Text style={styles.crmDesc}>Sem visita há +60 dias</Text>
              </View>

              {/* Total Base Box */}
              <View style={[styles.crmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={styles.crmLabel}>Total Base CRM</Text>
                <Text style={[styles.crmValue, { color: '#3b82f6' }]}>{totalClientsCount}</Text>
                <Text style={styles.crmDesc}>Clientes cadastrados</Text>
              </View>
            </View>

            {/* Product Stock Alert Warnings Section */}
            <View style={styles.sectionHeaderContainer}>
              <Ionicons name="warning-outline" size={20} color={colors.text} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Alertas de Estoque Crítico</Text>
            </View>

            <View style={[styles.cardList, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 40 }]}>
              {lowStockProducts.map((p, index) => {
                const isEsgotado = p.stock_qty === 0
                return (
                  <View 
                    key={p.id} 
                    style={[
                      styles.stockRow, 
                      { borderBottomColor: colors.border, borderBottomWidth: index === lowStockProducts.length - 1 ? 0 : 1 }
                    ]}
                  >
                    <View style={styles.stockItemLeft}>
                      <View style={[styles.alertIconBox, { backgroundColor: isEsgotado ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)' }]}>
                        <Ionicons 
                          name={isEsgotado ? "close-circle" : "alert-circle"} 
                          size={18} 
                          color={isEsgotado ? "#ef4444" : "#f59e0b"} 
                        />
                      </View>
                      <View>
                        <Text style={[styles.stockName, { color: colors.text }]}>{p.name}</Text>
                        <Text style={styles.stockSku}>{p.sku || 'SEM SKU'}</Text>
                      </View>
                    </View>

                    <View style={styles.stockItemRight}>
                      <Text style={[styles.stockQty, { color: isEsgotado ? '#ef4444' : '#f59e0b' }]}>
                        {p.stock_qty} un
                      </Text>
                      <Text style={styles.stockMin}>Alerta em: {p.low_stock_alert} un</Text>
                    </View>
                  </View>
                )
              })}

              {lowStockProducts.length === 0 && (
                <View style={styles.emptyStockBox}>
                  <Ionicons name="checkmark-circle" size={24} color="#34d399" style={{ marginBottom: 6 }} />
                  <Text style={[styles.emptyStockText, { color: '#34d399' }]}>Estoque perfeito! Nenhuma reposição urgente.</Text>
                </View>
              )}
            </View>

          </Animated.View>
        )}

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    maxWidth: 200,
  },
  refreshBtn: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  periodTabs: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodTabText: {
    fontSize: 13,
  },
  centerLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  kpiCard: {
    width: (width - 44) / 2,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  kpiDesc: {
    fontSize: 10,
    marginTop: 6,
    fontWeight: '500',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  barberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  barberProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  barberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 10,
    overflow: 'hidden',
  },
  barberPhoto: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  barberInfo: {
    flex: 1,
  },
  barberNameText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  barberSubtitleText: {
    fontSize: 11,
    marginTop: 2,
  },
  barberFinancials: {
    alignItems: 'flex-end',
  },
  barberGross: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  barberComish: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    fontSize: 12,
  },
  crmStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  crmCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crmLabel: {
    fontSize: 9,
    color: '#888',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  crmValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  crmDesc: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  stockItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stockName: {
    fontSize: 13,
    fontWeight: '600',
  },
  stockSku: {
    fontSize: 9,
    color: '#555',
    marginTop: 1,
  },
  stockItemRight: {
    alignItems: 'flex-end',
  },
  stockQty: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  stockMin: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  emptyStockBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStockText: {
    fontSize: 11,
    fontWeight: '500',
  }
})
