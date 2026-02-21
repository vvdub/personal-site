import { useState, useEffect, useRef } from 'react'
import type { GlitchBar } from '../../types'

export function GlitchBars({ intensity }: { intensity: number }) {
  const [bars, setBars] = useState<GlitchBar[]>([])
  const idRef = useRef(0)

  useEffect(() => {
    if (intensity < 0.1) return

    const freq = Math.max(30, 200 - intensity * 170)
    const maxBars = Math.floor(3 + intensity * 10)

    const interval = setInterval(() => {
      const count = Math.floor(1 + intensity * 3)
      const newBars: GlitchBar[] = Array.from({ length: count }, () => ({
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
