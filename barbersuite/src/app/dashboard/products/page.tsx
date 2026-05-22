'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, Package, AlertTriangle, ShieldCheck, DollarSign, ShieldAlert, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [barbershopId, setBarbershopId] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Search
  const [searchQuery, setSearchQuery] = useState('')

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  
  const [formName, setFormName] = useState('')
  const [formSku, setFormSku] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formStockQty, setFormStockQty] = useState('')
  const [formLowStockAlert, setFormLowStockAlert] = useState('')
  const [formSupplier, setFormSupplier] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const isDemo = document.cookie.includes('demo-mode=true')
    setIsDemoMode(isDemo)
    fetchBarbershop(isDemo)
  }, [])

  useEffect(() => {
    if (barbershopId) {
      fetchProducts(barbershopId)
    }
  }, [barbershopId])

  const fetchBarbershop = async (isDemo: boolean) => {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    let shopId = null

    if (userData?.user) {
      const { data: shop } = await supabase
        .from('barbershops')
        .select('id')
        .eq('owner_id', userData.user.id)
        .single()

      if (shop) {
        shopId = shop.id
      }
    } else if (isDemo) {
      const { data: shop } = await supabase
        .from('barbershops')
        .select('id')
        .eq('slug', 'barbearia-suite')
        .single()
      if (shop) {
        shopId = shop.id
      }
    }

    if (shopId) {
      setBarbershopId(shopId)
    } else {
      setLoading(false)
      if (isDemo) {
        loadMockData()
      }
    }
  }

  const fetchProducts = async (shopId: string) => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barbershop_id', shopId)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching products:', error)
      if (isDemoMode) loadMockData()
    } else if (data && data.length > 0) {
      setProducts(data)
    } else {
      if (isDemoMode) {
        loadMockData()
      } else {
        setProducts([])
      }
    }
    setLoading(false)
  }

  const loadMockData = () => {
    setProducts([
      { id: '1', name: 'Pomada Modeladora Efeito Matte', sku: 'POM-MAT-01', price: 45.00, stock_qty: 12, low_stock_alert: 5, category: 'Finalizador', supplier: 'BarberBrand Co.' },
      { id: '2', name: 'Óleo Hidratante para Barba Premium', sku: 'OL-BRB-02', price: 65.00, stock_qty: 3, low_stock_alert: 5, category: 'Tratamento', supplier: 'BeardCare Ltd.' },
      { id: '3', name: 'Shampoo Forte Anticaspa 250ml', sku: 'SHA-ANT-03', price: 55.00, stock_qty: 8, low_stock_alert: 4, category: 'Cabelo', supplier: 'Loreal Expert' },
      { id: '4', name: 'Cera Modeladora Strong Hold 100g', sku: 'CER-STR-04', price: 48.00, stock_qty: 0, low_stock_alert: 3, category: 'Finalizador', supplier: 'BarberBrand Co.' },
    ])
  }

  const handleCreateClick = () => {
    setEditingProduct(null)
    setFormName('')
    setFormSku('')
    setFormCategory('')
    setFormPrice('')
    setFormStockQty('')
    setFormLowStockAlert('3')
    setFormSupplier('')
    setFormError('')
    setIsModalOpen(true)
  }

  const handleEditClick = (prod: any) => {
    setEditingProduct(prod)
    setFormName(prod.name || '')
    setFormSku(prod.sku || '')
    setFormCategory(prod.category || '')
    setFormPrice(String(prod.price || ''))
    setFormStockQty(String(prod.stock_qty || ''))
    setFormLowStockAlert(String(prod.low_stock_alert || '3'))
    setFormSupplier(prod.supplier || '')
    setFormError('')
    setIsModalOpen(true)
  }

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Tem certeza de que deseja excluir este produto?')) return

    if (isDemoMode && !barbershopId) {
      setProducts(products.filter(p => p.id !== id))
      return
    }

    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      if (barbershopId) fetchProducts(barbershopId)
    } catch (err: any) {
      console.error('Error deleting product:', err)
      alert('Erro ao excluir produto: ' + err.message)
    }
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!formName || !formPrice) {
      setFormError('Nome e Preço de Venda são obrigatórios.')
      return
    }

    const priceNum = parseFloat(formPrice)
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('O preço de venda deve ser um número positivo.')
      return
    }

    const stockNum = parseInt(formStockQty) || 0
    const lowStockNum = parseInt(formLowStockAlert) || 0

    const productPayload = {
      name: formName,
      sku: formSku || null,
      category: formCategory || 'Geral',
      price: priceNum,
      stock_qty: stockNum,
      low_stock_alert: lowStockNum,
      supplier: formSupplier || null,
      barbershop_id: barbershopId,
      is_active: true
    }

    if (isDemoMode && !barbershopId) {
      if (editingProduct) {
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productPayload } : p))
      } else {
        const newProd = {
          id: Math.random().toString(36).substr(2, 9),
          ...productPayload
        }
        setProducts([newProd, ...products])
      }
      setIsModalOpen(false)
      return
    }

    if (!barbershopId) {
      setFormError('Identificador da barbearia não encontrado. Verifique seu login.')
      return
    }

    setSaving(true)
    const supabase = createClient()
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProduct.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productPayload])

        if (error) throw error
      }
      await fetchProducts(barbershopId)
      setIsModalOpen(false)
    } catch (err: any) {
      console.error('Error saving product:', err)
      setFormError(err.message || 'Ocorreu um erro ao salvar o produto.')
    } finally {
      setSaving(false)
    }
  }

  const filteredProducts = products.filter(prod => 
    prod.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prod.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalItems = products.reduce((acc, p) => acc + (p.stock_qty || 0), 0)
  const lowStockCount = products.filter(p => (p.stock_qty || 0) > 0 && (p.stock_qty || 0) <= (p.low_stock_alert || 0)).length
  const outOfStockCount = products.filter(p => (p.stock_qty || 0) === 0).length
  const totalValue = products.reduce((acc, p) => acc + ((p.price || 0) * (p.stock_qty || 0)), 0)

  return (
    <div className="p-6 min-h-full" style={{ background: '#030303' }}>
      {/* Demo alert banner */}
      {isDemoMode && !barbershopId && (
        <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5 flex items-center gap-3">
          <ShieldAlert className="text-white shrink-0 animate-pulse" size={20} />
          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-wider">Modo de Demonstração Ativo</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">As alterações nos produtos serão mantidas temporariamente em cache local nesta sessão.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl uppercase tracking-tight text-white font-bold">
            Produtos & <span className="text-[#ffffff]">Estoque</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Gerencie seu catálogo de produtos para venda e consumo interno.</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Buscar produto por nome ou SKU..." 
              className="premium-input pl-9 py-2 text-sm w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={handleCreateClick} className="btn-neon py-2 text-xs whitespace-nowrap">
            <Plus size={16} /> Novo Produto
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-white" size={32} />
          <p className="text-sm text-neutral-400">Carregando catálogo de produtos...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Itens em Estoque', value: String(totalItems), icon: Package, color: '#3b82f6', desc: 'Unidades totais' },
              { label: 'Alerta Estoque Baixo', value: String(lowStockCount), icon: AlertTriangle, color: '#ffffff', desc: 'Abaixo do recomendado' },
              { label: 'Sem Estoque (Esgotado)', value: String(outOfStockCount), icon: AlertTriangle, color: '#ef4444', desc: 'Reabastecimento urgente' },
              { label: 'Valor do Estoque', value: formatCurrency(totalValue), icon: DollarSign, color: '#22c55e', desc: 'Preço de venda estimado' },
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

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => {
              const stock = prod.stock_qty ?? 0
              const lowStock = prod.low_stock_alert ?? 3
              const isOutOfStock = stock === 0
              const isLowStock = stock > 0 && stock <= lowStock
              
              return (
                <div 
                  key={prod.id} 
                  className={`premium-card p-5 relative overflow-hidden transition-all ${isOutOfStock ? 'border-red-500/20' : ''}`}
                >
                  {/* Action buttons */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button onClick={() => handleEditClick(prod)} className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-md transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteClick(prod.id)} className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="flex gap-2 mb-3">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-white/5 text-neutral-300 text-[9px] font-bold uppercase tracking-widest">
                      {prod.category}
                    </span>

                    {isOutOfStock && (
                      <span className="inline-block px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <AlertTriangle size={10} /> Esgotado
                      </span>
                    )}

                    {isLowStock && (
                      <span className="inline-block px-2.5 py-1 rounded-full bg-[#ffffff]/10 text-[#ffffff] text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 animate-pulse">
                        <AlertTriangle size={10} /> Estoque Baixo
                      </span>
                    )}
                    
                    {!isOutOfStock && !isLowStock && (
                      <span className="inline-block px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <ShieldCheck size={10} /> Regular
                      </span>
                    )}
                  </div>

                  <h3 className="font-[family-name:var(--font-display)] text-lg text-white mb-1 tracking-wide truncate pr-16">{prod.name}</h3>
                  <p className="text-neutral-600 text-[10px] font-mono mb-4">{prod.sku || 'SEM SKU'}</p>

                  <div className="pt-4 border-t border-neutral-800/50 flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-neutral-600 uppercase font-bold">Preço de Venda</span>
                      <span className="text-white font-bold">{formatCurrency(prod.price || 0)}</span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-neutral-600 uppercase font-bold">Quantidade</span>
                      <span className={`font-semibold ${isOutOfStock ? 'text-red-500 font-bold' : isLowStock ? 'text-[#ffffff]' : 'text-white'}`}>
                        {stock} / {lowStock} <span className="text-[9px] text-neutral-600 font-light">(mín)</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-[10px] text-neutral-500 flex justify-between">
                    <span>Fornecedor: {prod.supplier || 'Não informado'}</span>
                  </div>
                </div>
              )
            })}
            
            {filteredProducts.length === 0 && (
              <div className="col-span-full premium-card p-12 flex flex-col items-center justify-center text-center">
                <Package size={40} className="text-neutral-600 mb-3" />
                <h3 className="text-white font-semibold text-lg">Nenhum produto cadastrado</h3>
                <p className="text-neutral-500 text-sm mt-1 max-w-sm">Adicione novos itens no botão de &quot;Novo Produto&quot; para iniciar seu catálogo de estoque.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveProduct} className="premium-card w-full max-w-lg p-6">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-white uppercase mb-6 font-bold">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            
            {formError && (
              <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Nome do Produto *</label>
                  <input 
                    type="text" 
                    className="premium-input w-full" 
                    placeholder="Ex: Pomada Efeito Matte 100g"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Código SKU</label>
                  <input 
                    type="text" 
                    className="premium-input w-full" 
                    placeholder="Ex: POM-MAT-01"
                    value={formSku}
                    onChange={e => setFormSku(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Categoria</label>
                  <input 
                    type="text" 
                    className="premium-input w-full" 
                    placeholder="Ex: Finalizador, Shampoo"
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Preço de Venda (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    className="premium-input w-full" 
                    placeholder="45.00"
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Estoque Inicial</label>
                  <input 
                    type="number" 
                    min="0"
                    className="premium-input w-full" 
                    placeholder="10"
                    value={formStockQty}
                    onChange={e => setFormStockQty(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Qtd Mínima Alerta</label>
                  <input 
                    type="number" 
                    min="1"
                    className="premium-input w-full" 
                    placeholder="3"
                    value={formLowStockAlert}
                    onChange={e => setFormLowStockAlert(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-neutral-500 font-bold mb-1">Fornecedor</label>
                <input 
                  type="text" 
                  className="premium-input w-full" 
                  placeholder="Ex: Distribuidora BarberMax"
                  value={formSupplier}
                  onChange={e => setFormSupplier(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="btn-outline flex-1 justify-center py-2 text-xs"
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-neon flex-1 justify-center py-2 text-xs flex items-center gap-1"
                disabled={saving}
              >
                {saving && <Loader2 className="animate-spin" size={14} />}
                {editingProduct ? 'Salvar Alterações' : 'Salvar Produto'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

