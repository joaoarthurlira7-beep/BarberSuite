'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Edit2, Trash2, Instagram, Phone, Clock, DollarSign, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'

// ─── Team Mock Data ────────────────────────────────────────────────────────────
const MOCK_TEAM = [
  { 
    id: '1', 
    name: 'José Shaper', 
    role: 'Proprietário & Barbeiro', 
    bio: 'Com uma paixão inabalável pela precisão, combina técnicas tradicionais com um olhar moderno.', 
    photo: 'https://images.unsplash.com/photo-1593702288056-ccde39692473?w=400&q=80',
    instagram: '@joseshaper',
    phone: '62999999999',
    color: '#ffffff',
    is_active: true
  },
  { 
    id: '2', 
    name: 'Carlos Barber', 
    role: 'Especialista em Visagismo', 
    bio: 'Especialista em visagismo e estilos clássicos com precisão absoluta. Mais de 5 anos de experiência.', 
    photo: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80',
    instagram: '@pablobarber',
    phone: '62888888888',
    color: '#3b82f6',
    is_active: true
  },
]

// ─── Commission Mock Data ──────────────────────────────────────────────────────
type CommissionStatus = 'Pago' | 'Pendente'

interface CommissionRow {
  id: string
  barber: string
  atendimentos: number
  faturamentoBruto: number
  percentualComissao: number
  status: CommissionStatus
}

const COMMISSION_DATA: Record<string, CommissionRow[]> = {
  'Este Mês': [
    { id: '1', barber: 'José Shaper',  atendimentos: 98,  faturamentoBruto: 6370,  percentualComissao: 50, status: 'Pendente' },
    { id: '2', barber: 'Carlos Barber', atendimentos: 74,  faturamentoBruto: 4810,  percentualComissao: 45, status: 'Pendente' },
    { id: '3', barber: 'Rafael Nunes', atendimentos: 52,  faturamentoBruto: 3380,  percentualComissao: 40, status: 'Pago'     },
  ],
  'Semana Passada': [
    { id: '1', barber: 'José Shaper',  atendimentos: 24,  faturamentoBruto: 1560,  percentualComissao: 50, status: 'Pago'     },
    { id: '2', barber: 'Carlos Barber', atendimentos: 19,  faturamentoBruto: 1235,  percentualComissao: 45, status: 'Pago'     },
    { id: '3', barber: 'Rafael Nunes', atendimentos: 13,  faturamentoBruto: 845,   percentualComissao: 40, status: 'Pago'     },
  ],
  'Mês Passado': [
    { id: '1', barber: 'José Shaper',  atendimentos: 104, faturamentoBruto: 6760,  percentualComissao: 50, status: 'Pago'     },
    { id: '2', barber: 'Carlos Barber', atendimentos: 81,  faturamentoBruto: 5265,  percentualComissao: 45, status: 'Pago'     },
    { id: '3', barber: 'Rafael Nunes', atendimentos: 59,  faturamentoBruto: 3835,  percentualComissao: 40, status: 'Pago'     },
  ],
}

