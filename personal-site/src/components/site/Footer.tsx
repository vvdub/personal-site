import { useState, useEffect } from 'react'

const formatTime = (d: Date) =>
  d.toLocaleTimeString('en-GB', { hour12: false })

export function Footer() {
  const [time, setTime] = useState(() => formatTime(new Date()))

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime(new Date())), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="bottomline">
      <span className="bottomline-mark">Local {time}</span>
      <span className="bottomline-mark">&copy; {new Date().getFullYear()}</span>
    </footer>
  )
}
