import { useState, useEffect, useCallback, useRef } from 'react'
import { corruptText } from '../../helpers/glitch'

const FIRST = 'Dusten'
const LAST = 'Peterson'
const BURST_TICKS = 6
const BURST_TICK_MS = 40

/**
 * The name as letterpress type that never fully settled after the intro:
 * every so often (and on hover) the magenta and cyan plates slip out of
 * register for ~240ms and a few characters corrupt, then it snaps back.
 */
export function GhostName() {
  const [lines, setLines] = useState<[string, string]>([FIRST, LAST])
  const [slip, setSlip] = useState({ x: 0, y: 0 })
  const [ghost, setGhost] = useState(false)
  const burstingRef = useRef(false)
  const intervalRef = useRef(0)
  const reducedRef = useRef(false)

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const burst = useCallback(() => {
    if (burstingRef.current || reducedRef.current) return
    burstingRef.current = true
    setGhost(true)

    let ticks = 0
    intervalRef.current = window.setInterval(() => {
      ticks++
      if (ticks >= BURST_TICKS) {
        clearInterval(intervalRef.current)
        setLines([FIRST, LAST])
        setSlip({ x: 0, y: 0 })
        setGhost(false)
        burstingRef.current = false
        return
      }
      setLines([corruptText(FIRST, 0.22), corruptText(LAST, 0.22)])
      setSlip({
        x: (Math.random() - 0.5) * 22,
        y: (Math.random() - 0.5) * 7,
      })
    }, BURST_TICK_MS)
  }, [])

  // Idle relapses on a loose 7–16s rhythm
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timeout = 0
    const schedule = () => {
      timeout = window.setTimeout(() => {
        burst()
        schedule()
      }, 7000 + Math.random() * 9000)
    }
    schedule()
    return () => {
      clearTimeout(timeout)
      clearInterval(intervalRef.current)
    }
  }, [burst])

  return (
    <h1
      className={`name ${ghost ? 'name--ghost' : ''}`}
      aria-label={`${FIRST} ${LAST}`}
      onMouseEnter={burst}
    >
      <span
        className="name-plate name-plate--magenta"
        aria-hidden="true"
        style={{ transform: `translate(${slip.x}px, ${slip.y}px)` }}
      >
        <span className="name-line">{lines[0]}</span>
        <span className="name-line">{lines[1]}</span>
      </span>
      <span
        className="name-plate name-plate--cyan"
        aria-hidden="true"
        style={{ transform: `translate(${-slip.x}px, ${-slip.y * 0.6}px)` }}
      >
        <span className="name-line">{lines[0]}</span>
        <span className="name-line">{lines[1]}</span>
      </span>
      <span className="name-plate name-plate--ink" aria-hidden="true">
        <span className="name-line">{lines[0]}</span>
        <span className="name-line">{lines[1]}</span>
      </span>
    </h1>
  )
}