const PERIODS = ['Este Mês', 'Semana Passada', 'Mês Passado'] as const
type Period = typeof PERIODS[number]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function TeamPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [period, setPeriod] = useState<Period>('Este Mês')
  const [commissions, setCommissions] = useState(COMMISSION_DATA)

  const rows = commissions[period]
  const totalPayable = rows
    .filter((r) => r.status === 'Pendente')
    .reduce((sum, r) => sum + (r.faturamentoBruto * r.percentualComissao) / 100, 0)
  const totalGross = rows.reduce((sum, r) => sum + r.faturamentoBruto, 0)

  const handleMarkPaid = (id: string) => {
    setCommissions((prev) => ({
      ...prev,
      [period]: prev[period].map((r) =>
        r.id === id ? { ...r, status: 'Pago' as CommissionStatus } : r
      ),
    }))
  }

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl uppercase tracking-tight text-white">
            Equipe
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Gerencie os profissionais da sua barbearia.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-neon py-2 text-xs">
          <Plus size={16} /> Adicionar Barbeiro
        </button>
      </div>

      {/* ── Team Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_TEAM.map((member) => (
          <div key={member.id} className="premium-card p-6 relative overflow-hidden group">
            {/* Color Accent line */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: member.color }} />
            
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-md transition-colors bg-[#0a0a0a]">
                <Edit2 size={14} />
              </button>
              <button className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors bg-[#0a0a0a]">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              {/* Photo */}
              <div className="relative w-24 h-24 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-neutral-800" />
                <div className="absolute inset-1 rounded-full overflow-hidden">
                  <Image 
                    src={member.photo} 
                    alt={member.name} 
                    fill 
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                    unoptimized
                  />
                </div>
                <div 
                  className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-[#1a1a1a] shadow-lg"
                  style={{ backgroundColor: member.color }}
                />
              </div>

              <h3 className="font-[family-name:var(--font-display)] text-xl text-white tracking-wide">{member.name}</h3>
              <p className="text-[#ffffff] text-xs font-bold uppercase tracking-widest mt-1 mb-4">{member.role}</p>
              
              <p className="text-neutral-400 text-sm mb-6 line-clamp-3">
                {member.bio}
              </p>

              {/* Social/Contact */}
              <div className="flex items-center gap-4 pt-4 border-t border-neutral-800/50 w-full justify-center">
                {member.instagram && (
                  <a href={`https://instagram.com/${member.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-[#ffffff] transition-colors">
                    <Instagram size={18} />
                  </a>
                )}
                {member.phone && (
                  <a href={`https://wa.me/55${member.phone}`} target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-[#25D366] transition-colors">
                    <Phone size={18} />
                  </a>
                )}
                <button className="text-neutral-500 hover:text-white transition-colors" title="Horários de trabalho">
                  <Clock size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════
          COMISSÕES DO PERÍODO
      ════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-6">
        {/* Section header + period tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl uppercase tracking-wide text-white">
              Comissões do Período
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(200,207,224,0.5)' }}>
              Repasses e status de pagamento por barbeiro.
            </p>
          </div>

          {/* Period tabs */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: 'rgba(10,14,26,0.85)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200"
                style={
                  period === p
                    ? { background: '#ffffff', color: '#030303' }
                    : { color: 'rgba(200,207,224,0.5)' }
                }
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Commission Table */}
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Barbeiro', 'Atendimentos', 'Fat. Bruto', '% Comissão', 'Valor a Receber', 'Status', 'Ação'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 text-[10px] uppercase font-bold tracking-widest whitespace-nowrap"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const valorComissao = (row.faturamentoBruto * row.percentualComissao) / 100
                  const isPago = row.status === 'Pago'
                  return (
                    <tr
                      key={row.id}
                      className="transition-colors duration-200 hover:bg-white/[0.02]"
                      style={{
                        borderBottom: idx < rows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      }}
                    >
                      {/* Barbeiro */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: 'rgba(255, 255, 255,0.12)', color: '#ffffff', border: '1px solid rgba(255, 255, 255,0.25)' }}
                          >
                            {row.barber.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                          <span className="text-white font-medium">{row.barber}</span>
                        </div>
                      </td>

                      {/* Atendimentos */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-white">{row.atendimentos}</span>
                        <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>atend.</span>
                      </td>

                      {/* Fat. Bruto */}
                      <td className="px-6 py-4 font-medium" style={{ color: 'rgba(200,207,224,0.8)' }}>
                        {fmt(row.faturamentoBruto)}
                      </td>

                      {/* % Comissão */}
                      <td className="px-6 py-4">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-bold"
                          style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }}
                        >
                          {row.percentualComissao}%
                        </span>
                      </td>

                      {/* Valor a Receber */}
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold" style={{ color: '#ffffff' }}>
                          {fmt(valorComissao)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-bold"
                          style={
                            isPago
                              ? { background: '#22c55e1a', color: '#22c55e', border: '1px solid #22c55e33' }
                              : { background: '#f59e0b1a', color: '#f59e0b', border: '1px solid #f59e0b33' }
                          }
                        >
                          {isPago ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                          {row.status}
                        </span>
                      </td>

                      {/* Ação */}
                      <td className="px-6 py-4">
                        {isPago ? (
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>—</span>
                        ) : (
                          <button
                            onClick={() => handleMarkPaid(row.id)}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105"
                            style={{
                              background: 'rgba(34,197,94,0.1)',
                              color: '#22c55e',
                              border: '1px solid rgba(34,197,94,0.25)',
                            }}
                          >
                            Marcar como Pago
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Gross */}
          <div
            className="premium-card p-5 flex items-center gap-4"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}
            >
              <TrendingUp size={18} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Faturamento Total
              </p>
              <p className="text-lg font-bold text-white">{fmt(totalGross)}</p>
            </div>
          </div>

          {/* Total Commissions */}
          <div className="premium-card p-5 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255, 255, 255,0.1)', border: '1px solid rgba(255, 255, 255,0.25)' }}
            >
              <DollarSign size={18} style={{ color: '#ffffff' }} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Total em Comissões
              </p>
              <p className="text-lg font-bold" style={{ color: '#ffffff' }}>
                {fmt(rows.reduce((s, r) => s + (r.faturamentoBruto * r.percentualComissao) / 100, 0))}
              </p>
            </div>
          </div>

          {/* Pending Payout */}
          <div
            className="premium-card p-5 flex items-center gap-4"
            style={totalPayable > 0 ? { border: '1px solid rgba(245,158,11,0.25)' } : {}}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={
                totalPayable > 0
                  ? { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }
                  : { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }
              }
            >
              {totalPayable > 0
                ? <AlertCircle size={18} style={{ color: '#f59e0b' }} />
                : <CheckCircle size={18} style={{ color: '#22c55e' }} />
              }
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                A Pagar (Pendente)
              </p>
              <p
                className="text-lg font-bold"
                style={{ color: totalPayable > 0 ? '#f59e0b' : '#22c55e' }}
              >
                {totalPayable > 0 ? fmt(totalPayable) : 'Tudo quitado ✓'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="premium-card w-full max-w-lg p-6">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-white uppercase mb-6">Adicionar Barbeiro</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center cursor-pointer hover:border-[#ffffff] transition-colors">
                  <Plus size={24} className="text-neutral-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Foto de Perfil</label>
                  <p className="text-xs text-neutral-400">Clique para fazer upload (JPG/PNG até 2MB).</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Nome</label>
                  <input type="text" className="premium-input w-full" placeholder="Ex: José Shaper" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Cargo</label>
                  <input type="text" className="premium-input w-full" placeholder="Ex: Barbeiro Senior" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Biografia</label>
                <textarea className="premium-input w-full resize-none h-20" placeholder="Breve resumo sobre a especialidade do profissional..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Instagram (opcional)</label>
                  <input type="text" className="premium-input w-full" placeholder="@usuario" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">WhatsApp (opcional)</label>
                  <input type="text" className="premium-input w-full" placeholder="62999999999" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Cor no Calendário</label>
                <div className="flex gap-2">
                  {['#ffffff', '#3b82f6', '#22c55e', '#8b5cf6', '#ec4899', '#f97316'].map(color => (
                    <button key={color} className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white transition-all focus:border-white focus:outline-none" style={{ backgroundColor: color }} />
                  ))}
                  <input type="color" className="w-8 h-8 rounded-full border-0 p-0 cursor-pointer overflow-hidden" defaultValue="#ffffff" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="btn-outline flex-1 justify-center py-2 text-xs">Cancelar</button>
              <button onClick={() => setIsModalOpen(false)} className="btn-neon flex-1 justify-center py-2 text-xs">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
