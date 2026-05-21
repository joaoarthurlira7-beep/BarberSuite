'use client'

import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Scissors } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Mock Data
const MOCK_BARBERS = [
  { id: '1', name: 'José Shaper' },
  { id: '2', name: 'Carlos Barber' },
]

const MOCK_APPOINTMENTS = [
  { id: '1', barber_id: '1', client_name: 'Carlos Silva', time: '09:00', duration: 45, service: 'Fade Clássico', status: 'confirmed' },
  { id: '2', barber_id: '2', client_name: 'Rafael Souza', time: '10:00', duration: 30, service: 'Ritual de Barba', status: 'completed' },
  { id: '3', barber_id: '1', client_name: 'Lucas Mendes', time: '11:00', duration: 90, service: 'Full Experience', status: 'pending' },
  { id: '4', barber_id: '2', client_name: 'Thiago Alves', time: '13:00', duration: 40, service: 'Barboterapia', status: 'confirmed' },
]

const TIME_SLOTS = Array.from({ length: 27 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour.toString().padStart(2, '0')}:${minute}`
})

export default function AppointmentsPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePrevDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const handleNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'border-blue-500 bg-blue-500/10'
      case 'completed': return 'border-green-500 bg-green-500/10'
      case 'pending': return 'border-[#ffffff] bg-[#ffffff]/10'
      default: return 'border-neutral-700 bg-neutral-800'
    }
  }

  return (
    <div className="p-6 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-tight text-white">
            Agenda
          </h1>
          <div className="flex items-center gap-2 bg-neutral-900 rounded-lg p-1">
            <button onClick={handlePrevDay} className="p-1.5 hover:bg-neutral-800 rounded-md transition-colors text-white">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2 px-3 text-sm font-medium text-white">
              <CalendarIcon size={14} className="text-[#ffffff]" />
              {currentDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
            </div>
            <button onClick={handleNextDay} className="p-1.5 hover:bg-neutral-800 rounded-md transition-colors text-white">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-outline py-2 text-xs">Bloquear Horário</button>
          <button onClick={() => setIsModalOpen(true)} className="btn-neon py-2 text-xs">
            <Plus size={16} /> Novo Agendamento
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto bg-[#0a0a0a] rounded-xl border border-neutral-900 premium-card">
        <div className="flex min-w-[800px]">
          {/* Time Column */}
          <div className="w-20 flex-shrink-0 border-r border-neutral-800/50 bg-[#0a0a0a] sticky left-0 z-10">
            <div className="h-12 border-b border-neutral-800/50"></div> {/* Header spacer */}
            {TIME_SLOTS.map((time, idx) => (
              <div key={idx} className="h-16 relative border-b border-neutral-800/30">
                <span className="absolute -top-3 right-3 text-xs text-neutral-500 bg-[#0a0a0a] px-1">
                  {time}
                </span>
              </div>
            ))}
          </div>

          {/* Barber Columns */}
          {MOCK_BARBERS.map((barber) => (
            <div key={barber.id} className="flex-1 min-w-[250px] border-r border-neutral-800/50 relative">
              {/* Header */}
              <div className="h-12 border-b border-neutral-800/50 flex items-center justify-center sticky top-0 bg-[#0a0a0a] z-10">
                <span className="text-sm font-medium text-white flex items-center gap-2">
                  <User size={14} className="text-[#ffffff]" />
                  {barber.name}
                </span>
              </div>

              {/* Slots */}
              <div className="relative">
                {TIME_SLOTS.map((time, idx) => (
                  <div 
                    key={idx} 
                    className="h-16 border-b border-neutral-800/30 cursor-pointer hover:bg-neutral-800/20 transition-colors"
                    onClick={() => setIsModalOpen(true)}
                  ></div>
                ))}

                {/* Appointments Overlay */}
                {MOCK_APPOINTMENTS.filter(a => a.barber_id === barber.id).map((apt) => {
                  const [hours, minutes] = apt.time.split(':').map(Number)
                  const startIdx = (hours - 8) * 2 + (minutes === 30 ? 1 : 0)
                  const height = (apt.duration / 30) * 4 // 4rem = 64px = 1h-16 class
                  
                  return (
                    <div
                      key={apt.id}
                      className={`absolute left-1 right-1 rounded-md border-l-4 p-2 cursor-pointer hover:opacity-90 transition-opacity ${getStatusColor(apt.status)}`}
                      style={{
                        top: `${startIdx * 4}rem`,
                        height: `${height}rem`,
                      }}
                    >
                      <p className="text-xs font-bold text-white truncate">{apt.time} - {apt.client_name}</p>
                      <p className="text-[10px] text-neutral-300 truncate mt-0.5">{apt.service}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Basic Modal Implementation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="premium-card w-full max-w-md p-6 relative">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-white uppercase mb-4">Novo Agendamento</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Cliente</label>
                <input type="text" className="premium-input w-full" placeholder="Nome do cliente" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Barbeiro</label>
                  <select className="premium-input w-full appearance-none">
                    {MOCK_BARBERS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Serviço</label>
                  <select className="premium-input w-full appearance-none">
                    <option>Fade Clássico</option>
                    <option>Ritual de Barba</option>
                  </select>
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
