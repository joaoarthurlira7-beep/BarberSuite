'use client'

import { useState } from 'react'
import { MessageSquare, Users, TrendingUp, Settings2, Power, Edit3 } from 'lucide-react'

// --- Mock Data ---
const KPIs = [
  { label: 'Automações Ativas', value: '3', icon: Settings2, color: 'text-blue-400' },
  { label: 'Mensagens Mês', value: '47', icon: MessageSquare, color: 'text-purple-400' },
  { label: 'Clientes Recuperados', value: '11', icon: TrendingUp, color: 'text-green-400' },
]

const AUTOMATIONS = [
  { id: 1, name: 'Sentimos sua Falta', trigger: 'Sem visita há 30 dias', msg: 'Olá {nome}, faz 30 dias desde seu último corte. Que tal agendar um horário hoje?', channel: 'SMS', sent: 47, opened: 31, active: true },
  { id: 2, name: 'Oferta Especial', trigger: 'Sem visita há 60 dias', msg: 'A {estabelecimento} sente sua falta! Agende hoje e ganhe 15% OFF usando o código VOLTA15.', channel: 'SMS', sent: 22, opened: 12, active: true },
  { id: 3, name: 'Última Chance', trigger: 'Sem visita há 90 dias', msg: '{nome}, última chamada! Venha nos visitar e o café/cerveja é por nossa conta.', channel: 'SMS', sent: 8, opened: 2, active: false },
]

export default function AutomationsPage() {
  const [autos, setAutos] = useState(AUTOMATIONS)

  const toggleAuto = (id: number) => {
    setAutos(autos.map(a => a.id === id ? { ...a, active: !a.active } : a))
  }

  return (
    <div className="flex flex-col gap-8 p-6 min-h-full" style={{ background: '#06080f' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white uppercase tracking-tight">
            Automações de <span className="text-[#00ff66]">Retorno</span>
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(200,207,224,0.6)' }}>
            Engaje clientes inativos automaticamente e recupere faturamento.
          </p>
        </div>
        <button className="btn-neon text-xs py-2">
          + Nova Automação
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Automation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {autos.map(auto => (
          <div key={auto.id} className="premium-card flex flex-col transition-all duration-300" style={{ opacity: auto.active ? 1 : 0.6, borderColor: auto.active ? 'rgba(160,185,255,0.2)' : 'rgba(160,185,255,0.05)' }}>
            
            <div className="p-5 border-b border-white/5 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">{auto.name}</h3>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-widest text-[#00ff66] bg-[#00ff66]/10 px-2 py-0.5 rounded">
                  {auto.trigger}
                </span>
              </div>
              <button 
                onClick={() => toggleAuto(auto.id)}
                className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${auto.active ? 'bg-green-500' : 'bg-neutral-600'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${auto.active ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-xs text-neutral-300 font-mono italic leading-relaxed">"{auto.msg}"</p>
              </div>

              <div className="flex justify-between items-center mt-auto">
                <div className="flex gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold">Enviadas</span>
                    <span className="text-white font-bold">{auto.sent}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold">Abertas</span>
                    <span className="text-white font-bold">{auto.opened}</span>
                  </div>
                </div>
                <button className="text-xs text-[#00ff66] flex items-center gap-1 hover:underline">
                  <Edit3 size={12} /> Editar
                </button>
              </div>
            </div>

          </div>
        ))}

        {/* Create New Card */}
        <div className="premium-card flex flex-col items-center justify-center p-8 border-dashed cursor-pointer hover:border-[#00ff66]/30 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-neutral-500 group-hover:text-[#00ff66] group-hover:bg-[#00ff66]/10 transition-colors mb-4">
            <Settings2 size={24} />
          </div>
          <h3 className="text-white font-bold">Criar Regra Personalizada</h3>
          <p className="text-xs text-neutral-500 mt-2 text-center">Configure gatilhos baseados no comportamento do cliente.</p>
        </div>
      </div>
    </div>
  )
}
