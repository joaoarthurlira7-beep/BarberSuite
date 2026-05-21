'use client'

import { useState } from 'react'
import { Megaphone, Users, MessageSquare, DollarSign, Send, Calendar, Smartphone, X, User } from 'lucide-react'

// --- Mock Data ---
const KPIs = [
  { label: 'Campanhas Mês', value: '8', icon: Megaphone, color: 'text-blue-400' },
  { label: 'Clientes Alcançados', value: '1.847', icon: Users, color: 'text-purple-400' },
  { label: 'Taxa de Abertura', value: '43%', icon: MessageSquare, color: 'text-[#00ff66]' },
  { label: 'Retorno Estimado', value: 'R$ 2.340', icon: DollarSign, color: 'text-green-400' },
]

const CAMPAIGNS = [
  { id: 1, title: 'Promoção Dia dos Pais', date: 'Enviada 12/08/2026', audience: 'Todos os Clientes', reach: 840, openRate: 48, status: 'Enviada' },
  { id: 2, title: 'Saudades! 15% OFF', date: 'Enviada 01/08/2026', audience: 'Inativos +60 dias', reach: 124, openRate: 35, status: 'Enviada' },
  { id: 3, title: 'Novo Serviço: Barba Terapia', date: 'Enviada 15/07/2026', audience: 'Clientes VIP', reach: 38, openRate: 85, status: 'Enviada' },
  { id: 4, title: 'Sextou com Cerveja', date: 'Agendada para Amanhã', audience: 'Frequentes', reach: 150, openRate: 0, status: 'Agendada' },
  { id: 5, title: 'Aviso Feriado', date: 'Rascunho', audience: 'Todos os Clientes', reach: 0, openRate: 0, status: 'Rascunho' },
]

export default function MarketingPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <div className="flex flex-col gap-8 p-6 min-h-full relative" style={{ background: '#030303' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white uppercase tracking-tight">
            Campanhas de <span className="text-[#00ff66]">Marketing</span>
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(200,207,224,0.6)' }}>
            Envie promoções via SMS para impulsionar o movimento.
          </p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="btn-neon py-2 text-xs">
          + Nova Campanha
        </button>
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

      {/* Main Content (History Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {CAMPAIGNS.map(camp => {
          let badgeColor = 'bg-white/5 text-white border-white/10'
          if (camp.status === 'Enviada') badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          if (camp.status === 'Agendada') badgeColor = 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20'
          
          return (
            <div key={camp.id} className="premium-card p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border mb-3 ${badgeColor}`}>
                    {camp.status}
                  </span>
                  <h3 className="text-lg font-bold text-white leading-tight">{camp.title}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{camp.date}</p>
                </div>
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-neutral-500">
                  <MessageSquare size={14} />
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400 uppercase font-bold">Público: {camp.audience}</span>
                  <span className="text-white font-bold">{camp.reach} pts</span>
                </div>
                
                {camp.status === 'Enviada' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#00ff66] font-bold">Abertura</span>
                      <span className="text-white font-bold">{camp.openRate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00ff66]" style={{ width: `${camp.openRate}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Slide-over Form Panel */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full md:w-[600px] h-full bg-[#0a0a0a] border-l border-neutral-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-[#030303]">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white uppercase tracking-tight">Criar <span className="text-[#00ff66]">Campanha</span></h2>
              <button onClick={() => setIsFormOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
              
              {/* Form Config */}
              <div className="flex-1 flex flex-col gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Título Interno</label>
                  <input type="text" placeholder="Ex: Promocao Pais 2026" className="premium-input w-full" />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Público Alvo</label>
                  <select className="premium-input w-full appearance-none">
                    <option>Todos os Clientes (Aprox. 247)</option>
                    <option>Clientes VIP (Aprox. 38)</option>
                    <option>Inativos +30 dias (Aprox. 54)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">Mensagem (SMS)</label>
                    <span className="text-[10px] text-neutral-500 font-mono">0 / 160</span>
                  </div>
                  <textarea 
                    className="premium-input w-full h-32 resize-none" 
                    placeholder="Escreva sua mensagem aqui..."
                  />
                  <div className="flex gap-2 mt-2">
                    <button className="text-[10px] bg-white/5 px-2 py-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">+{'{nome}'}</button>
                    <button className="text-[10px] bg-white/5 px-2 py-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">+{'{link_agendamento}'}</button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Agendamento</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="premium-input w-full justify-center bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/30 text-sm font-bold">
                      Enviar Agora
                    </button>
                    <button className="premium-input w-full justify-center text-sm">
                      Programar <Calendar size={14} className="inline ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Panel */}
              <div className="w-full md:w-48 flex-shrink-0 flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-4">Preview do Cliente</span>
                <div className="w-full aspect-[9/19] rounded-[2rem] border-[6px] border-neutral-900 bg-[#030303] relative overflow-hidden flex flex-col">
                  {/* Notch */}
                  <div className="absolute top-0 inset-x-0 h-4 bg-neutral-900 rounded-b-xl mx-auto w-1/2" />
                  
                  {/* Header */}
                  <div className="pt-8 pb-3 px-4 flex items-center justify-center border-b border-white/5 bg-white/[0.02]">
                    <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center mr-2">
                      <User size={12} className="text-neutral-500" />
                    </div>
                    <span className="text-[10px] font-bold text-white">BarberSuite</span>
                  </div>
                  
                  {/* Body */}
                  <div className="flex-1 p-3 flex flex-col justify-end bg-neutral-950">
                    <div className="bg-blue-500 p-3 rounded-2xl rounded-br-sm text-[11px] text-white self-end max-w-[90%] leading-relaxed shadow-lg">
                      Escreva sua mensagem ao lado para ver como ela aparecerá na tela do cliente.
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-neutral-800 bg-[#030303] flex justify-end gap-4">
              <button onClick={() => setIsFormOpen(false)} className="btn-outline px-6 py-2 text-xs">Cancelar</button>
              <button className="btn-neon px-8 py-2 text-xs flex items-center gap-2">
                <Send size={14} /> Disparar Campanha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
