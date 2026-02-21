import { useState, useEffect, useRef } from 'react'
import { BPM_INITIAL, BPM_MAX } from '../../constants'

export function BpmCounter({ intensity }: { intensity: number }) {
  const [bpm, setBpm] = useState(BPM_INITIAL)
  const intensityRef = useRef(intensity)
  intensityRef.current = intensity

  useEffect(() => {
    const interval = setInterval(() => {
      const t = intensityRef.current
      if (t < 0.3) return
      const step = t > 0.7 ? 3 : t > 0.5 ? 2 : 1
      setBpm((prev) => Math.min(prev + step, BPM_MAX))
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
