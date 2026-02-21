import { useEffect, useRef } from 'react'
import { STAR_COUNT, MAX_DEPTH, CODE_PARTICLE_COUNT, CODE_FRAGMENTS, GLITCH_CHARS } from '../../constants'
import type { Star, CodeParticle } from '../../types'

export function WarpCanvas({ intensity }: { intensity: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const intensityRef = useRef(intensity)
  intensityRef.current = intensity

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    let W = window.innerWidth
    let H = window.innerHeight

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    /* --- Stars --- */
    const stars: Star[] = []

    const resetStar = (s: Star, spread: boolean) => {
      s.x = (Math.random() - 0.5) * W * 3
      s.y = (Math.random() - 0.5) * H * 3
      s.z = spread ? Math.random() * MAX_DEPTH : MAX_DEPTH + Math.random() * 200
      s.size = Math.random() * 1.8 + 0.4
      s.alpha = Math.random() * 0.5 + 0.15
      s.trail = []
    }

    for (let i = 0; i < STAR_COUNT; i++) {
      const s: Star = { x: 0, y: 0, z: 0, size: 1, alpha: 0.3, trail: [] }
      resetStar(s, true)
      stars.push(s)
    }

    /* --- Code particles --- */
    const codeParticles: CodeParticle[] = []

    const resetCode = (p: CodeParticle, spread: boolean) => {
      p.x = (Math.random() - 0.5) * W * 2.5
      p.y = (Math.random() - 0.5) * H * 2.5
      p.z = spread ? Math.random() * MAX_DEPTH : MAX_DEPTH + Math.random() * 100
      p.text = CODE_FRAGMENTS[Math.floor(Math.random() * CODE_FRAGMENTS.length)]
      p.alpha = Math.random() * 0.5 + 0.25
    }

    for (let i = 0; i < CODE_PARTICLE_COUNT; i++) {
      const p: CodeParticle = { x: 0, y: 0, z: 0, text: '', alpha: 0.2 }
      resetCode(p, true)
      codeParticles.push(p)
    }

    /* --- Animation loop --- */
    const animate = () => {
      const t = intensityRef.current
      if (t < 0) return

      const cxH = W / 2
      const cyH = H / 2

      ctx.clearRect(0, 0, W, H)

      const ease = t * t * t
      const speed = 0.4 + ease * 65

      const maxTrailLen = speed > 2 ? Math.floor(2 + t * 20) : 0

      /* === Stars === */
      for (const s of stars) {
        s.z -= speed

        if (s.z <= 0) { resetStar(s, false); continue }

        const factor = 300 / (s.z + 0.1)
        const sx = s.x * factor + cxH
        const sy = s.y * factor + cyH

        if (sx < -300 || sx > W + 300 || sy < -300 || sy > H + 300) continue

        const depthRatio = 1 - s.z / MAX_DEPTH
        const brightness = Math.min(depthRatio * 1.6, 1)
        const alpha = s.alpha * brightness

        if (maxTrailLen > 0) {
          s.trail.push({ sx, sy })
          if (s.trail.length > maxTrailLen) s.trail.shift()
        }

        if (speed > 2 && s.trail.length > 1) {
          const trail = s.trail
          const thickness = Math.min(s.size * (speed / 12), 4)

          const chromOffset = t * 3

          for (let i = 1; i < trail.length; i++) {
            const frac = i / trail.length
            const lineAlpha = alpha * frac * 0.7

            ctx.beginPath()
            ctx.moveTo(trail[i - 1].sx, trail[i - 1].sy)
            ctx.lineTo(trail[i].sx, trail[i].sy)
            ctx.lineWidth = thickness * (0.15 + frac * 0.85)
            ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`
            ctx.stroke()

            if (t > 0.3) {
              const chromAlpha = lineAlpha * (t - 0.3) * 1.4
              ctx.beginPath()
              ctx.moveTo(trail[i - 1].sx + chromOffset, trail[i - 1].sy)
              ctx.lineTo(trail[i].sx + chromOffset, trail[i].sy)
              ctx.lineWidth = thickness * (0.1 + frac * 0.5)
              ctx.strokeStyle = `rgba(255,60,60,${chromAlpha})`
              ctx.stroke()
              ctx.beginPath()
              ctx.moveTo(trail[i - 1].sx - chromOffset, trail[i - 1].sy)
              ctx.lineTo(trail[i].sx - chromOffset, trail[i].sy)
              ctx.lineWidth = thickness * (0.1 + frac * 0.5)
              ctx.strokeStyle = `rgba(60,120,255,${chromAlpha})`
              ctx.stroke()
            }
          }

          ctx.beginPath()
          ctx.arc(sx, sy, thickness * 0.8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${Math.min(alpha * 1.5, 1)})`
          ctx.fill()
        } else {
          const twinkle = 0.7 + Math.sin(performance.now() * 0.003 + s.x) * 0.3
          const dotSize = s.size * (0.4 + depthRatio * 1.3)
          ctx.beginPath()
          ctx.arc(sx, sy, dotSize, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${alpha * twinkle})`
          ctx.fill()
        }
      }

      /* === Code particles === */
      {
        ctx.textAlign = 'left'
        const now = performance.now()

        for (const p of codeParticles) {
          p.z -= speed * 0.8

          if (p.z <= 0) { resetCode(p, false); continue }

          const factor = 300 / (p.z + 0.1)
          const sx = p.x * factor + cxH
          const sy = p.y * factor + cyH

          if (sx < -500 || sx > W + 500 || sy < -200 || sy > H + 200) continue

          const depthRatio = 1 - p.z / MAX_DEPTH
          const fontSize = Math.max(8, 9 + depthRatio * 8)
          ctx.font = `${fontSize}px "Space Mono", monospace`

          const flicker = t > 0.4 && Math.random() < t * 0.15 ? 0 : 1
          const codeAlpha = p.alpha * depthRatio * flicker

          if (codeAlpha < 0.02) continue

          const corruptChance = t < 0.05 ? 0 : Math.min(t * t * 1.2, 0.85)
          const displayText = corruptChance === 0
            ? p.text
            : p.text
              .split('')
              .map(ch => Math.random() < corruptChance
                ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
                : ch)
              .join('')

          const jitter = t > 0.3 ? (Math.sin(now * 0.05 + p.z) > 0.7 ? (Math.random() - 0.5) * t * 12 : 0) : 0
          const drawX = sx + jitter

          const chromOff = t * 3
          if (t > 0.2) {
            const chromStrength = Math.min((t - 0.2) * 1.5, 1)
            ctx.fillStyle = `rgba(255,50,50,${codeAlpha * 0.5 * chromStrength})`
            ctx.fillText(displayText, drawX + chromOff, sy)
            ctx.fillStyle = `rgba(50,110,255,${codeAlpha * 0.5 * chromStrength})`
            ctx.fillText(displayText, drawX - chromOff, sy)
          }

          ctx.fillStyle = `rgba(255,255,255,${codeAlpha})`
          ctx.fillText(displayText, drawX, sy)
        }
      }

      /* === Center glow === */
      if (t > 0.35) {
        const glowT = (t - 0.35) / 0.65
        const glowRadius = 60 + glowT * glowT * 200
        const gradient = ctx.createRadialGradient(cxH, cyH, 0, cxH, cyH, glowRadius)
        gradient.addColorStop(0, `rgba(255,255,255,${glowT * 0.5})`)
        gradient.addColorStop(0.2, `rgba(200,220,255,${glowT * 0.15})`)
        gradient.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.arc(cxH, cyH, glowRadius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="warp-canvas" />
}
