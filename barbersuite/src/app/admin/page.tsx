import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Building2, Users, CreditCard, ShieldCheck, 
  ArrowUpRight, AlertCircle, Ban, Edit, ExternalLink,
  DollarSign, Activity, Settings, UserCheck
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function SuperAdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Segurança: Se não estiver logado, vai para login
  if (!user) {
    redirect('/login')
  }

  // Restrição de Segurança SaaS Master: Apenas o e-mail do dono da plataforma tem acesso
  const ADMIN_EMAIL = 'joaoarthurlira7@gmail.com'
  if (user.email !== ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  // Buscar todas as barbearias (tenants) cadastradas no banco real do Supabase
  const { data: barbershops, error: dbError } = await supabase
    .from('barbershops')
    .select('*')
    .order('created_at', { ascending: false })

  // Buscar contagem de usuários de autenticação (simulado/ou via query se aplicável)
  const totalBarbershops = barbershops?.length || 0
  const activeShops = barbershops?.filter(b => b.is_active).length || 0
  const trialShops = barbershops?.filter(b => b.plan === 'trial').length || 0
  const paidShops = barbershops?.filter(b => b.plan !== 'trial' && b.plan_status === 'active').length || 0

  // Cálculo de MRR Estimado (Faturamento Recorrente Mensal)
  // Basic = R$99, Pro = R$199, Enterprise = R$399
  const mrr = (barbershops || []).reduce((acc, shop) => {
    if (shop.plan_status !== 'active' && shop.plan_status !== 'trial') return acc
    if (shop.plan === 'basic') return acc + 99
    if (shop.plan === 'pro') return acc + 199
    if (shop.plan === 'enterprise') return acc + 399
    return acc
  }, 0)

  // Lista de logs recentes do sistema (inscrições reais ou mock se vazio)
  const recentLogs = (barbershops || []).slice(0, 5).map(shop => ({
    id: shop.id,
    event: `Nova Barbearia: "${shop.name}" cadastrada no plano ${shop.plan.toUpperCase()}`,
    time: new Date(shop.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    type: 'signup'
  }))

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-[#d4af37] selection:text-black text-white">
      {/* Super Admin Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 glass-dark border-b border-white/5 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span className="text-[#d4af37] text-2xl">👑</span>
          <span className="font-[family-name:var(--font-display)] text-lg tracking-tighter uppercase text-white font-bold">
            BARBER<span className="text-[#d4af37]">SUITE</span> <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded-full font-bold ml-2">MASTER ADMIN</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xs text-neutral-400 hover:text-white transition-colors border border-white/10 rounded-full px-4 py-1.5 bg-white/5">
            Ir para Meu Painel
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center font-bold text-xs text-red-400">
              A
            </div>
            <span className="text-xs font-semibold text-neutral-300 hidden sm:block">{user.email}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-12 flex flex-col gap-8">
        
        {/* Guard Informational Banner */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-3">
            <ShieldCheck size={24} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white">Painel do Dono da Plataforma (SaaS Master)</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-3xl">
                Esta página é restrita **exclusivamente a você**, o administrador geral do site. Aqui você pode monitorar todas as barbearias ativas que estão alugando o seu sistema, alterar planos manualmente, suspender acessos e ver a receita recorrente total do seu negócio.
              </p>
            </div>
          </div>
        </div>

        {/* Global SaaS KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Faturamento Mensal (MRR)', value: formatCurrency(mrr), icon: DollarSign, color: '#22c55e', desc: 'Soma de assinaturas ativas' },
            { label: 'Total Barbearias', value: String(totalBarbershops), icon: Building2, color: '#d4af37', desc: `${activeShops} ativas no sistema` },
            { label: 'Clientes Pagantes', value: String(paidShops), icon: CreditCard, color: '#3b82f6', desc: 'Fora do período Trial' },
            { label: 'Em Período Trial', value: String(trialShops), icon: Activity, color: '#8b5cf6', desc: '14 dias de teste grátis' },
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

        {/* Master Management Table */}
        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h3 className="font-[family-name:var(--font-display)] uppercase tracking-wide text-white text-sm font-bold">
                Gerenciar Barbearias Cadastradas
              </h3>
              <p className="text-xs text-neutral-500 mt-1">Lista completa de inquilinos (Tenants) alugando o sistema.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {barbershops && barbershops.length > 0 ? (
              <table className="w-full text-left text-sm text-neutral-400 border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                    <th className="pb-3">Barbearia / Estabelecimento</th>
                    <th className="pb-3">URL (Slug)</th>
                    <th className="pb-3">Plano Atual</th>
                    <th className="pb-3">Status Cobrança</th>
                    <th className="pb-3">Status Sistema</th>
                    <th className="pb-3 text-right">Ações de Administrador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/40">
                  {barbershops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-neutral-900/20 transition-colors">
                      <td className="py-4 font-medium text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#d4af37]/10 flex items-center justify-center font-bold text-[#d4af37] text-sm">
                            {shop.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold">{shop.name}</p>
                            <p className="text-[10px] text-neutral-500">Cidade: {shop.city || 'Não informada'} - {shop.state || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-mono text-neutral-400">
                        <a 
                          href={`/b/${shop.slug}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="hover:text-[#d4af37] transition-colors flex items-center gap-1 group"
                        >
                          /b/{shop.slug}
                          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </td>
                      <td className="py-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-white/5 text-neutral-300">
                          {shop.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          shop.plan_status === 'active' || shop.plan_status === 'trial'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {shop.plan_status === 'trial' ? 'Período Trial' : shop.plan_status === 'active' ? 'Pago / Ativo' : 'Atrasado / Cancelado'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          shop.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {shop.is_active ? 'Online' : 'Suspenso'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button className="text-[10px] uppercase font-bold text-neutral-400 hover:text-white px-2 py-1 border border-white/5 rounded bg-white/5 transition-colors flex items-center gap-1">
                            <Edit size={10} /> Alterar Plano
                          </button>
                          <button className={`text-[10px] uppercase font-bold px-2 py-1 border rounded transition-colors flex items-center gap-1 ${
                            shop.is_active 
                              ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' 
                              : 'border-green-500/20 text-green-400 hover:bg-green-500/10'
                          }`}>
                            <Ban size={10} /> {shop.is_active ? 'Bloquear' : 'Desbloquear'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 flex flex-col items-center justify-center">
                <Building2 className="text-neutral-700 mb-3" size={40} />
                <p className="text-sm text-neutral-400 font-medium">Nenhuma barbearia cadastrada no momento</p>
                <p className="text-xs text-neutral-600 mt-1 max-w-sm">Quando novos inquilinos finalizarem o fluxo de criação, eles aparecerão aqui instantaneamente.</p>
              </div>
            )}
          </div>
        </div>

        {/* Global SaaS System Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audit Logs */}
          <div className="premium-card p-6">
            <h3 className="font-[family-name:var(--font-display)] uppercase tracking-wide text-white text-sm font-bold mb-4 flex items-center gap-2">
              <Activity size={16} className="text-[#d4af37]" /> Log de Eventos do Sistema
            </h3>
            <div className="flex flex-col gap-3">
              {recentLogs.length > 0 ? (
                recentLogs.map((log, index) => (
                  <div key={index} className="p-3 rounded-lg bg-neutral-900/50 border border-white/5 flex justify-between items-center text-xs">
                    <span className="text-neutral-300 font-medium">{log.event}</span>
                    <span className="text-neutral-500 text-[10px] whitespace-nowrap ml-4">{log.time}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-600 italic">Nenhum evento registrado ainda.</p>
              )}
            </div>
          </div>

          {/* Pricing Controls */}
          <div className="premium-card p-6">
            <h3 className="font-[family-name:var(--font-display)] uppercase tracking-wide text-white text-sm font-bold mb-4 flex items-center gap-2">
              <Settings size={16} className="text-[#d4af37]" /> Configurações de Cobrança do SaaS
            </h3>
            <div className="space-y-4 text-xs text-neutral-300">
              <div className="flex justify-between items-center p-3 rounded-lg bg-neutral-900/30">
                <span>Plano Basic (Até 2 Profissionais)</span>
                <span className="font-bold text-white">R$ 99,00 / mês</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-neutral-900/30">
                <span>Plano Pro (Até 5 Profissionais)</span>
                <span className="font-bold text-white">R$ 199,00 / mês</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-neutral-900/30">
                <span>Plano Enterprise (Ilimitado)</span>
                <span className="font-bold text-white">R$ 399,00 / mês</span>
              </div>
              <p className="text-[10px] text-neutral-500 italic mt-2">
                Os planos e restrições são validados dinamicamente na criação de novos agendamentos e profissionais.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
