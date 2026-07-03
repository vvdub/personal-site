import { useState, useCallback } from 'react'
import { Intro } from './components/intro'
import { Header, MainContent, Footer } from './components/site'
import './App.css'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function App() {
  const [showIntro, setShowIntro] = useState(!prefersReducedMotion)
  const [siteVisible, setSiteVisible] = useState(prefersReducedMotion)
  const [introKey, setIntroKey] = useState(0)

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false)
    requestAnimationFrame(() => setSiteVisible(true))
  }, [])

  const handleReplay = useCallback(() => {
    setSiteVisible(false)
    setIntroKey((k) => k + 1)
    setShowIntro(true)
  }, [])

  return (
    <>
      {showIntro && <Intro key={introKey} onComplete={handleIntroComplete} />}

      <div className={`page ${siteVisible ? 'page--visible' : ''}`}>
        <div className="grain" />
        <Header onReplay={handleReplay} />
        <MainContent />
        <Footer />
      </div>
    </>
  )
}

export default App
