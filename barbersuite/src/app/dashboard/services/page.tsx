'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Clock, DollarSign, Search } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Mock Data
const MOCK_SERVICES = [
  { id: '1', name: 'Fade Clássico', price: 50, duration: 45, category: 'Corte', description: 'Degradê perfeito, alinhamento e acabamento na navalha.', is_active: true },
  { id: '2', name: 'Ritual de Barba', price: 40, duration: 30, category: 'Barba', description: 'Toalha quente, óleos essenciais, alinhamento e massagem.', is_active: true },
  { id: '3', name: 'Full Experience', price: 80, duration: 90, category: 'Pacote', description: 'Corte + Barba + Máscara Negra + Bebida cortesia.', is_active: true },
  { id: '4', name: 'Corte Infantil', price: 45, duration: 40, category: 'Corte', description: 'Corte para crianças com a mesma precisão e paciência.', is_active: false },
]

export default function ServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl uppercase tracking-tight text-white">
            Serviços
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Gerencie os serviços oferecidos na sua barbearia.</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Buscar serviço..." 
              className="premium-input pl-9 py-2 text-sm w-full"
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-gold py-2 text-xs whitespace-nowrap">
            <Plus size={16} /> Novo Serviço
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_SERVICES.map((service) => (
          <div key={service.id} className={`premium-card p-5 relative overflow-hidden transition-all ${!service.is_active ? 'opacity-50 grayscale' : ''}`}>
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-md transition-colors">
                <Edit2 size={14} />
              </button>
              <button className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                <Trash2 size={14} />
              </button>
            </div>

            {/* Category badge */}
            <span className="inline-block px-2.5 py-1 rounded-full bg-[#d4af37]/10 text-[#d4af37] text-[9px] font-bold uppercase tracking-widest mb-3">
              {service.category}
            </span>

            <h3 className="font-[family-name:var(--font-display)] text-xl text-white mb-2">{service.name}</h3>
            
            <p className="text-neutral-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
              {service.description}
            </p>

            <div className="flex items-center gap-4 pt-4 border-t border-neutral-800/50">
              <div className="flex items-center gap-1.5 text-neutral-300">
                <DollarSign size={16} className="text-[#d4af37]" />
                <span className="font-bold">{formatCurrency(service.price)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-300">
                <Clock size={16} className="text-[#d4af37]" />
                <span className="font-medium text-sm">{service.duration} min</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="premium-card w-full max-w-lg p-6">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-white uppercase mb-6">Novo Serviço</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Nome do Serviço</label>
                <input type="text" className="premium-input w-full" placeholder="Ex: Fade Clássico" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Preço (R$)</label>
                  <input type="number" className="premium-input w-full" placeholder="50.00" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Duração (min)</label>
                  <select className="premium-input w-full appearance-none">
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="90">1h 30min</option>
                    <option value="120">2 horas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Categoria</label>
                <input type="text" className="premium-input w-full" placeholder="Ex: Corte, Barba, Tratamento" />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Descrição</label>
                <textarea className="premium-input w-full resize-none h-24" placeholder="Descreva o que está incluso no serviço..." />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="btn-outline flex-1 justify-center py-2 text-xs">Cancelar</button>
              <button onClick={() => setIsModalOpen(false)} className="btn-gold flex-1 justify-center py-2 text-xs">Salvar Serviço</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
