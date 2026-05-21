'use client'

import { Cake, MessageSquare, Save, User, Calendar, Phone, Gift, ToggleRight } from 'lucide-react'

// --- Mock Data ---
const KPIs = [
  { label: 'Aniversariantes Hoje', value: '2', icon: Cake, color: 'text-[#00ff66]' },
  { label: 'Este Mês', value: '18', icon: Calendar, color: 'text-blue-400' },
  { label: 'Mensagens Enviadas', value: '16', icon: MessageSquare, color: 'text-green-400' },
]

const TODAY_BIRTHDAYS = [
  { id: 1, name: 'Marcos T.', phone: '(62) 99876-5432', age: 34 },
  { id: 2, name: 'Lucas Pinheiro', phone: '(62) 99123-4567', age: 28 },
]

const MONTH_BIRTHDAYS = [
  { id: 3, name: 'Rafael Andrade Mendes', date: '25/05', daysLeft: 4, phone: '(62) 98480-4310' },
  { id: 4, name: 'João Silva', date: '28/05', daysLeft: 7, phone: '(62) 98765-4321' },
  { id: 5, name: 'Carlos Eduardo Souza', date: '30/05', daysLeft: 9, phone: '(11) 97777-8888' },
]

export default function BirthdaysPage() {
  return (
    <div className="flex flex-col gap-8 p-6 min-h-full" style={{ background: '#06080f' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white uppercase tracking-tight">
            <span className="text-[#00ff66]">Aniversariantes</span> do Mês
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(200,207,224,0.6)' }}>
            Fidelize clientes enviando mensagens de parabéns e presentes especiais.
          </p>
        </div>
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Lists */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Today */}
          <div className="premium-card flex flex-col" style={{ borderColor: 'rgba(212,175,55,0.3)', boxShadow: '0 0 20px rgba(212,175,55,0.05)' }}>
            <div className="p-6 border-b border-white/5 flex items-center gap-2">
              <Cake className="text-[#00ff66]" size={20} />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Aniversariantes de Hoje</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {TODAY_BIRTHDAYS.map(client => (
                <div key={client.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00ff66]/20 border border-[#00ff66]/30 flex items-center justify-center flex-shrink-0 text-[#00ff66] font-bold text-sm">
                      {client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{client.name}</h3>
                      <p className="text-xs text-neutral-400 flex items-center gap-1"><Phone size={10} /> {client.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-neon flex-1 text-[10px] py-2 px-0 justify-center">
                      <MessageSquare size={12} className="mr-1" /> SMS
                    </button>
                    <button className="btn-outline flex-1 text-[10px] py-2 px-0 justify-center text-neutral-400">
                      Ligar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* This Month */}
          <div className="premium-card flex flex-col">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Próximos este Mês</h2>
            </div>
            <div className="p-0">
              <table className="w-full text-left">
                <tbody className="divide-y divide-white/5">
                  {MONTH_BIRTHDAYS.map(client => (
                    <tr key={client.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 w-16">
                        <div className="bg-white/5 border border-white/10 rounded text-center px-2 py-1">
                          <span className="block text-xs text-neutral-500 uppercase font-bold tracking-widest leading-none mb-1">Mai</span>
                          <span className="block text-lg font-bold text-white leading-none">{client.date.split('/')[0]}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-white">{client.name}</p>
                        <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5"><Phone size={10} /> {client.phone}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                          Faltam {client.daysLeft} dias
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Automation Config */}
        <div className="premium-card p-6 flex flex-col gap-6 h-fit">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <MessageSquare className="text-[#00ff66]" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Mensagem Automática</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Envio Automático via SMS</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">Dispara às 09:00 do dia</p>
            </div>
            <ToggleRight size={32} className="text-[#00ff66] cursor-pointer" />
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-xl mt-2 relative">
            <div className="absolute top-2 right-3 text-[10px] text-neutral-500 font-mono">110/160</div>
            <p className="text-xs text-neutral-300 font-mono leading-relaxed">
              "Feliz Aniversário, <span className="text-[#00ff66]">{'<nome>'}</span>! 🎂 A BarberSuite tem um presente especial para vc: <span className="text-green-400">{'<desconto>'}</span>% de desconto no seu prox. corte. Mostre esta msg!"
            </p>
          </div>
          <button className="text-xs text-[#00ff66] font-bold uppercase tracking-wider hover:underline text-left">Editar Mensagem</button>

          <div className="border-t border-white/5 pt-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Desconto Oferecido</label>
            <div className="flex items-center gap-2">
              <input type="number" defaultValue={20} className="premium-input w-20 text-center" />
              <span className="text-white font-bold">%</span>
            </div>
          </div>

          <button className="btn-neon w-full justify-center mt-2">
            <Save size={16} /> Salvar Automação
          </button>
        </div>

      </div>
    </div>
  )
}
