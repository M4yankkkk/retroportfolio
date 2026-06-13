import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const BOOT_LINES = [
  { text: 'IBM PCjr BIOS v2.10', delay: 0,    color: 'green' },
  { text: '640K RAM OK', delay: 0.6,           color: 'green' },
  { text: '', delay: 1.0,                      color: 'green' },
  { text: 'BOOTING SYSTEM...', delay: 1.2,     color: 'amber' },
  { text: 'LOADING PORTFOLIO.EXE', delay: 2.1, color: 'amber' },
  { text: 'INITIALIZING MODULES...', delay: 2.9, color: 'green' },
  { text: '[OK] Graphics subsystem', delay: 3.5, color: 'green' },
  { text: '[OK] Audio driver', delay: 3.9,      color: 'green' },
  { text: '[OK] Network stack', delay: 4.3,     color: 'green' },
  { text: '', delay: 4.7,                       color: 'green' },
  { text: '> WELCOME, HUMAN.', delay: 5.0,      color: 'amber' },
  { text: '> I AM [YOUR NAME] — DEVELOPER', delay: 5.8, color: 'amber' },
  { text: '> SCROLL TO EXPLORE ↓', delay: 6.6, color: 'green' },
]

/**
 * Hero screen overlay — typewriter boot sequence.
 * Rendered inside drei <Html> on the monitor screen position.
 */
export default function Hero() {
  const [visibleLines, setVisibleLines] = useState([])
  const containerRef = useRef()

  useEffect(() => {
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, line])
        // Auto-scroll to bottom
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
      }, line.delay * 1000)
    })
  }, [])

  return (
    <div
      ref={containerRef}
      className="crt-screen"
      style={{
        width: '340px',
        height: '220px',
        overflow: 'hidden',
        fontSize: '1rem',
      }}
    >
      {visibleLines.map((line, i) => (
        <TypewriterLine key={i} line={line} />
      ))}
      {/* Blinking cursor on last line */}
      <span className="cursor-blink" />
    </div>
  )
}

function TypewriterLine({ line }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!line.text) {
      setDone(true)
      return
    }
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(line.text.slice(0, i + 1))
      i++
      if (i >= line.text.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, 28)
    return () => clearInterval(interval)
  }, [line.text])

  return (
    <div
      className={`terminal-line ${line.color === 'amber' ? 'amber' : ''}`}
      style={{ minHeight: '1.4em' }}
    >
      {displayed}
    </div>
  )
}
