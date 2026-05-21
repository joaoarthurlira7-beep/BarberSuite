'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Scissors, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Validation States
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    // Intersection Observer for staggered animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = (entry.target as HTMLElement).dataset.delay || '0'
          ;(entry.target as HTMLElement).style.transitionDelay = `${delay}ms`
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.animate-in').forEach(el => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const validateEmail = (val: string) => {
    if (!val) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(val)) return 'Invalid email format'
    return ''
  }

  const validatePassword = (val: string) => {
    if (!val) return 'Password is required'
    if (val.length < 8) return 'Password must be at least 8 characters'
    return ''
  }

  const handleBlur = (field: 'email' | 'password') => {
    if (field === 'email') setEmailError(validateEmail(email))
    if (field === 'password') setPasswordError(validatePassword(password))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    
    const eErr = validateEmail(email)
    const pErr = validatePassword(password)
    
    setEmailError(eErr)
    setPasswordError(pErr)

    if (eErr || pErr) return

    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setFormError('Invalid credentials. Please check your email and password.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex font-sans text-neutral-100">

      {/* ── Spline Holographic Earth Background ── */}
      <div className="spline-container absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <iframe
          src="https://my.spline.design/holographicearthwithdynamiclines-Txss0UBWNbhy4HVGL2xZX8mr"
          frameBorder="0"
          width="100%"
          height="100%"
          id="aura-spline"
          style={{ border: 'none' }}
          title="Holographic Earth Background"
        />
      </div>

      {/* Dark overlay to keep the form readable over the vibrant background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none -z-10" />

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 pt-28 pb-28 md:pt-40 md:pb-40 px-6 gap-16 z-10">
        
        {/* Left Column: Form */}
        <div className="flex flex-col items-center md:items-start w-full max-w-md mx-auto md:mx-0">
          
          <div className="flex items-center gap-3 mb-8 animate-in" data-delay="0">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
              <Scissors size={24} className="text-white" />
            </div>
            <span className="font-display text-2xl tracking-tighter uppercase font-bold text-white">
              BARBER<span className="font-light opacity-60 ml-1">SUITE</span>
            </span>
          </div>

          <div className="w-full glass-card animate-in" data-delay="400">
            <h1 className="font-display text-3xl uppercase tracking-tight text-white mb-2 animate-in" data-delay="100">
              Welcome to BarbeSuite
            </h1>
            <p className="text-neutral-400 text-sm mb-8 animate-in" data-delay="200">
              Enter your credentials to access your management dashboard.
            </p>

            {formError && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-3 animate-in" data-delay="300">
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div className="animate-in" data-delay="500">
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-bold mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value)
                      if (emailError) setEmailError(validateEmail(e.target.value))
                    }}
                    onBlur={() => handleBlur('email')}
                    placeholder="your@email.com"
                    className={`w-full bg-white/5 border ${emailError ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500' : 'border-white/10 focus:border-white/20 focus:ring-white/20'} rounded-xl text-white px-4 py-3 text-sm transition-all duration-200 outline-none focus:ring-2`}
                  />
                  {email && !emailError && <CheckCircle2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />}
                </div>
                {emailError && <p className="text-red-400 text-[10px] mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10} />{emailError}</p>}
              </div>

              {/* Password */}
              <div className="animate-in" data-delay="600">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-bold">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[10px] text-neutral-400 hover:text-white transition-colors uppercase tracking-widest">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value)
                      if (passwordError) setPasswordError(validatePassword(e.target.value))
                    }}
                    onBlur={() => handleBlur('password')}
                    placeholder="Enter your password"
                    className={`w-full bg-white/5 border ${passwordError ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500' : 'border-white/10 focus:border-white/20 focus:ring-white/20'} rounded-xl text-white px-4 py-3 text-sm transition-all duration-200 outline-none focus:ring-2 pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordError && <p className="text-red-400 text-[10px] mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10} />{passwordError}</p>}
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-3 animate-in" data-delay="700">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-white/20 border-white/30' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                >
                  {rememberMe && <CheckCircle2 size={12} className="text-white" />}
                </button>
                <label className="text-sm text-neutral-400 cursor-pointer select-none" onClick={() => setRememberMe(!rememberMe)}>
                  Remember Me
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="animate-in w-full bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white rounded-xl py-3 px-4 font-semibold uppercase tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                data-delay="800"
              >
                <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className={`relative flex items-center gap-2 transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                  Sign In
                </span>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                )}
              </button>
            </form>

            {/* Social / Alternatives */}
            <div className="animate-in" data-delay="900">
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-neutral-500 text-xs uppercase tracking-widest">or continue with</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="flex gap-4 justify-center">
                <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <span className="text-sm font-bold">G</span>
                </button>
                <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <span className="text-sm font-bold">A</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual tagline over the Spline globe */}
        <div className="hidden md:flex flex-col justify-center items-start relative animate-in" data-delay="500">
          <div className="space-y-6">
            <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500 font-bold">
              Plataforma SaaS · Barbearias
            </p>
            <h2
              className="font-display text-5xl xl:text-6xl uppercase leading-[1.05] font-bold"
              style={{ textShadow: '0 0 60px rgba(212,175,55,0.25)' }}
            >
              O futuro da<br />
              <span className="text-[#00ff66]">gestão</span><br />
              chegou.
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
              Agendamentos, equipe, financeiro e muito mais — tudo em um painel premium feito para barbeiros modernos.
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500 uppercase tracking-widest mt-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
              Sistemas Operacionais
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
