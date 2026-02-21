import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

/* ────────────────────────────────────────────
   CODE FRAGMENTS — fly through the warp field
   ──────────────────────────────────────────── */
const CODE_FRAGMENTS = [
  'const build = () => ship();',
  'while (true) { create(); }',
  'git push origin main',
  'npm run deploy',
  '#!/usr/bin/env node',
  'export default future;',
  'rm -rf node_modules && pnpm i',
  'docker compose up -d',
  'SELECT * FROM ideas;',
  'curl -X POST /api/v1/launch',
  '> compiling...',
  '200 OK',
  'ssh root@production',
  'tail -f /var/log/output',
  'echo "building software"',
  '{ "status": "live" }',
]

/* glitch alphabet — techno/terminal aesthetic */
const GLITCH_CHARS = '01!@#$_-=|;:<>/~\u2588\u2593\u2592\u2591\u25A0\u25B6\u00BB\u00AB'

/* ────────────────────────────────────────────
   STAR WARP + CODE WARP — unified canvas
   All visual intensity is driven by one value
   ──────────────────────────────────────────── */

interface Star {
  x: number; y: number; z: number
  size: number; alpha: number
  trail: Array<{ sx: number; sy: number }>
}

interface CodeParticle {
  x: number; y: number; z: number
  text: string; alpha: number
}

