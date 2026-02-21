import { useState, useEffect, useCallback, useRef } from 'react'
import { TOTAL_WARP_MS, FLASH_AT_MS, COMPLETE_AT_MS } from '../../constants'
import { WarpCanvas } from './WarpCanvas'
import { GlitchName } from './GlitchName'
import { GlitchBars } from './GlitchBars'
import { BpmCounter } from './BpmCounter'
import './Intro.css'

export function Intro({ onComplete }: { onComplete: () => void }) {
  const [intensity, setIntensity] = useState(0)
  const [phase, setPhase] = useState<'warp' | 'flash' | 'done'>('warp')
  const startRef = useRef(0)
  const animRef = useRef(0)

  useEffect(() => {
    startRef.current = performance.now()

    const tick = () => {
      const elapsed = performance.now() - startRef.current

      if (elapsed < TOTAL_WARP_MS) {
        const t = elapsed / TOTAL_WARP_MS
        let i: number
        if (t < 0.3) {
          i = (t / 0.3) * 0.15
        } else if (t < 0.8) {
          const mid = (t - 0.3) / 0.5
          i = 0.15 + mid * mid * 0.65
        } else {
          const end = (t - 0.8) / 0.2
          i = 0.8 + end * 0.2
        }
        setIntensity(i)
        animRef.current = requestAnimationFrame(tick)
      } else if (elapsed < FLASH_AT_MS + 100) {
        setIntensity(1)
        setPhase('flash')
        animRef.current = requestAnimationFrame(tick)
      } else if (elapsed >= COMPLETE_AT_MS) {
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

  const scanOpacity = Math.min(intensity * 0.8, 0.5)

  return (
    <div
      className={`intro ${phase === 'flash' ? 'intro--flash' : ''}`}
      onClick={handleSkip}
    >
      <WarpCanvas intensity={intensity} />

      <div
        className="intro-scanlines"
        style={{ opacity: scanOpacity }}
      />

      <GlitchBars intensity={intensity} />

      <GlitchName intensity={intensity} />

      <BpmCounter intensity={intensity} />

      <div
        className="intro-noise"
        style={{ opacity: 0.03 + intensity * 0.08 }}
      />

      <div className="intro-skip">click to skip</div>
    </div>
  )
}
