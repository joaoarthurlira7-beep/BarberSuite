'use client'

import { useState } from 'react'
import { Plus, X, Search, FileText, CheckCircle2, ChevronRight, Calculator, CreditCard, Receipt, Clock } from 'lucide-react'

// --- Mock Data ---
const KPIs = [
  { label: 'Comandas Abertas', value: '3', icon: FileText, color: 'text-blue-400' },
  { label: 'Fechadas Hoje', value: '12', icon: CheckCircle2, color: 'text-green-400' },
  { label: 'Ticket Médio', value: 'R$ 87,50', icon: Calculator, color: 'text-purple-400' },
  { label: 'Faturamento do Dia', value: 'R$ 1.050,00', icon: Receipt, color: 'text-[#d4af37]' },
]

const MOCK_BARBERS = ['José Shaper', 'Pablo Barber', 'Rafael Nunes']
const MOCK_SERVICES = [
  { id: 1, name: 'Corte Degradê', price: 50 },
  { id: 2, name: 'Corte Clássico', price: 45 },
  { id: 3, name: 'Barba Terapia', price: 40 },
  { id: 4, name: 'Pézinho', price: 15 },
]
const MOCK_PRODUCTS = [
  { id: 1, name: 'Pomada Matte', price: 65 },
  { id: 2, name: 'Óleo para Barba', price: 45 },
  { id: 3, name: 'Cerveja Artesanal', price: 12 },
]

type Order = {
  id: string; clientName: string; barber: string; time: string; items: {name: string, price: number}[]; total: number; status: 'open' | 'closed'
}

const INITIAL_OPEN: Order[] = [
  { id: '101', clientName: 'Marcos T.', barber: 'José Shaper', time: '14:30', items: [{name: 'Corte Degradê', price: 50}, {name: 'Cerveja Artesanal', price: 12}], total: 62, status: 'open' },
  { id: '102', clientName: 'Lucas Pinheiro', barber: 'Pablo Barber', time: '15:00', items: [{name: 'Corte Clássico', price: 45}], total: 45, status: 'open' },
  { id: '103', clientName: 'Fernando Silva', barber: 'José Shaper', time: '15:15', items: [{name: 'Barba Terapia', price: 40}, {name: 'Pomada Matte', price: 65}], total: 105, status: 'open' },
]

