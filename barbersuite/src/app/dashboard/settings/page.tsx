'use client'

import { useState } from 'react'
import { Save, UploadCloud, Link as LinkIcon, Bell, Calendar, Store } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('geral')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl uppercase tracking-tight text-white">
            Configurações
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Personalize sua barbearia e preferências do sistema.</p>
        </div>
        
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="btn-neon py-2 text-xs w-full md:w-auto"
        >
          {isSaving ? 'Salvando...' : <><Save size={16} /> Salvar Alterações</>}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0">
            <button 
              onClick={() => setActiveTab('geral')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'geral' ? 'bg-[#00ff66]/10 text-[#00ff66]' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'}`}
            >
              <Store size={18} /> <span className="text-sm font-medium">Dados Gerais</span>
            </button>
            <button 
              onClick={() => setActiveTab('aparencia')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'aparencia' ? 'bg-[#00ff66]/10 text-[#00ff66]' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'}`}
            >
              <LinkIcon size={18} /> <span className="text-sm font-medium">Página Pública</span>
            </button>
            <button 
              onClick={() => setActiveTab('horarios')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'horarios' ? 'bg-[#00ff66]/10 text-[#00ff66]' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'}`}
            >
              <Calendar size={18} /> <span className="text-sm font-medium">Horários</span>
            </button>
            <button 
              onClick={() => setActiveTab('notificacoes')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'notificacoes' ? 'bg-[#00ff66]/10 text-[#00ff66]' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'}`}
            >
              <Bell size={18} /> <span className="text-sm font-medium">Notificações</span>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 premium-card p-6 md:p-8 min-h-[500px]">
          
          {activeTab === 'geral' && (
            <div className="space-y-6 animate-fade-in-up">
              <h2 className="font-[family-name:var(--font-display)] text-xl text-white uppercase mb-6 border-b border-neutral-800 pb-4">Informações da Barbearia</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Nome do Estabelecimento</label>
                  <input type="text" className="premium-input w-full" defaultValue="Vallen Barbearia" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Slug (URL)</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-neutral-800 bg-neutral-900 text-neutral-500 sm:text-sm">
                      barbersuite.com.br/b/
                    </span>
                    <input type="text" className="premium-input rounded-l-none flex-1 min-w-0" defaultValue="vallen" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">WhatsApp</label>
                  <input type="text" className="premium-input w-full" defaultValue="(62) 98480-4310" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Email Público</label>
                  <input type="email" className="premium-input w-full" defaultValue="contato@vallen.com" />
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-medium text-white mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Logradouro, Número, Complemento</label>
                    <input type="text" className="premium-input w-full" defaultValue="Avenida Transbrasiliana, 14" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Cidade</label>
                    <input type="text" className="premium-input w-full" defaultValue="Uruaçu" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">UF</label>
                    <input type="text" className="premium-input w-full" defaultValue="GO" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'aparencia' && (
            <div className="space-y-8 animate-fade-in-up">
              <h2 className="font-[family-name:var(--font-display)] text-xl text-white uppercase mb-6 border-b border-neutral-800 pb-4">Personalização</h2>
              
              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-2">Logo da Barbearia</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden">
                    <span className="text-[#00ff66] text-2xl font-bold">V</span>
                  </div>
                  <div>
                    <button className="btn-outline py-2 text-xs mb-2">
                      <UploadCloud size={16} /> Trocar Logo
                    </button>
                    <p className="text-[10px] text-neutral-500">Recomendado: PNG ou JPG, 500x500px.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-2">Imagem de Capa (Hero)</label>
                <div className="w-full h-32 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-col cursor-pointer hover:border-[#00ff66]/50 transition-colors">
                  <UploadCloud size={24} className="text-neutral-500 mb-2" />
                  <span className="text-xs text-neutral-400">Clique para fazer upload</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Slogan (Tagline)</label>
                  <input type="text" className="premium-input w-full" defaultValue="Precisão. Estilo." />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Cor Principal</label>
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-lg bg-[#00ff66] border border-neutral-700"></div>
                    <input type="text" className="premium-input flex-1 font-mono text-sm" defaultValue="#00ff66" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Sobre a Barbearia</label>
                <textarea className="premium-input w-full h-32 resize-none" placeholder="Conte a história da sua barbearia para aparecer na página pública..."></textarea>
              </div>
            </div>
          )}

          {activeTab === 'horarios' && (
            <div className="space-y-6 animate-fade-in-up">
              <h2 className="font-[family-name:var(--font-display)] text-xl text-white uppercase mb-6 border-b border-neutral-800 pb-4">Horário de Funcionamento</h2>
              
              <div className="space-y-3">
                {[
                  { id: 'seg', label: 'Segunda-feira', active: true, start: '08:00', end: '20:00' },
                  { id: 'ter', label: 'Terça-feira', active: true, start: '08:00', end: '20:00' },
                  { id: 'qua', label: 'Quarta-feira', active: true, start: '08:00', end: '20:00' },
                  { id: 'qui', label: 'Quinta-feira', active: true, start: '08:00', end: '20:00' },
                  { id: 'sex', label: 'Sexta-feira', active: true, start: '08:00', end: '20:00' },
                  { id: 'sab', label: 'Sábado', active: true, start: '08:00', end: '18:00' },
                  { id: 'dom', label: 'Domingo', active: false, start: '08:00', end: '12:00' },
                ].map((day) => (
                  <div key={day.id} className="flex items-center gap-4 p-3 rounded-lg bg-neutral-900/50 border border-neutral-800/50">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={day.active} className="sr-only peer" />
                      <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00ff66]"></div>
                    </label>
                    <span className="w-28 text-sm font-medium text-neutral-300">{day.label}</span>
                    
                    {day.active ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input type="time" defaultValue={day.start} className="premium-input px-2 py-1.5 text-sm w-24" />
                        <span className="text-neutral-500">até</span>
                        <input type="time" defaultValue={day.end} className="premium-input px-2 py-1.5 text-sm w-24" />
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-600 flex-1 italic">Fechado</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <div className="space-y-6 animate-fade-in-up">
              <h2 className="font-[family-name:var(--font-display)] text-xl text-white uppercase mb-6 border-b border-neutral-800 pb-4">Alertas e Notificações</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00ff66]"></div>
                    </label>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">Email de Confirmação</h3>
                    <p className="text-xs text-neutral-500 mt-1">Enviar email para o cliente confirmando o agendamento imediatamente.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00ff66]"></div>
                    </label>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">WhatsApp Lembrete <span className="bg-[#00ff66]/20 text-[#00ff66] text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">PRO</span></h3>
                    <p className="text-xs text-neutral-500 mt-1">Enviar mensagem automática no WhatsApp do cliente 2 horas antes do horário.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00ff66]"></div>
                    </label>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">Notificação de Novo Agendamento</h3>
                    <p className="text-xs text-neutral-500 mt-1">Receber um alerta no sistema a cada nova marcação.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