function WarpCanvas({ intensity }: { intensity: number }) {
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
    const STAR_COUNT = 400
    const MAX_DEPTH = 1500
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

    /* --- Code particles (fly through like stars) --- */
    const CODE_COUNT = 40
    const codeParticles: CodeParticle[] = []

    const resetCode = (p: CodeParticle, spread: boolean) => {
      p.x = (Math.random() - 0.5) * W * 2.5
      p.y = (Math.random() - 0.5) * H * 2.5
      p.z = spread ? Math.random() * MAX_DEPTH : MAX_DEPTH + Math.random() * 100
      p.text = CODE_FRAGMENTS[Math.floor(Math.random() * CODE_FRAGMENTS.length)]
      p.alpha = Math.random() * 0.5 + 0.25
    }

    for (let i = 0; i < CODE_COUNT; i++) {
      const p: CodeParticle = { x: 0, y: 0, z: 0, text: '', alpha: 0.2 }
      resetCode(p, true)
      codeParticles.push(p)
    }

    /* --- Animation loop --- */
    const animate = () => {
      const t = intensityRef.current // 0 → 1 unified intensity
      if (t < 0) return // stopped

      const cxH = W / 2
      const cyH = H / 2

      ctx.clearRect(0, 0, W, H)

      // Speed: exponential ramp — slow drift → building → hyperspace
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

          // chromatic trail — red/blue split increases with intensity
          const chromOffset = t * 3

          for (let i = 1; i < trail.length; i++) {
            const frac = i / trail.length
            const lineAlpha = alpha * frac * 0.7

            // Main white streak
            ctx.beginPath()
            ctx.moveTo(trail[i - 1].sx, trail[i - 1].sy)
            ctx.lineTo(trail[i].sx, trail[i].sy)
            ctx.lineWidth = thickness * (0.15 + frac * 0.85)
            ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`
            ctx.stroke()

            // Chromatic aberration streaks
            if (t > 0.3) {
              const chromAlpha = lineAlpha * (t - 0.3) * 1.4
              // Red channel offset
              ctx.beginPath()
              ctx.moveTo(trail[i - 1].sx + chromOffset, trail[i - 1].sy)
              ctx.lineTo(trail[i].sx + chromOffset, trail[i].sy)
              ctx.lineWidth = thickness * (0.1 + frac * 0.5)
              ctx.strokeStyle = `rgba(255,60,60,${chromAlpha})`
              ctx.stroke()
              // Blue channel offset
              ctx.beginPath()
              ctx.moveTo(trail[i - 1].sx - chromOffset, trail[i - 1].sy)
              ctx.lineTo(trail[i].sx - chromOffset, trail[i].sy)
              ctx.lineWidth = thickness * (0.1 + frac * 0.5)
              ctx.strokeStyle = `rgba(60,120,255,${chromAlpha})`
              ctx.stroke()
            }
          }

          // Bright head
          ctx.beginPath()
          ctx.arc(sx, sy, thickness * 0.8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${Math.min(alpha * 1.5, 1)})`
          ctx.fill()
        } else {
          // Slow: dots with subtle twinkle
          const twinkle = 0.7 + Math.sin(performance.now() * 0.003 + s.x) * 0.3
          const dotSize = s.size * (0.4 + depthRatio * 1.3)
          ctx.beginPath()
          ctx.arc(sx, sy, dotSize, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${alpha * twinkle})`
          ctx.fill()
        }
      }

      /* === Code particles — techno glitch style === */
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
          // Smaller font — tight techno aesthetic
          const fontSize = Math.max(8, 9 + depthRatio * 8)
          ctx.font = `${fontSize}px "Space Mono", monospace`

          // Techno strobe: random flicker at high intensity
          const flicker = t > 0.4 && Math.random() < t * 0.15 ? 0 : 1
          const codeAlpha = p.alpha * depthRatio * flicker

          if (codeAlpha < 0.02) continue

          // Corrupt the text in-flight from the start — techno glitch
          const corruptChance = 0.08 + t * t * 0.5
          const displayText = p.text
            .split('')
            .map(ch => Math.random() < corruptChance
              ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
              : ch)
            .join('')

          // Jitter computed once, applied to all layers
          const jitter = t > 0.3 ? (Math.sin(now * 0.05 + p.z) > 0.7 ? (Math.random() - 0.5) * t * 12 : 0) : 0
          const drawX = sx + jitter

          // Chromatic split — same text, same jitter base
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

      /* === Center glow — builds in back half === */
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

      /* Radial speed lines removed */

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

/* ────────────────────────────────────────────
   GLITCH TEXT — name that corrupts with warp
   ──────────────────────────────────────────── */

function GlitchName({ intensity }: { intensity: number }) {
  const [glitchedFirst, setGlitchedFirst] = useState('DUSTEN')
  const [glitchedLast, setGlitchedLast] = useState('PETERSON')
  const [sliceOffset, setSliceOffset] = useState(0)
  const intensityRef = useRef(intensity)
  intensityRef.current = intensity

  useEffect(() => {
    const baseFirst = 'DUSTEN'
    const baseLast = 'PETERSON'

    const interval = setInterval(() => {
      const t = intensityRef.current
      if (t < 0.05 || t < 0) return

      const corruptionChance = Math.min(t * t * 1.2, 0.85)

      const corrupt = (str: string) =>
        str
          .split('')
          .map((ch) =>
            Math.random() < corruptionChance
              ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
              : ch,
          )
          .join('')

      setGlitchedFirst(corrupt(baseFirst))
      setGlitchedLast(corrupt(baseLast))

      if (t > 0.2 && Math.random() < t * 0.7) {
        setSliceOffset((Math.random() - 0.5) * t * 60)
      } else {
        setSliceOffset(0)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [])

  // Much bigger chromatic split
  const chromX = intensity * 18
  const chromY = intensity * 8

  const visible = intensity > 0.02

  // Horizontal slice on individual lines
  const firstSlice = intensity > 0.3 ? sliceOffset * 0.7 : 0
  const lastSlice = intensity > 0.3 ? -sliceOffset : 0

  return (
    <div
      className="glitch-name-wrap"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Red ghost — big offset */}
      <div
        className="glitch-name glitch-name--red"
        style={{
          transform: `translate(${chromX}px, ${-chromY}px)`,
          opacity: Math.min(intensity * 2, 0.8),
        }}
      >
        <span className="glitch-name-line" style={{ transform: `translateX(${firstSlice * 0.5}px)` }}>{glitchedFirst}</span>
        <span className="glitch-name-line" style={{ transform: `translateX(${lastSlice * 0.5}px)` }}>{glitchedLast}</span>
      </div>

      {/* Blue ghost — big offset opposite */}
      <div
        className="glitch-name glitch-name--blue"
        style={{
          transform: `translate(${-chromX}px, ${chromY}px)`,
          opacity: Math.min(intensity * 2, 0.8),
        }}
      >
        <span className="glitch-name-line" style={{ transform: `translateX(${-firstSlice * 0.5}px)` }}>{glitchedFirst}</span>
        <span className="glitch-name-line" style={{ transform: `translateX(${-lastSlice * 0.5}px)` }}>{glitchedLast}</span>
      </div>

      {/* Main white text with slice displacement */}
      <div className="glitch-name glitch-name--main">
        <span className="glitch-name-line" style={{ transform: `translateX(${firstSlice}px)` }}>{glitchedFirst}</span>
        <span className="glitch-name-line" style={{ transform: `translateX(${lastSlice}px)` }}>{glitchedLast}</span>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   GLITCH BARS — horizontal noise bands
   Scale frequency & opacity with intensity
   ──────────────────────────────────────────── */

function GlitchBars({ intensity }: { intensity: number }) {
  const [bars, setBars] = useState<Array<{
    id: number; y: number; w: number; x: number; h: number
  }>>([])
  const idRef = useRef(0)

  useEffect(() => {
    if (intensity < 0.1) return

    // Spawn faster as intensity rises
    const freq = Math.max(30, 200 - intensity * 170)
    const maxBars = Math.floor(3 + intensity * 10)

    const interval = setInterval(() => {
      const count = Math.floor(1 + intensity * 3)
      const newBars = Array.from({ length: count }, () => ({
        id: idRef.current++,
        y: Math.random() * 100,
        w: Math.random() * 50 + 10 + intensity * 30,
        x: Math.random() * 60,
        h: Math.random() < intensity * 0.5 ? Math.random() * 6 + 2 : 2,
      }))
      setBars((prev) => [...prev.slice(-maxBars), ...newBars])
    }, freq)

    return () => clearInterval(interval)
  }, [intensity])

  return (
    <>
      {bars.map((bar) => (
        <div
          key={bar.id}
          className="glitch-bar"
          style={{
            top: `${bar.y}%`,
            left: `${bar.x}%`,
            width: `${bar.w}%`,
            height: `${bar.h}px`,
            opacity: 0.1 + intensity * 0.5,
          }}
        />
      ))}
    </>
  )
}

/* ────────────────────────────────────────────
   BPM COUNTER — pulses harder with intensity
   ──────────────────────────────────────────── */

function BpmCounter({ intensity }: { intensity: number }) {
  const [bpm, setBpm] = useState(128)
  const intensityRef = useRef(intensity)
  intensityRef.current = intensity

  useEffect(() => {
    const interval = setInterval(() => {
      const t = intensityRef.current
      if (t < 0.3) return
      const step = t > 0.7 ? 3 : t > 0.5 ? 2 : 1
      setBpm((prev) => Math.min(prev + step, 180))
    }, 30)
    return () => clearInterval(interval)
  }, [])

  if (intensity < 0.3) return null

  const pulseSpeed = Math.max(0.06, 0.15 - intensity * 0.09)
  const scale = 0.95 + intensity * 0.1

  return (
    <div className="bpm-counter" style={{ transform: `scale(${scale})` }}>
      <span
        className="bpm-num"
        style={{
          animationDuration: `${pulseSpeed}s`,
          textShadow: `0 0 ${intensity * 40}px rgba(255,255,255,${intensity * 0.8})`,
        }}
      >
        {bpm}
      </span>
      <span className="bpm-label">BPM</span>
    </div>
  )
}

/* ────────────────────────────────────────────
   INTRO — master orchestrator
   Single intensity curve drives everything
   ──────────────────────────────────────────── */

function Intro({ onComplete }: { onComplete: () => void }) {
  const [intensity, setIntensity] = useState(0)
  const [phase, setPhase] = useState<'warp' | 'flash' | 'done'>('warp')
  const startRef = useRef(0)
  const animRef = useRef(0)

  useEffect(() => {
    startRef.current = performance.now()

    const TOTAL_WARP = 4800  // ms of warp buildup
    const FLASH_AT = 4800    // when flash triggers
    const COMPLETE_AT = 5400 // when site appears

    const tick = () => {
      const elapsed = performance.now() - startRef.current

      if (elapsed < TOTAL_WARP) {
        // Smooth intensity curve: slow start → accelerating → max
        const t = elapsed / TOTAL_WARP
        // Custom easing: slow in first 30%, rapid 30-80%, plateau 80-100%
        let i: number
        if (t < 0.3) {
          i = (t / 0.3) * 0.15 // 0 → 0.15 slowly
        } else if (t < 0.8) {
          const mid = (t - 0.3) / 0.5
          i = 0.15 + mid * mid * 0.65 // 0.15 → 0.8 accelerating
        } else {
          const end = (t - 0.8) / 0.2
          i = 0.8 + end * 0.2 // 0.8 → 1.0 final push
        }
        setIntensity(i)
        animRef.current = requestAnimationFrame(tick)
      } else if (elapsed < FLASH_AT + 100) {
        setIntensity(1)
        setPhase('flash')
        animRef.current = requestAnimationFrame(tick)
      } else if (elapsed >= COMPLETE_AT) {
        setIntensity(-1)
        setPhase('done')
        onComplete()
      } else {
        animRef.current = requestAnimationFrame(tick)
      }
    }

    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [onComplete])

  const handleSkip = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    setIntensity(-1)
    setPhase('done')
    onComplete()
  }, [onComplete])

  if (phase === 'done') return null

  // No screen shake — it exposes the background behind the intro
  const shakeX = 0
  const shakeY = 0

  // Scanline opacity intensifies
  const scanOpacity = Math.min(intensity * 0.8, 0.5)

  return (
    <div
      className={`intro ${phase === 'flash' ? 'intro--flash' : ''}`}
      onClick={handleSkip}
      style={{
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Star warp + code particles — all on canvas */}
      <WarpCanvas intensity={intensity} />

      {/* Scanlines — opacity scales with intensity */}
      <div
        className="intro-scanlines"
        style={{ opacity: scanOpacity }}
      />

      {/* Glitch bars */}
      <GlitchBars intensity={intensity} />

      {/* Center name — the hero element */}
      <GlitchName intensity={intensity} />

      {/* BPM counter */}
      <BpmCounter intensity={intensity} />

      {/* Noise texture overlay */}
      <div
        className="intro-noise"
        style={{ opacity: 0.03 + intensity * 0.08 }}
      />

      {/* Skip hint */}
      <div className="intro-skip">click to skip</div>
    </div>
  )
}

/* ────────────────────────────────────────────
   MAIN SITE (unchanged layout)
   ──────────────────────────────────────────── */

function BracketLogo() {
  return (
    <svg className="topline-logo" viewBox="0 0 64 64" width="28" height="28" aria-label="DP logo">
      <path d="M14 14 L24 14 L24 20 L20 20 L20 44 L24 44 L24 50 L14 50 Z" fill="currentColor" />
      <path d="M50 14 L40 14 L40 20 L44 20 L44 44 L40 44 L40 50 L50 50 Z" fill="currentColor" />
      <rect x="29" y="29" width="6" height="6" fill="currentColor" />
    </svg>
  )
}

function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [siteVisible, setSiteVisible] = useState(false)

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false)
    requestAnimationFrame(() => setSiteVisible(true))
  }, [])

  return (
    <>
      {showIntro && <Intro onComplete={handleIntroComplete} />}

      <div className={`page ${siteVisible ? 'page--visible' : ''}`}>
        <div className="grain" />

        <header className="topline">
          <BracketLogo />
          <span className="topline-label">01000100 01010000</span>
        </header>

        <main className="content">
          <div className="name-block">
            <h1 className="name" data-text="Dusten Peterson">
              <span className="name-line">Dusten</span>
              <span className="name-line">Peterson</span>
            </h1>
          </div>

          <div className="rule" />

          <div className="meta">
            <p className="role">Building software, end to end.</p>
          </div>

          <nav className="links">
            <a href="https://www.linkedin.com/in/dustenpeterson/" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <span className="link-sep">/</span>
            <a href="https://github.com/vvdub" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <span className="link-sep">/</span>
            <a href="mailto:dustenpeterson@gmail.com">
              Mail
            </a>
          </nav>
        </main>

        <footer className="bottomline">
          <span className="bottomline-mark">&copy; {new Date().getFullYear()}</span>
        </footer>
      </div>
    </>
  )
}

export default App
