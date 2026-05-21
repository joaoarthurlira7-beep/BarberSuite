'use client'

import { useState } from 'react'
import { Plus, ShoppingBag, DollarSign, Calendar, Search, CreditCard, ChevronRight, User } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Mock Data
const MOCK_SALES = [
  { id: '1', client_name: 'Carlos Silva', date: '21/05/2026', items: 'Fade Clássico + Pomada Matte', total: 95.00, method: 'pix', type: 'Misto' },
  { id: '2', client_name: 'Rafael Souza', date: '21/05/2026', items: 'Ritual de Barba', total: 40.00, method: 'credit_card', type: 'Serviço' },
  { id: '3', client_name: 'Lucas Mendes', date: '20/05/2026', items: 'Full Experience + Óleo de Barba', total: 145.00, method: 'pix', type: 'Misto' },
  { id: '4', client_name: 'Thiago Alves', date: '20/05/2026', items: 'Barboterapia', total: 45.00, method: 'cash', type: 'Serviço' },
  { id: '5', client_name: 'Bruno Costa', date: '19/05/2026', items: 'Shampoo Anticaspa', total: 55.00, method: 'debit_card', type: 'Produto' },
]

const METHOD_LABELS = {
  pix: { label: 'PIX', color: '#00b4d8', bg: 'bg-[#00b4d8]/10' },
  credit_card: { label: 'Crédito', color: '#ffffff', bg: 'bg-[#ffffff]/10' },
  debit_card: { label: 'Débito', color: '#3b82f6', bg: 'bg-blue-500/10' },
  cash: { label: 'Dinheiro', color: '#22c55e', bg: 'bg-green-500/10' },
  transfer: { label: 'Transferência', color: '#8b5cf6', bg: 'bg-purple-500/10' },
  other: { label: 'Outro', color: '#6b7280', bg: 'bg-neutral-800' },
}

export default function SalesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSales = MOCK_SALES.filter(sale => 
    sale.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.items.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl uppercase tracking-tight text-white">
            Vendas
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Gerencie a receita de serviços e vendas de produtos.</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Buscar venda por cliente ou item..." 
              className="premium-input pl-9 py-2 text-sm w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-neon py-2 text-xs whitespace-nowrap">
            <Plus size={16} /> Registrar Venda
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Faturamento Total', value: formatCurrency(375.00), icon: DollarSign, color: '#ffffff', desc: 'Últimos 30 dias' },
          { label: 'Vendas de Produtos', value: formatCurrency(120.00), icon: ShoppingBag, color: '#3b82f6', desc: 'Pomadas, óleos, shampoos' },
          { label: 'Ticket Médio', value: formatCurrency(75.00), icon: TrendingUpIcon, color: '#22c55e', desc: 'Média por cliente' },
          { label: 'Total Transações', value: '5', icon: CreditCard, color: '#8b5cf6', desc: 'Pagamentos processados' },
        ].map((kpi, i) => (
          <div key={i} className="premium-card p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">{kpi.label}</p>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${kpi.color}15` }}
              >
                <kpi.icon size={18} style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">{kpi.value}</p>
            <p className="text-[10px] text-neutral-600 mt-1">{kpi.desc}</p>
          </div>
        ))}
      </div>

      {/* Sales List */}
      <div className="premium-card p-6">
        <h3 className="font-[family-name:var(--font-display)] uppercase tracking-wide text-white text-sm font-bold mb-6">
          Histórico de Transações
        </h3>

        <div className="flex flex-col gap-3">
          {filteredSales.length > 0 ? (
            filteredSales.map((sale) => {
              const config = METHOD_LABELS[sale.method as keyof typeof METHOD_LABELS] ?? METHOD_LABELS.other
              return (
                <div 
                  key={sale.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-900/60 hover:bg-neutral-900 transition-colors border border-white/0 hover:border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 flex-shrink-0">
                      <User size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{sale.client_name}</h4>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{sale.items}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-white/5 text-neutral-300">
                          {sale.type}
                        </span>
                        <span className="text-[9px] text-neutral-500 font-medium flex items-center gap-1">
                          <Calendar size={10} /> {sale.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0">
                    <span 
                      className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase ${config.bg}`}
                      style={{ color: config.color }}
                    >
                      {config.label}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{formatCurrency(sale.total)}</p>
                      <p className="text-[10px] text-neutral-500">Aprovada</p>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="text-neutral-700 mx-auto mb-3" size={32} />
              <p className="text-xs text-neutral-400 font-medium">Nenhuma venda encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="premium-card w-full max-w-lg p-6">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-white uppercase mb-6">Nova Venda</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Nome do Cliente</label>
                <input type="text" className="premium-input w-full" placeholder="Ex: Carlos Silva" />
              </div>
              
              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Itens Vendidos</label>
                <input type="text" className="premium-input w-full" placeholder="Ex: Fade Clássico + Pomada Modeladora" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Valor Total (R$)</label>
                  <input type="number" className="premium-input w-full" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Método de Pagamento</label>
                  <select className="premium-input w-full appearance-none">
                    <option value="pix">PIX</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="debit_card">Cartão de Débito</option>
                    <option value="cash">Dinheiro</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="btn-outline flex-1 justify-center py-2 text-xs">Cancelar</button>
              <button onClick={() => setIsModalOpen(false)} className="btn-neon flex-1 justify-center py-2 text-xs">Salvar Venda</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Simple Helper components to maintain layout
function TrendingUpIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
