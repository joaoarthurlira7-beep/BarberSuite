'use client'

import { useState, useEffect } from 'react'
import { 
  UserCheck, 
  Search, 
  Star, 
  Clock, 
  AlertTriangle, 
  MoreHorizontal, 
  Download, 
  Plus,
  X,
  Loader2,
  Trash2,
  Edit2,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  Tag,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─── Constants & Segments ──────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  'VIP': 'bg-[#ffffff]/10 text-[#ffffff] border-[#ffffff]/20',
  'Frequente': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Novo': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Inativo': 'bg-red-500/10 text-red-400 border-red-500/20'
}

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Nunca'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [barbershopId, setBarbershopId] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Filters & Search
  const [filter, setFilter] = useState('Todos')
  const [search, setSearch] = useState('')

  // Toast / Modals
  const [toastMessage, setToastMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<any | null>(null)
  const [formError, setFormError] = useState('')

  // Client Form Fields
  const [name, setName] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [email, setEmail] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [notes, setNotes] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Fetch initial data
  useEffect(() => {
    fetchBarbershop()
  }, [])

  useEffect(() => {
    if (barbershopId) {
      fetchData(barbershopId)
    }
  }, [barbershopId])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 4000)
  }

  const fetchBarbershop = async () => {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    let shopId = null
    let demoActive = false

    if (userData?.user) {
      const { data: shop } = await supabase
        .from('barbershops')
        .select('id')
        .eq('owner_id', userData.user.id)
        .single()

      if (shop) {
        shopId = shop.id
      }
    } else {
      const isDemo = document.cookie.includes('demo-mode=true')
      if (isDemo) {
        demoActive = true
        setIsDemoMode(true)
        const { data: shop } = await supabase
          .from('barbershops')
          .select('id')
          .eq('slug', 'barbearia-suite')
          .single()
        if (shop) {
          shopId = shop.id
        }
      }
    }

    if (shopId) {
      setBarbershopId(shopId)
    } else {
      setLoading(false)
    }
  }

  const fetchData = async (shopId: string) => {
    setLoading(true)
    const supabase = createClient()

    try {
      // 1. Fetch CRM Clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('barbershop_id', shopId)
        .order('name', { ascending: true })

      if (clientsError) throw clientsError

      // 2. Fetch Appointments for visits/spent aggregation
      const { data: apptsData, error: apptsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('barbershop_id', shopId)
        .order('scheduled_at', { ascending: false })

      if (apptsError) throw apptsError

      setClients(clientsData || [])
      setAppointments(apptsData || [])
    } catch (err: any) {
      console.error('Error fetching CRM data:', err)
      showToast('Erro ao carregar os dados.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Merging & Aggregation Logic ─────────────────────────────────────────────
  const getMergedClients = () => {
    // 1. Group organic bookings by phone to find unique customer profiles
    const bookingProfiles: Record<string, {
      name: string
      phone: string
      email: string
      visits: number
      spent: number
      lastVisit: string | null
      firstVisit: string | null
    }> = {}

    appointments.forEach(appt => {
      if (!appt.client_phone) return
      
      const cleanPhone = appt.client_phone.replace(/\D/g, '')
      const isCanceled = appt.status === 'canceled'
      const price = Number(appt.price || 0)

      if (!bookingProfiles[cleanPhone]) {
        bookingProfiles[cleanPhone] = {
          name: appt.client_name,
          phone: appt.client_phone,
          email: appt.client_email || '',
          visits: 0,
          spent: 0,
          lastVisit: null,
          firstVisit: null
        }
      }

      if (!isCanceled) {
        bookingProfiles[cleanPhone].visits += 1
        bookingProfiles[cleanPhone].spent += price
        
        // Compute last and first visits
        const apptDate = appt.scheduled_at
        if (apptDate) {
          if (!bookingProfiles[cleanPhone].lastVisit || new Date(apptDate) > new Date(bookingProfiles[cleanPhone].lastVisit!)) {
            bookingProfiles[cleanPhone].lastVisit = apptDate
          }
          if (!bookingProfiles[cleanPhone].firstVisit || new Date(apptDate) < new Date(bookingProfiles[cleanPhone].firstVisit!)) {
            bookingProfiles[cleanPhone].firstVisit = apptDate
          }
        }
      }
    })

    // 2. Merge with structured CRM profiles (clients table)
    const mergedList: any[] = []
    const processedPhones = new Set<string>()

    // First, map database structured clients
    clients.forEach(crmClient => {
      const cleanPhone = crmClient.phone ? crmClient.phone.replace(/\D/g, '') : ''
      const bookingData = cleanPhone ? bookingProfiles[cleanPhone] : null

      processedPhones.add(cleanPhone)

      mergedList.push({
        id: crmClient.id,
        name: crmClient.name,
        phone: crmClient.phone || 'Sem Telefone',
        email: crmClient.email || 'Sem E-mail',
        birthDate: crmClient.birth_date,
        notes: crmClient.notes || '',
        tags: crmClient.tags || [],
        visits: bookingData ? bookingData.visits : crmClient.total_visits || 0,
        spent: bookingData ? bookingData.spent : Number(crmClient.total_spent || 0),
        lastVisit: bookingData ? bookingData.lastVisit : crmClient.last_visit_at,
        firstVisit: bookingData ? bookingData.firstVisit : crmClient.created_at,
        isActive: crmClient.is_active,
        isVirtual: false // saved physically in db
      })
    })

    // Next, add organic bookings not registered in CRM yet (Virtual Profiles)
    Object.keys(bookingProfiles).forEach(phoneKey => {
      if (processedPhones.has(phoneKey)) return

      const bProfile = bookingProfiles[phoneKey]
      mergedList.push({
        id: `virtual-${phoneKey}`,
        name: bProfile.name,
        phone: bProfile.phone,
        email: bProfile.email,
        birthDate: null,
        notes: 'Agendou pelo site público. Perfil criado automaticamente.',
        tags: ['Orgânico'],
        visits: bProfile.visits,
        spent: bProfile.spent,
        lastVisit: bProfile.lastVisit,
        firstVisit: bProfile.firstVisit,
        isActive: true,
        isVirtual: true // not yet saved physically in crm table
      })
    })

    // 3. Segment Clients
    return mergedList.map(item => {
      let status = 'Frequente'
      const now = new Date()
      const lastVisitDate = item.lastVisit ? new Date(item.lastVisit) : null
      const firstVisitDate = item.firstVisit ? new Date(item.firstVisit) : null

      // VIP: > 10 visits OR spent > R$ 500
      if (item.visits > 10 || item.spent > 500) {
        status = 'VIP'
      } 
      // Inativo: no visit in last 60 days
      else if (lastVisitDate && (now.getTime() - lastVisitDate.getTime()) > 60 * 24 * 60 * 60 * 1000) {
        status = 'Inativo'
      }
      // Novo: registered in last 30 days and < 3 visits
      else if (firstVisitDate && (now.getTime() - firstVisitDate.getTime()) <= 30 * 24 * 60 * 60 * 1000 && item.visits < 3) {
        status = 'Novo'
      }

      return {
        ...item,
        status
      }
    })
  }

  const mergedClients = getMergedClients()

  // Filtered & Searched List
  const filteredClients = mergedClients.filter(c => {
    const matchesFilter = filter === 'Todos' || c.status === filter
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.phone.replace(/\D/g, '').includes(search.replace(/\D/g, ''))
    return matchesFilter && matchesSearch
  })

  // ─── KPIs Calculations ────────────────────────────────────────────────────────
  const totalClients = mergedClients.length
  const vipClients = mergedClients.filter(c => c.status === 'VIP').length
  const newClients = mergedClients.filter(c => c.status === 'Novo').length
  const inactiveClients = mergedClients.filter(c => c.status === 'Inativo').length

  // ─── CSV Export ──────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (filteredClients.length === 0) {
      showToast('Nenhum cliente disponível para exportar.')
      return
    }

    let csvContent = 'data:text/csv;charset=utf-8,' + 
      'Nome,Telefone,E-mail,Visitas,Total Gasto (R$),Ultima Visita,Status,Tipo\n'

    filteredClients.forEach(c => {
      const cleanName = c.name.replace(/,/g, ' ')
      const cleanPhone = c.phone.replace(/,/g, ' ')
      const cleanEmail = c.email.replace(/,/g, ' ')
      const lastVisitStr = c.lastVisit ? new Date(c.lastVisit).toLocaleDateString('pt-BR') : 'Nunca'
      csvContent += `${cleanName},${cleanPhone},${cleanEmail},${c.visits},${c.spent.toFixed(2)},${lastVisitStr},${c.status},${c.isVirtual ? 'Organico' : 'CRM'}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `clientes_barbersuite_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Relatório de clientes exportado em CSV!')
  }

  // ─── CRUD Actions ─────────────────────────────────────────────────────────────
  const handleCreateClick = () => {
    setEditingClient(null)
    setName('')
    setPhoneInput('')
    setEmail('')
    setBirthDate('')
    setNotes('')
    setTagsInput('')
    setIsActive(true)
    setFormError('')
    setIsModalOpen(true)
  }

  const handleEditClick = (c: any) => {
    setEditingClient(c)
    setName(c.name)
    setPhoneInput(c.phone)
    setEmail(c.email === 'Sem E-mail' ? '' : c.email)
    setBirthDate(c.birthDate ? c.birthDate.split('T')[0] : '')
    setNotes(c.notes)
    setTagsInput(c.tags.join(', '))
    setIsActive(c.isActive !== false)
    setFormError('')
    setIsModalOpen(true)
  }

  const handleDelete = async (c: any) => {
    if (c.isVirtual) {
      showToast('Este cliente é virtual e gerado pelos agendamentos. Para removê-lo, remova seus agendamentos correspondentes.')
      return
    }

    if (!confirm(`Tem certeza que deseja excluir o cliente ${c.name}?`)) return

    if (isDemoMode) {
      setClients(prev => prev.filter(item => item.id !== c.id))
      showToast('Modo de Demonstração: Cliente excluído localmente.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', c.id)

      if (error) throw error

      showToast('Cliente removido do CRM.')
      if (barbershopId) await fetchData(barbershopId)
    } catch (err: any) {
      console.error('Error deleting client:', err)
      showToast('Erro ao remover cliente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!name.trim()) {
      setFormError('O nome do cliente é obrigatório.')
      return
    }
    if (!barbershopId) {
      setFormError('Erro: Barbearia ativa não identificada.')
      return
    }

    setSaving(true)

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    const clientData = {
      barbershop_id: barbershopId,
      name: name.trim(),
      phone: phoneInput.trim() || null,
      email: email.trim() || null,
      birth_date: birthDate ? birthDate : null,
      notes: notes.trim() || null,
      tags: parsedTags,
      is_active: isActive
    }

    if (isDemoMode) {
      if (editingClient && !editingClient.isVirtual) {
        setClients(prev => prev.map(item => 
          item.id === editingClient.id ? { ...item, ...clientData } : item
        ))
        showToast('Modo de Demonstração: Perfil atualizado localmente!')
      } else {
        const newClient = {
          id: editingClient && editingClient.isVirtual ? editingClient.id.replace('virtual-', '') : String(Date.now()),
          ...clientData,
          created_at: new Date().toISOString()
        }
        // If editing a virtual, remove virtual tag, add as physical
        if (editingClient?.isVirtual) {
          setClients(prev => [...prev, newClient])
        } else {
          setClients(prev => [...prev, newClient])
        }
        showToast('Modo de Demonstração: Cliente cadastrado localmente!')
      }
      setSaving(false)
      setIsModalOpen(false)
      return
    }

    const supabase = createClient()

    try {
      if (editingClient && !editingClient.isVirtual) {
        // Update physical row
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', editingClient.id)

        if (error) throw error
        showToast('Cliente CRM atualizado!')
      } else {
        // Insert new physical row (or convert virtual to physical)
        const { error } = await supabase
          .from('clients')
          .insert(clientData)

        if (error) throw error
        showToast('Cliente cadastrado com sucesso!')
      }

      setIsModalOpen(false)
      await fetchData(barbershopId)
    } catch (err: any) {
      console.error('Error saving client:', err)
      setFormError(err.message || 'Erro ao salvar. Verifique seus dados.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 p-6 min-h-full" style={{ background: '#030303' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 premium-card py-3 px-5 flex items-center gap-3 border border-[#ffffff]/20 bg-[#07070a]/95 text-white animate-fade-in shadow-2xl rounded-xl">
          <Sparkles size={16} className="text-yellow-400" />
          <span className="text-xs font-semibold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      {/* Demo Warning Banner */}
      {isDemoMode && (
        <div className="w-full p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-yellow-500 font-bold uppercase tracking-wider">Modo de Demonstração Ativo</p>
              <p className="text-xs text-neutral-400 mt-0.5">As modificações nos clientes serão salvas temporariamente na memória local desta aba do navegador.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
            Clube de <span className="text-[#ffffff]">Clientes</span>
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Gerencie sua base de clientes, histórico de visitas e segmentação financeira.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="btn-outline text-xs uppercase font-bold tracking-wider flex items-center gap-2">
            <Download size={14} /> Exportar
          </button>
          <button onClick={handleCreateClick} className="btn-neon text-xs uppercase font-bold tracking-wider flex items-center gap-2">
            <Plus size={14} /> Novo Cliente
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="premium-card p-6 h-28 animate-pulse bg-white/[0.01]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Clients */}
          <div className="premium-card p-6 flex flex-col gap-2 relative overflow-hidden group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <UserCheck size={20} className="text-blue-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Total de Clientes</span>
            </div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-3xl font-[family-name:var(--font-display)] font-bold text-white">{totalClients}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">Clientes Ativos</span>
            </div>
          </div>

          {/* VIP Clients */}
          <div className="premium-card p-6 flex flex-col gap-2 relative overflow-hidden group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <Star size={20} className="text-yellow-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Clientes VIP</span>
            </div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-3xl font-[family-name:var(--font-display)] font-bold text-white">{vipClients}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-yellow-500">
                {totalClients > 0 ? `${Math.round((vipClients / totalClients) * 100)}%` : '0%'} da base
              </span>
            </div>
          </div>

          {/* New Clients */}
          <div className="premium-card p-6 flex flex-col gap-2 relative overflow-hidden group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Clock size={20} className="text-green-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Novos (30 dias)</span>
            </div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-3xl font-[family-name:var(--font-display)] font-bold text-white">{newClients}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-green-500">Recém-chegados</span>
            </div>
          </div>

          {/* Inactive Clients */}
          <div className="premium-card p-6 flex flex-col gap-2 relative overflow-hidden group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Inativos (+60 dias)</span>
            </div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-3xl font-[family-name:var(--font-display)] font-bold text-white">{inactiveClients}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-red-400">Precisam de atração</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="premium-card flex flex-col flex-1 min-h-[500px]">
        {/* Filters Bar */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 p-1 rounded-lg bg-white/5 border border-white/10">
            {['Todos', 'VIP', 'Frequente', 'Novo', 'Inativo'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  filter === tab 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou celular..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="premium-input pl-9 h-10 text-sm"
            />
          </div>
        </div>

        {/* Table / List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 flex-1">
            <Loader2 size={36} className="animate-spin text-white" />
            <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Processando base de CRM...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Cliente</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Contato</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Última Visita</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-neutral-500 text-center">Visitas</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-neutral-500 text-right">Total Gasto</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-neutral-500 text-center">Tags / Notas</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-neutral-500 text-center">Segmento</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-neutral-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredClients.length > 0 ? filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/[0.01] transition-colors group">
                    {/* Client Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white font-extrabold text-xs">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white flex items-center gap-2">
                            {client.name}
                            {client.isVirtual && (
                              <span className="text-[8px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded">
                                Visitante
                              </span>
                            )}
                          </div>
                          {client.notes && (
                            <p className="text-[10px] text-neutral-500 line-clamp-1 max-w-xs mt-0.5">{client.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contacts */}
                    <td className="p-4 text-sm text-neutral-300">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="font-semibold text-neutral-400">{client.phone}</span>
                        {client.email && client.email !== 'Sem E-mail' && (
                          <span className="text-neutral-500 text-[10px]">{client.email}</span>
                        )}
                      </div>
                    </td>

                    {/* Last Visit */}
                    <td className="p-4 text-xs text-neutral-400">
                      {client.lastVisit ? formatDate(client.lastVisit) : 'Nenhuma visita'}
                    </td>

                    {/* Visits count */}
                    <td className="p-4 text-sm text-center font-bold text-white">{client.visits}</td>

                    {/* Spent total */}
                    <td className="p-4 text-sm text-right font-semibold text-neutral-300">
                      {fmt(client.spent)}
                    </td>

                    {/* Tags / Notes */}
                    <td className="p-4 text-center">
                      <div className="flex flex-wrap gap-1 justify-center max-w-xs mx-auto">
                        {client.tags.slice(0, 3).map((tag: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 text-[9px] font-bold uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                        {client.tags.length > 3 && (
                          <span className="text-[9px] text-neutral-500 font-bold">+{client.tags.length - 3}</span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${STATUS_COLORS[client.status]}`}>
                        {client.status}
                      </span>
                    </td>

                    {/* Actions buttons */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleEditClick(client)}
                          className="p-1.5 rounded text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDelete(client)}
                          className={`p-1.5 rounded text-neutral-500 transition-colors ${
                            client.isVirtual ? 'opacity-30 cursor-not-allowed' : 'hover:text-red-400 hover:bg-red-400/10'
                          }`}
                          disabled={client.isVirtual}
                          title={client.isVirtual ? 'Cliente Virtual' : 'Excluir'}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-neutral-600">
                          <UserCheck size={32} />
                        </div>
                        <p className="text-white font-medium uppercase tracking-wider text-xs">Nenhum cliente cadastrado no segmento</p>
                        <p className="text-sm text-neutral-500">Clique em &quot;Novo Cliente&quot; para registrar seu primeiro perfil de CRM.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Add / Edit Client ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="premium-card w-full max-w-lg p-6 relative my-8">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white p-1 rounded-md hover:bg-neutral-800 transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="font-[family-name:var(--font-display)] text-xl text-white uppercase mb-6 flex items-center gap-2">
              {editingClient && !editingClient.isVirtual ? 'Editar Cliente' : 'Cadastrar Cliente'}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/50 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {editingClient?.isVirtual && (
                <div className="p-3 bg-yellow-950/20 border border-yellow-500/20 text-yellow-400 text-xs rounded-xl flex items-center gap-2">
                  <Sparkles size={14} className="flex-shrink-0 text-yellow-400" />
                  <span>Você está convertendo um visitante orgânico em cliente do CRM para adicionar notas e tags!</span>
                </div>
              )}

              {/* Input: Name */}
              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="premium-input w-full" 
                  placeholder="Ex: Rafael Andrade Mendes" 
                  required
                />
              </div>

              {/* Grid 1: Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Telefone (Celular)</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input 
                      type="text" 
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="premium-input w-full pl-9" 
                      placeholder="(62) 98480-4310" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">E-mail</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="premium-input w-full pl-9" 
                      placeholder="email@provedor.com" 
                    />
                  </div>
                </div>
              </div>

              {/* Input: Birth Date */}
              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Data de Nascimento (Opcional)</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input 
                    type="date" 
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="premium-input w-full pl-9" 
                  />
                </div>
              </div>

              {/* Input: Tags (Comma Separated) */}
              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1 flex items-center gap-1">
                  <Tag size={12} /> Tags de Classificação (separadas por vírgula)
                </label>
                <input 
                  type="text" 
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="premium-input w-full" 
                  placeholder="Ex: Cabelo Degradê, Barboterapia, Copo de Whisky" 
                />
              </div>

              {/* Textarea: Notes */}
              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Notas e Preferências</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="premium-input w-full resize-none h-20" 
                  placeholder="Ex: Prefere corte com tesoura nas laterais, gosta de cerveja IPA, não gosta de gel capilar..." 
                />
              </div>

              {/* Submit / Action buttons */}
              <div className="flex gap-3 pt-6 border-t border-neutral-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="btn-outline flex-1 justify-center py-2.5 text-xs font-bold uppercase tracking-wider"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-neon flex-1 justify-center py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Cliente'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
