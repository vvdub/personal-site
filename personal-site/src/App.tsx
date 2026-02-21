import { useState, useCallback } from 'react'
import { Intro } from './components/intro'
import { Header, MainContent, Footer } from './components/site'
import './App.css'

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
        <Header />
        <MainContent />
        <Footer />
      </div>
    </>
  )
}

export default App
