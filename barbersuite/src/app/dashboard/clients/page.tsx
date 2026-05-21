'use client'

import { useState } from 'react'
import { UserCheck, Search, Filter, Star, Clock, AlertTriangle, MoreHorizontal, Download } from 'lucide-react'

// --- Mock Data ---
const KPIs = [
  { label: 'Total de Clientes', value: '247', change: '+12 este mês', icon: UserCheck, color: 'text-blue-400' },
  { label: 'Clientes VIP', value: '38', change: 'Top 15%', icon: Star, color: 'text-[#ffffff]' },
  { label: 'Novos (30 dias)', value: '12', change: '+3 vs mês ant.', icon: Clock, color: 'text-green-400' },
  { label: 'Inativos (+60 dias)', value: '54', change: 'Precisam de atenção', icon: AlertTriangle, color: 'text-red-400' },
]

const MOCK_CLIENTS = [
  { id: 1, name: 'Rafael Andrade Mendes', phone: '(62) 98480-4310', lastVisit: 'Hoje, 14:30', visits: 42, spent: 2150, status: 'VIP' },
  { id: 2, name: 'Lucas Pinheiro', phone: '(62) 99123-4567', lastVisit: 'Ontem, 10:00', visits: 18, spent: 850, status: 'Frequente' },
  { id: 3, name: 'Marcos T.', phone: '(62) 99876-5432', lastVisit: '15/05/2026', visits: 5, spent: 250, status: 'Frequente' },
  { id: 4, name: 'João Silva', phone: '(62) 98765-4321', lastVisit: '01/02/2026', visits: 2, spent: 100, status: 'Inativo' },
  { id: 5, name: 'Carlos Eduardo Souza', phone: '(11) 97777-8888', lastVisit: '20/05/2026', visits: 65, spent: 3400, status: 'VIP' },
  { id: 6, name: 'Diego Ferreira Lima', phone: '(41) 98888-9999', lastVisit: '10/04/2026', visits: 1, spent: 50, status: 'Inativo' },
  { id: 7, name: 'Fernando Silva', phone: '(62) 98111-2222', lastVisit: '18/05/2026', visits: 8, spent: 400, status: 'Frequente' },
  { id: 8, name: 'Pedro Alves', phone: '(62) 98222-3333', lastVisit: '05/01/2026', visits: 3, spent: 150, status: 'Inativo' },
]

const STATUS_COLORS: Record<string, string> = {
  'VIP': 'bg-[#ffffff]/10 text-[#ffffff] border-[#ffffff]/20',
  'Frequente': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Inativo': 'bg-red-500/10 text-red-400 border-red-500/20'
}

export default function ClientsPage() {
  const [filter, setFilter] = useState('Todos')
  const [search, setSearch] = useState('')

  const filteredClients = MOCK_CLIENTS.filter(c => 
    (filter === 'Todos' || c.status === filter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
  )

  return (
    <div className="flex flex-col gap-8 p-6 min-h-full" style={{ background: '#030303' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white uppercase tracking-tight">
            Clube de <span className="text-[#ffffff]">Clientes</span>
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(200,207,224,0.6)' }}>
            Gerencie sua base de clientes, histórico de visitas e segmentação.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline text-xs">
            <Download size={14} /> Exportar
          </button>
          <button className="btn-neon text-xs">
            + Novo Cliente
          </button>
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
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="premium-card flex flex-col flex-1 min-h-[500px]">
        {/* Filters Bar */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 p-1 rounded-lg bg-white/5 border border-white/10">
            {['Todos', 'VIP', 'Frequente', 'Inativo'].map(tab => (
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
              placeholder="Buscar cliente..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="premium-input pl-9 h-10 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Cliente</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Contato</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Última Visita</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 text-center">Visitas</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 text-right">Total Gasto</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 text-center">Status</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.length > 0 ? filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white">{client.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm" style={{ color: 'rgba(200,207,224,0.6)' }}>{client.phone}</td>
                  <td className="p-4 text-sm" style={{ color: 'rgba(200,207,224,0.6)' }}>{client.lastVisit}</td>
                  <td className="p-4 text-sm text-center font-bold text-white">{client.visits}</td>
                  <td className="p-4 text-sm text-right font-medium text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.spent)}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[client.status]}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 rounded hover:bg-white/10 text-neutral-500 hover:text-white transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-neutral-600">
                        <UserCheck size={32} />
                      </div>
                      <p className="text-white font-medium">Nenhum cliente encontrado</p>
                      <p className="text-sm text-neutral-500">Tente mudar os filtros ou a busca.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
