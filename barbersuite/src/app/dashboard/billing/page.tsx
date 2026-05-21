'use client'

import { useState, useEffect } from 'react'
import { Check, CreditCard, ArrowRight, ShieldCheck, Download } from 'lucide-react'
import { formatCurrency, getDaysUntilTrialEnd, getPlanColor } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

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
  const [plan, setPlan] = useState<string>('trial')
  const [planStatus, setPlanStatus] = useState<string>('trial')
  const [trialEnds, setTrialEnds] = useState<string>(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBilling() {
      try {
        const isDemoMode = document.cookie.includes('demo-mode=true')
        
        if (isDemoMode) {
          setPlan('pro')
          setPlanStatus('active')
          setTrialEnds(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString())
          return
        }

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: barbershop } = await supabase
          .from('barbershops')
          .select('plan, plan_status, trial_ends_at')
          .eq('owner_id', user.id)
          .maybeSingle()

        if (barbershop) {
          setPlan(barbershop.plan || 'trial')
          setPlanStatus(barbershop.plan_status || 'trial')
          setTrialEnds(barbershop.trial_ends_at || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString())
        }
      } catch (err) {
        console.error('Error loading billing info:', err)
      } finally {
        setLoading(false)
      }
    }
    loadBilling()
  }, [])

  const handleUpgrade = async (planId: string) => {
    setLoadingPlan(planId)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Erro ao processar o upgrade.')
        setLoadingPlan(null)
      }
    } catch (err) {
      console.error(err)
      alert('Erro de conexão ao processar o upgrade.')
      setLoadingPlan(null)
    }
  }

  const daysLeft = getDaysUntilTrialEnd(trialEnds)

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto w-full flex items-center justify-center min-h-[400px]">
        <div className="text-[#ffffff] animate-pulse">Carregando dados de faturamento...</div>
      </div>
    )
  }

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
                {plan === 'trial' ? 'Trial Gratuito' : plan}
              </span>
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest"
                style={{ 
                  backgroundColor: `${getPlanColor(plan)}20`,
                  color: getPlanColor(plan)
                }}
              >
                {planStatus === 'trial' ? 'Período de Teste' : planStatus === 'active' ? 'Ativo' : planStatus}
              </span>
            </div>

            {plan === 'trial' ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-2">
                    <span>Tempo restante:</span>
                    <span className="font-bold text-white">{daysLeft > 0 ? daysLeft : 0} dias</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#ffffff] to-[#ccffea]" 
                      style={{ width: `${Math.min(100, Math.max(0, ((14 - daysLeft) / 14) * 100))}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Seu período de teste acaba em {new Date(trialEnds).toLocaleDateString('pt-BR')}. Escolha um plano ao lado para não perder o acesso.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-2xl text-white font-bold">
                  R$ {plan === 'basic' ? '99' : plan === 'pro' ? '199' : '399'}
                  <span className="text-sm font-normal text-neutral-500">/mês</span>
                </p>
                <p className="text-[11px] text-neutral-500">
                  Período atual estende-se até {new Date(trialEnds).toLocaleDateString('pt-BR')}.
                </p>
                
                <button 
                  onClick={() => alert('Redirecionando para o Portal do Cliente Stripe... (Funcionalidade real integrada via Customer Portal em produção)')}
                  className="btn-outline w-full justify-center py-2 text-xs"
                >
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
            {PLANS.map((p) => (
              <div 
                key={p.id} 
                className={`premium-card p-6 relative flex flex-col transition-all ${p.recommended ? 'border-[#ffffff]/30 shadow-[0_0_30px_rgba(255, 255, 255,0.1)] transform md:-translate-y-2' : ''}`}
              >
                {p.recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#ffffff] text-black text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                    Recomendado
                  </div>
                )}
                
                <h3 className="font-[family-name:var(--font-display)] text-xl text-white uppercase tracking-wide mb-1">{p.name}</h3>
                <p className="text-neutral-500 text-xs h-10">{p.description}</p>
                
                <div className="my-6">
                  <span className="text-3xl font-bold text-white">R$ {p.price}</span>
                  <span className="text-neutral-500 text-xs">/mês</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-300">
                      <Check size={16} className="text-[#ffffff] mt-0.5 flex-shrink-0" />
                      <span className="text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleUpgrade(p.id)}
                  disabled={loadingPlan === p.id || plan === p.id}
                  className={`w-full py-2.5 text-xs rounded-full font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
                    ${plan === p.id 
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700' 
                      : p.recommended 
                        ? 'bg-gradient-to-r from-[#ffffff] to-[#d1d5db] text-black hover:shadow-[0_0_20px_rgba(255, 255, 255,0.4)]' 
                        : 'bg-transparent border border-neutral-700 text-white hover:border-white hover:bg-white/5'
                    }`}
                >
                  {loadingPlan === p.id ? (
                    <span className="animate-pulse">Processando...</span>
                  ) : plan === p.id ? (
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
                  {plan === 'trial' ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                        Você ainda não possui faturas. Seu trial de 14 dias está ativo.
                      </td>
                    </tr>
                  ) : (
                    <tr className="hover:bg-neutral-900/30 transition-colors">
                      <td className="px-6 py-4">{new Date().toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 text-white">Plano {plan.toUpperCase()} (Mensal)</td>
                      <td className="px-6 py-4">R$ {plan === 'basic' ? '99,00' : plan === 'pro' ? '199,00' : '399,00'}</td>
                      <td className="px-6 py-4">
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest bg-green-500/10 text-green-500">Pago</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => alert('Download do PDF da Fatura... (Disponível em produção através do portal de faturamento Stripe)')}
                          className="text-neutral-500 hover:text-white transition-colors inline-flex"
                        >
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

