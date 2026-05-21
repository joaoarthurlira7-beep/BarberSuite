'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  baseOpacity: number
}

interface ParticleCanvasProps {
  /** Number of dots (default 180) */
  count?: number
  /** Colour of the dots — CSS rgb values without 'rgba()' wrapper, e.g. "180, 200, 255" */
  color?: string
}

export function ParticleCanvas({ count = 180, color = '180, 200, 255' }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animRef  = useRef<number>(0)
  const pRef     = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const CONNECTION  = 130   // px — max line draw distance
    const MOUSE_R     = 170   // px — mouse influence radius
    const MOUSE_F     = 0.022 // repulsion strength

    /* ── Size / init ── */
    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      init()
    }

    const init = () => {
      pRef.current = Array.from({ length: count }, () => {
        const base = Math.random() * 0.45 + 0.12
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          size: Math.random() * 1.4 + 0.35,
          opacity: base,
          baseOpacity: base,
        }
      })
    }

    /* ── Draw loop ── */
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const { x: mx, y: my } = mouseRef.current

      for (const p of pRef.current) {
        /* mouse repulsion */
        const dx   = p.x - mx
        const dy   = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < MOUSE_R && dist > 0) {
          const force = (1 - dist / MOUSE_R) * MOUSE_F * 5
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
          p.opacity = Math.min(1, p.baseOpacity + (1 - dist / MOUSE_R) * 0.65)
        } else {
          p.opacity += (p.baseOpacity - p.opacity) * 0.04
        }

        /* friction */
        p.vx *= 0.972
        p.vy *= 0.972

        p.x += p.vx
        p.y += p.vy

        /* wrap edges */
        if (p.x < 0)             p.x = canvas.width
        if (p.x > canvas.width)  p.x = 0
        if (p.y < 0)             p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        /* dot */
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, ${p.opacity})`
        ctx.fill()
      }

      /* connections */
      const list = pRef.current
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a  = list[i]
          const b  = list[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < CONNECTION) {
            const alpha = (1 - d / CONNECTION) * 0.13
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(${color}, ${alpha})`
            ctx.lineWidth   = 0.6
            ctx.stroke()
          }
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }

    /* ── Events ── */
    const onMouseMove  = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }

    resize()
    draw()

    window.addEventListener('resize', resize)
    canvas.addEventListener('mousemove',  onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove',  onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [count, color])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'all' }}
    />
  )
}