const CLOSED_ORDERS: Order[] = [
  { id: '99', clientName: 'Rafael Andrade', barber: 'José Shaper', time: '14:00', items: [{name: 'Corte + Barba', price: 80}], total: 80, status: 'closed' },
  { id: '98', clientName: 'João Victor', barber: 'Rafael Nunes', time: '13:45', items: [{name: 'Corte Infantil', price: 40}], total: 40, status: 'closed' },
  { id: '97', clientName: 'Pedro Alves', barber: 'Pablo Barber', time: '13:00', items: [{name: 'Corte Clássico', price: 45}, {name: 'Óleo para Barba', price: 45}], total: 90, status: 'closed' },
  { id: '96', clientName: 'Diego Lima', barber: 'José Shaper', time: '11:30', items: [{name: 'Corte Degradê', price: 50}], total: 50, status: 'closed' },
  { id: '95', clientName: 'Carlos Souza', barber: 'Pablo Barber', time: '10:00', items: [{name: 'Barba Terapia', price: 40}], total: 40, status: 'closed' },
]

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function OrdersPage() {
  const [openOrders, setOpenOrders] = useState(INITIAL_OPEN)
  const [closedOrders, setClosedOrders] = useState(CLOSED_ORDERS)

  // New order form state
  const [newClient, setNewClient] = useState('')
  const [newBarber, setNewBarber] = useState(MOCK_BARBERS[0])
  const [selectedItems, setSelectedItems] = useState<{name: string, price: number}[]>([])

  const newTotal = selectedItems.reduce((acc, curr) => acc + curr.price, 0)

  const handleAddItem = (item: {name: string, price: number}) => {
    setSelectedItems([...selectedItems, item])
  }

  const handleCreateOrder = () => {
    if (!newClient || selectedItems.length === 0) return
    const order: Order = {
      id: Math.random().toString(36).substr(2, 6),
      clientName: newClient,
      barber: newBarber,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      items: selectedItems,
      total: newTotal,
      status: 'open'
    }
    setOpenOrders([order, ...openOrders])
    setNewClient('')
    setSelectedItems([])
  }

  const handleCloseOrder = (id: string) => {
    const order = openOrders.find(o => o.id === id)
    if (!order) return
    setOpenOrders(openOrders.filter(o => o.id !== id))
    setClosedOrders([{...order, status: 'closed'}, ...closedOrders])
  }

  return (
    <div className="flex flex-col gap-8 p-6 min-h-full" style={{ background: '#06080f' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white uppercase tracking-tight">
            Comandas & <span className="text-[#d4af37]">Consumo</span>
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(200,207,224,0.6)' }}>
            Controle de serviços e produtos consumidos durante a visita.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIs.map((kpi, i) => (
          <div key={i} className="premium-card p-6 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <kpi.icon size={20} className={kpi.color} />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider text-neutral-400">{kpi.label}</span>
            </div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-3xl font-[family-name:var(--font-display)] font-bold text-white">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content: Left (Open Orders) & Right (New Order) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Open Orders List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Comandas Abertas</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {openOrders.map(order => (
              <div key={order.id} className="premium-card p-5 border-l-4" style={{ borderLeftColor: '#22c55e' }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{order.clientName}</h3>
                    <p className="text-xs text-[#d4af37] font-semibold tracking-wider uppercase mt-1">{order.barber}</p>
                  </div>
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    <Clock size={12} /> {order.time}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4 min-h-[60px]">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span style={{ color: 'rgba(200,207,224,0.8)' }}>{item.name}</span>
                      <span className="text-white">{fmt(item.price)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Total</p>
                    <p className="text-xl font-bold text-white">{fmt(order.total)}</p>
                  </div>
                  <button onClick={() => handleCloseOrder(order.id)} className="btn-outline px-4 py-2 text-[10px] hover:bg-[#22c55e]/10 hover:text-[#22c55e] hover:border-[#22c55e]">
                    Fechar Comanda
                  </button>
                </div>
              </div>
            ))}
            
            {openOrders.length === 0 && (
              <div className="col-span-2 premium-card p-12 flex flex-col items-center justify-center text-center border-dashed">
                <FileText size={32} className="text-neutral-600 mb-4" />
                <p className="text-white font-medium">Nenhuma comanda aberta</p>
                <p className="text-sm text-neutral-500">As comandas aparecerão aqui.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: New Order Form */}
        <div className="premium-card p-6 flex flex-col gap-5 h-fit">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Nova Comanda</h2>
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Cliente</label>
            <input 
              type="text" 
              placeholder="Nome do cliente"
              value={newClient}
              onChange={e => setNewClient(e.target.value)}
              className="premium-input w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Barbeiro</label>
            <select 
              value={newBarber}
              onChange={e => setNewBarber(e.target.value)}
              className="premium-input w-full appearance-none"
            >
              {MOCK_BARBERS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="border-t border-white/5 pt-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Adicionar Itens</label>
            <div className="flex gap-2 mb-3">
              <select 
                className="premium-input flex-1 appearance-none text-sm"
                onChange={(e) => {
                  if(!e.target.value) return;
                  const item = [...MOCK_SERVICES, ...MOCK_PRODUCTS].find(i => i.name === e.target.value);
                  if(item) handleAddItem(item);
                  e.target.value = "";
                }}
              >
                <option value="">Selecione um item...</option>
                <optgroup label="Serviços">
                  {MOCK_SERVICES.map(s => <option key={`s${s.id}`} value={s.name}>{s.name} - {fmt(s.price)}</option>)}
                </optgroup>
                <optgroup label="Produtos">
                  {MOCK_PRODUCTS.map(p => <option key={`p${p.id}`} value={p.name}>{p.name} - {fmt(p.price)}</option>)}
                </optgroup>
              </select>
            </div>

            {/* Selected items list */}
            {selectedItems.length > 0 && (
              <div className="bg-white/5 rounded-lg p-3 space-y-2 mb-4">
                {selectedItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-neutral-300">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white">{fmt(item.price)}</span>
                      <button onClick={() => setSelectedItems(selectedItems.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="flex justify-between items-end mb-4">
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Total Previsto</span>
              <span className="text-2xl font-bold text-[#d4af37]">{fmt(newTotal)}</span>
            </div>
            <button 
              onClick={handleCreateOrder}
              disabled={!newClient || selectedItems.length === 0}
              className={`w-full justify-center ${(!newClient || selectedItems.length === 0) ? 'btn-outline opacity-50 cursor-not-allowed' : 'btn-gold'}`}
            >
              Abrir Comanda
            </button>
          </div>
        </div>

      </div>

      {/* Closed Orders History */}
      <div className="premium-card flex flex-col mt-4">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Fechadas Recentemente</h2>
          <button className="text-xs text-[#d4af37] font-bold uppercase tracking-wider hover:underline">Ver Histórico Completo</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Cliente</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Barbeiro</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Itens</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 text-right">Total</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 text-center">Horário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {closedOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-white">{order.clientName}</td>
                  <td className="p-4 text-sm text-[#d4af37]">{order.barber}</td>
                  <td className="p-4 text-sm" style={{ color: 'rgba(200,207,224,0.6)' }}>
                    {order.items.map(i => i.name).join(', ')}
                  </td>
                  <td className="p-4 text-sm text-right font-bold text-white">{fmt(order.total)}</td>
                  <td className="p-4 text-sm text-center text-neutral-500">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
