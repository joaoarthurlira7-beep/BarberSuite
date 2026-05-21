'use client'

import { useState } from 'react'
import { Check, CreditCard, ArrowRight, ShieldCheck, Download } from 'lucide-react'
import { formatCurrency, getDaysUntilTrialEnd, getPlanColor } from '@/lib/utils'

// Mock Data
const MOCK_PLAN = 'trial'
const MOCK_TRIAL_ENDS = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 99,
    description: 'Perfeito para barbearias em crescimento.',
    features: ['Até 2 barbeiros', 'Até 10 serviços', '200 agendamentos/mês', 'Página pública profissional', 'Suporte por email'],
    recommended: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 199,
    description: 'Para barbearias estabelecidas que querem mais.',
    features: ['Até 5 barbeiros', 'Até 30 serviços', '1.000 agendamentos/mês', 'Lembretes via WhatsApp', 'Relatórios financeiros detalhados', 'Suporte prioritário via chat'],
    recommended: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 399,
    description: 'Para grandes operações e redes de franquias.',
    features: ['Barbeiros ilimitados', 'Serviços ilimitados', 'Agendamentos ilimitados', 'Domínio próprio (suabarb.com.br)', 'Acesso a API', 'Gerente de sucesso dedicado'],
    recommended: false
  }
]

export default function BillingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleUpgrade = async (planId: string) => {
    setLoadingPlan(planId)
    // TODO: Call /api/stripe/checkout
    setTimeout(() => {
      setLoadingPlan(null)
      alert(`Redirecionando para o Stripe Checkout do plano ${planId.toUpperCase()}...`)
    }, 1500)
  }

  const daysLeft = getDaysUntilTrialEnd(MOCK_TRIAL_ENDS)

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl uppercase tracking-tight text-white">
          Plano e Faturamento
        </h1>
        <p className="text-neutral-500 text-sm mt-1">Gerencie sua assinatura, visualize faturas e faça upgrades.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Current Plan Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="premium-card p-6">
            <h2 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-4">Seu Plano Atual</h2>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-[family-name:var(--font-display)] font-bold text-white uppercase tracking-wide">
                {MOCK_PLAN === 'trial' ? 'Trial Gratuito' : MOCK_PLAN}
              </span>
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest"
                style={{ 
                  backgroundColor: `${getPlanColor(MOCK_PLAN)}20`,
                  color: getPlanColor(MOCK_PLAN)
                }}
              >
                {MOCK_PLAN === 'trial' ? 'Ativo' : 'Ativo'}
              </span>
            </div>

            {MOCK_PLAN === 'trial' ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-2">
                    <span>Tempo restante:</span>
                    <span className="font-bold text-white">{daysLeft} dias</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#d4af37] to-[#f0d98a]" 
                      style={{ width: `${((14 - daysLeft) / 14) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Seu período de teste acaba em {new Date(MOCK_TRIAL_ENDS).toLocaleDateString('pt-BR')}. Escolha um plano abaixo para não perder o acesso.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-2xl text-white font-bold">R$ 199<span className="text-sm font-normal text-neutral-500">/mês</span></p>
                <p className="text-[11px] text-neutral-500">Próxima cobrança em 05/11/2025.</p>
                
                <button className="btn-outline w-full justify-center py-2 text-xs">
                  Gerenciar no Stripe
                </button>
              </div>
            )}
          </div>

          <div className="premium-card p-6">
            <h2 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-4">Pagamento Seguro</h2>
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="text-green-500" size={24} />
              <p className="text-sm text-neutral-300">Todas as transações são criptografadas e processadas pela Stripe.</p>
            </div>
            <div className="flex gap-2 mt-4">
              {/* Fake CC icons */}
              <div className="h-6 w-10 bg-neutral-800 rounded flex items-center justify-center text-[8px] text-white font-bold border border-neutral-700">VISA</div>
              <div className="h-6 w-10 bg-neutral-800 rounded flex items-center justify-center text-[8px] text-white font-bold border border-neutral-700">MC</div>
              <div className="h-6 w-10 bg-neutral-800 rounded flex items-center justify-center text-[8px] text-white font-bold border border-neutral-700">PIX</div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Plans */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div 
                key={plan.id} 
                className={`premium-card p-6 relative flex flex-col transition-all ${plan.recommended ? 'border-[#d4af37]/30 shadow-[0_0_30px_rgba(212,175,55,0.1)] transform md:-translate-y-2' : ''}`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#d4af37] text-black text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                    Recomendado
                  </div>
                )}
                
                <h3 className="font-[family-name:var(--font-display)] text-xl text-white uppercase tracking-wide mb-1">{plan.name}</h3>
                <p className="text-neutral-500 text-xs h-10">{plan.description}</p>
                
                <div className="my-6">
                  <span className="text-3xl font-bold text-white">R$ {plan.price}</span>
                  <span className="text-neutral-500 text-xs">/mês</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-300">
                      <Check size={16} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
                      <span className="text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loadingPlan === plan.id || MOCK_PLAN === plan.id}
                  className={`w-full py-2.5 text-xs rounded-full font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
                    ${MOCK_PLAN === plan.id 
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700' 
                      : plan.recommended 
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#b8942f] text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]' 
                        : 'bg-transparent border border-neutral-700 text-white hover:border-white hover:bg-white/5'
                    }`}
                >
                  {loadingPlan === plan.id ? (
                    <span className="animate-pulse">Processando...</span>
                  ) : MOCK_PLAN === plan.id ? (
                    'Plano Atual'
                  ) : (
                    <>Fazer Upgrade <ArrowRight size={14} /></>
                  )}
                </button>
              </div>
            ))}
          </div>
          
          {/* Invoice History (Mock) */}
          <div className="mt-8">
            <h3 className="font-[family-name:var(--font-display)] text-lg text-white uppercase mb-4">Histórico de Faturas</h3>
            <div className="premium-card overflow-hidden">
              <table className="w-full text-left text-sm text-neutral-400">
                <thead className="bg-neutral-900/50 text-[10px] uppercase tracking-widest font-bold border-b border-neutral-800">
                  <tr>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Descrição</th>
                    <th className="px-6 py-3">Valor</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Fatura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {/* Empty state for trial users */}
                  {MOCK_PLAN === 'trial' ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                        Você ainda não possui faturas. Seu trial de 14 dias está ativo.
                      </td>
                    </tr>
                  ) : (
                    <tr className="hover:bg-neutral-900/30 transition-colors">
                      <td className="px-6 py-4">05/10/2025</td>
                      <td className="px-6 py-4 text-white">Plano Pro (Mensal)</td>
                      <td className="px-6 py-4">R$ 199,00</td>
                      <td className="px-6 py-4">
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest bg-green-500/10 text-green-500">Pago</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-neutral-500 hover:text-white transition-colors inline-flex">
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
