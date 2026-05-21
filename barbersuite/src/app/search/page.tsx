'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, MapPin, Star, Scissors } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Mock Data
const MOCK_BARBERSHOPS = [
  {
    id: '1',
    name: 'Vallen Barbearia',
    slug: 'vallen',
    city: 'Uruaçu, GO',
    rating: 4.9,
    reviewsCount: 124,
    cover_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&q=80',
    services: ['Corte', 'Barba', 'Pigmentação'],
    priceRange: '$$'
  },
  {
    id: '2',
    name: 'The Vintage Barber',
    slug: 'vintage',
    city: 'Goiânia, GO',
    rating: 4.7,
    reviewsCount: 89,
    cover_url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80',
    services: ['Corte Clássico', 'Toalha Quente'],
    priceRange: '$$$'
  },
  {
    id: '3',
    name: 'Barba Forte Style',
    slug: 'barbaforte',
    city: 'Anápolis, GO',
    rating: 4.5,
    reviewsCount: 56,
    cover_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80',
    services: ['Corte Moderno', 'Sobrancelha'],
    priceRange: '$'
  }
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="border-b border-neutral-900 bg-[#0a0a0a] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Scissors className="text-[#d4af37]" size={24} />
            <span className="font-[family-name:var(--font-display)] text-xl tracking-tighter uppercase text-white font-bold hidden sm:block">
              Barber<span className="font-light opacity-60">Suite</span>
            </span>
          </Link>

          <div className="flex-1 max-w-xl mx-4 md:mx-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
              <input 
                type="text" 
                placeholder="Busque por barbearias, cidades ou bairros..." 
                className="premium-input w-full pl-12 py-3 rounded-full bg-neutral-900/50"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-neutral-400 hover:text-white transition-colors hidden sm:block">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="mb-10">
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-white uppercase tracking-tight mb-2">
            Descubra as melhores barbearias
          </h1>
          <p className="text-neutral-500">Agende seu horário online com rapidez e praticidade.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          <button className="px-5 py-2 rounded-full border border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37] text-xs font-bold uppercase tracking-widest whitespace-nowrap">
            Todas
          </button>
          <button className="px-5 py-2 rounded-full border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-white transition-colors text-xs font-bold uppercase tracking-widest whitespace-nowrap">
            Mais Avaliadas
          </button>
          <button className="px-5 py-2 rounded-full border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-white transition-colors text-xs font-bold uppercase tracking-widest whitespace-nowrap">
            Perto de Mim
          </button>
          <button className="px-5 py-2 rounded-full border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-white transition-colors text-xs font-bold uppercase tracking-widest whitespace-nowrap">
            Aberto Agora
          </button>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_BARBERSHOPS.map((shop) => (
            <Link key={shop.id} href={`/b/${shop.slug}`} className="group block">
              <div className="premium-card overflow-hidden h-full flex flex-col hover:border-[#d4af37]/30 transition-colors">
                <div className="relative h-56 w-full bg-neutral-900 overflow-hidden">
                  <Image 
                    src={shop.cover_url} 
                    alt={shop.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 border border-white/10">
                    <Star className="text-[#d4af37] fill-[#d4af37]" size={12} />
                    <span className="text-white text-xs font-bold">{shop.rating}</span>
                    <span className="text-neutral-400 text-[10px]">({shop.reviewsCount})</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="font-[family-name:var(--font-display)] text-xl text-white tracking-wide group-hover:text-[#d4af37] transition-colors line-clamp-1">
                      {shop.name}
                    </h2>
                    <span className="text-[#d4af37] text-xs font-bold tracking-widest mt-1">{shop.priceRange}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-4">
                    <MapPin size={12} />
                    <span>{shop.city}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-neutral-800">
                    {shop.services.slice(0, 3).map((svc, i) => (
                      <span key={i} className="text-[10px] text-neutral-300 bg-neutral-900 px-2 py-1 rounded-md border border-neutral-800">
                        {svc}
                      </span>
                    ))}
                    {shop.services.length > 3 && (
                      <span className="text-[10px] text-neutral-500 px-2 py-1">+{shop.services.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
