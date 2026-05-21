'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Search, Package, AlertTriangle, ShieldCheck, DollarSign, Layers } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Mock Data
const MOCK_PRODUCTS = [
  { id: '1', name: 'Pomada Modeladora Efeito Matte', sku: 'POM-MAT-01', price: 45.00, stock: 12, low_stock: 5, category: 'Finalizador', supplier: 'BarberBrand Co.' },
  { id: '2', name: 'Óleo Hidratante para Barba Premium', sku: 'OL-BRB-02', price: 65.00, stock: 3, low_stock: 5, category: 'Tratamento', supplier: 'BeardCare Ltd.' },
  { id: '3', name: 'Shampoo Forte Anticaspa 250ml', sku: 'SHA-ANT-03', price: 55.00, stock: 8, low_stock: 4, category: 'Cabelo', supplier: 'Loreal Expert' },
  { id: '4', name: 'Cera Modeladora Strong Hold 100g', sku: 'CER-STR-04', price: 48.00, stock: 0, low_stock: 3, category: 'Finalizador', supplier: 'BarberBrand Co.' },
]

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = MOCK_PRODUCTS.filter(prod => 
    prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prod.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalItems = MOCK_PRODUCTS.reduce((acc, p) => acc + p.stock, 0)
  const lowStockCount = MOCK_PRODUCTS.filter(p => p.stock > 0 && p.stock <= p.low_stock).length
  const outOfStockCount = MOCK_PRODUCTS.filter(p => p.stock === 0).length
  const totalValue = MOCK_PRODUCTS.reduce((acc, p) => acc + (p.price * p.stock), 0)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl uppercase tracking-tight text-white">
            Produtos & Estoque
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Gerencie seu catálogo de produtos para venda e consumo interno.</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Buscar produto por nome ou SKU..." 
              className="premium-input pl-9 py-2 text-sm w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-neon py-2 text-xs whitespace-nowrap">
            <Plus size={16} /> Novo Produto
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Itens em Estoque', value: String(totalItems), icon: Package, color: '#3b82f6', desc: 'Unidades totais' },
          { label: 'Alerta Estoque Baixo', value: String(lowStockCount), icon: AlertTriangle, color: '#00ff66', desc: 'Abaixo do recomendado' },
          { label: 'Sem Estoque (Esgotado)', value: String(outOfStockCount), icon: AlertTriangle, color: '#ef4444', desc: 'Reabastecimento urgente' },
          { label: 'Valor do Estoque', value: formatCurrency(totalValue), icon: DollarSign, color: '#22c55e', desc: 'Preço de venda estimado' },
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => {
          const isOutOfStock = prod.stock === 0
          const isLowStock = prod.stock > 0 && prod.stock <= prod.low_stock
          
          return (
            <div 
              key={prod.id} 
              className={`premium-card p-5 relative overflow-hidden transition-all ${isOutOfStock ? 'border-red-500/20' : ''}`}
            >
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-md transition-colors">
                  <Edit2 size={14} />
                </button>
                <button className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Status Badge */}
              <div className="flex gap-2 mb-3">
                <span className="inline-block px-2.5 py-1 rounded-full bg-white/5 text-neutral-300 text-[9px] font-bold uppercase tracking-widest">
                  {prod.category}
                </span>

                {isOutOfStock && (
                  <span className="inline-block px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <AlertTriangle size={10} /> Esgotado
                  </span>
                )}

                {isLowStock && (
                  <span className="inline-block px-2.5 py-1 rounded-full bg-[#00ff66]/10 text-[#00ff66] text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 animate-pulse">
                    <AlertTriangle size={10} /> Estoque Baixo
                  </span>
                )}
                
                {!isOutOfStock && !isLowStock && (
                  <span className="inline-block px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck size={10} /> Regular
                  </span>
                )}
              </div>

              <h3 className="font-[family-name:var(--font-display)] text-lg text-white mb-1 tracking-wide truncate pr-16">{prod.name}</h3>
              <p className="text-neutral-600 text-[10px] font-mono mb-4">{prod.sku}</p>

              <div className="pt-4 border-t border-neutral-800/50 flex justify-between items-center text-sm">
                <div className="flex flex-col">
                  <span className="text-[9px] text-neutral-600 uppercase font-bold">Preço de Venda</span>
                  <span className="text-white font-bold">{formatCurrency(prod.price)}</span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-neutral-600 uppercase font-bold">Quantidade</span>
                  <span className={`font-semibold ${isOutOfStock ? 'text-red-500 font-bold' : isLowStock ? 'text-[#00ff66]' : 'text-white'}`}>
                    {prod.stock} / {prod.low_stock} <span className="text-[9px] text-neutral-600 font-light">(mín)</span>
                  </span>
                </div>
              </div>

              <div className="mt-3 text-[10px] text-neutral-500 flex justify-between">
                <span>Fornecedor: {prod.supplier}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="premium-card w-full max-w-lg p-6">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-white uppercase mb-6">Novo Produto</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Nome do Produto</label>
                  <input type="text" className="premium-input w-full" placeholder="Ex: Pomada Efeito Matte 100g" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Código SKU</label>
                  <input type="text" className="premium-input w-full" placeholder="Ex: POM-MAT-01" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Categoria</label>
                  <input type="text" className="premium-input w-full" placeholder="Ex: Finalizador, Shampoo" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Preço de Venda (R$)</label>
                  <input type="number" className="premium-input w-full" placeholder="45.00" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Estoque Inicial</label>
                  <input type="number" className="premium-input w-full" placeholder="10" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Qtd Mínima Alerta</label>
                  <input type="number" className="premium-input w-full" placeholder="3" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Fornecedor</label>
                <input type="text" className="premium-input w-full" placeholder="Ex: Distribuidora BarberMax" />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="btn-outline flex-1 justify-center py-2 text-xs">Cancelar</button>
              <button onClick={() => setIsModalOpen(false)} className="btn-neon flex-1 justify-center py-2 text-xs">Salvar Produto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
