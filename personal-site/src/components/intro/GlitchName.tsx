import { useState, useEffect, useRef } from 'react'
import { corruptText } from '../../helpers/glitch'

export function GlitchName({ intensity }: { intensity: number }) {
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

      setGlitchedFirst(corruptText(baseFirst, corruptionChance))
      setGlitchedLast(corruptText(baseLast, corruptionChance))

      if (t > 0.2 && Math.random() < t * 0.7) {
        setSliceOffset((Math.random() - 0.5) * t * 60)
      } else {
        setSliceOffset(0)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [])

  const chromX = intensity * 18
  const chromY = intensity * 8

  const visible = intensity > 0.02

  const firstSlice = intensity > 0.3 ? sliceOffset * 0.7 : 0
  const lastSlice = intensity > 0.3 ? -sliceOffset : 0

  return (
    <div
      className="glitch-name-wrap"
      style={{ opacity: visible ? 1 : 0 }}
    >
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

      <div className="glitch-name glitch-name--main">
        <span className="glitch-name-line" style={{ transform: `translateX(${firstSlice}px)` }}>{glitchedFirst}</span>
        <span className="glitch-name-line" style={{ transform: `translateX(${lastSlice}px)` }}>{glitchedLast}</span>
      </div>
    </div>
  )
}
