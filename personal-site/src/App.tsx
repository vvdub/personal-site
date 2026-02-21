import { useState, useEffect, useCallback } from 'react'
import './App.css'

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

function Intro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0)
  const [bpm, setBpm] = useState(128)
  const [fragments, setFragments] = useState<Array<{ id: number; text: string; x: number; y: number; opacity: number }>>([])
  const [scanOffset, setScanOffset] = useState(0)
  const [glitchBars, setGlitchBars] = useState<Array<{ id: number; y: number; width: number; delay: number }>>([])

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 3800),
      setTimeout(() => onComplete(), 4200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  useEffect(() => {
    if (phase < 1) return
    const interval = setInterval(() => {
      setScanOffset(prev => (prev + 2) % 100)
    }, 16)
    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    if (phase < 2) return
    let id = 0
    const interval = setInterval(() => {
      const newFragment = {
        id: id++,
        text: CODE_FRAGMENTS[Math.floor(Math.random() * CODE_FRAGMENTS.length)],
        x: Math.random() * 80 + 5,
        y: Math.random() * 80 + 5,
        opacity: Math.random() * 0.6 + 0.2,
      }
      setFragments(prev => [...prev.slice(-14), newFragment])
    }, 120)
    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    if (phase < 3) return
    const interval = setInterval(() => {
      setBpm(prev => Math.min(prev + 2, 180))
    }, 60)
    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    if (phase < 2) return
    let id = 0
    const interval = setInterval(() => {
      setGlitchBars(prev => [
        ...prev.slice(-6),
        { id: id++, y: Math.random() * 100, width: Math.random() * 60 + 20, delay: Math.random() * 0.1 },
      ])
    }, 200)
    return () => clearInterval(interval)
  }, [phase])

  return (
    <div className={`intro ${phase >= 4 ? 'intro--flash' : ''}`} onClick={onComplete}>
      {phase >= 1 && (
        <div className="intro-scanlines" style={{ backgroundPositionY: `${scanOffset}px` }} />
      )}

      {phase >= 2 && glitchBars.map(bar => (
        <div
          key={bar.id}
          className="intro-glitch-bar"
          style={{
            top: `${bar.y}%`,
            width: `${bar.width}%`,
            left: `${(100 - bar.width) * Math.random()}%`,
          }}
        />
      ))}

      {phase >= 2 && fragments.map(f => (
        <span
          key={f.id}
          className="intro-code"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            opacity: f.opacity,
          }}
        >
          {f.text}
        </span>
      ))}

      {phase >= 3 && (
        <div className="intro-bpm">
          <span className="intro-bpm-num">{bpm}</span>
          <span className="intro-bpm-label">BPM</span>
        </div>
      )}

      {phase >= 3 && <div className="intro-pulse" />}

      {phase >= 1 && phase < 4 && (
        <div className="intro-skip">click to skip</div>
      )}
    </div>
  )
}

function BracketLogo() {
  return (
    <svg className="topline-logo" viewBox="0 0 64 64" width="28" height="28" aria-label="DP logo">
      <path d="M14 14 L24 14 L24 20 L20 20 L20 44 L24 44 L24 50 L14 50 Z" fill="currentColor"/>
      <path d="M50 14 L40 14 L40 20 L44 20 L44 44 L40 44 L40 50 L50 50 Z" fill="currentColor"/>
      <rect x="29" y="29" width="6" height="6" fill="currentColor"/>
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
