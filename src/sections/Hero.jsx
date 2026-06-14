import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const BOOT_LINES = [
  { text: 'IBM PCjr BIOS v2.10', delay: 0, color: 'green' },
  { text: '640K RAM OK', delay: 0.6, color: 'green' },
  { text: '', delay: 1.0, color: 'green' },
  { text: 'BOOTING SYSTEM...', delay: 1.2, color: 'amber' },
  { text: 'LOADING PORTFOLIO.EXE', delay: 2.1, color: 'amber' },
  { text: 'INITIALIZING MODULES...', delay: 2.9, color: 'green' },
  { text: '[OK] Graphics subsystem', delay: 3.5, color: 'green' },
  { text: '[OK] Audio driver', delay: 3.9, color: 'green' },
  { text: '[OK] Network stack', delay: 4.3, color: 'green' },
  { text: '', delay: 4.7, color: 'green' },
  { text: '> WELCOME, HUMAN.', delay: 5.0, color: 'amber' },
  { text: '> I AM MAYANK TIWARI — DEVELOPER', delay: 5.8, color: 'amber' },
  { text: '> SCROLL TO EXPLORE ↓', delay: 6.6, color: 'green' },
]

const DIRECTORIES = [
  { name: 'ABOUT', id: 'about' },
  { name: 'PROJECTS', id: 'projects' },
  { name: 'SKILLS', id: 'skills' },
  { name: 'CONTACT', id: 'contact' }
]

/**
 * Hero screen overlay — typewriter boot sequence.
 * Rendered inside drei <Html> on the monitor screen position.
 */
export default function Hero({ onNavigate }) {
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
        width: '280px',
        height: '350px',
        overflow: 'hidden',
        fontSize: '1rem',
        // backgroundColor: onNavigate ? '#100e04' : undefined,
        backgroundColor: '#100e04',

      }}
    >
      {!onNavigate ? (
        <>
          {visibleLines.map((line, i) => (
            <TypewriterLine key={i} line={line} />
          ))}
          <span className="cursor-blink" />
        </>
      ) : (
        <div className="os-directory" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ color: '#33ff33', marginBottom: '15px' }}>
            C:\&gt; DIR<br />
            Volume in drive C is PORTFOLIO<br />
            Directory of C:\
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '10px' }}>
            {DIRECTORIES.map(dir => (
              <div
                key={dir.id}
                onClick={() => onNavigate(dir.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#33ff33'
                  e.currentTarget.style.color = '#000'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#33ff33'
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '200px',
                  cursor: 'pointer',
                  padding: '2px 8px',
                  fontFamily: 'VT323, monospace',
                  fontSize: '1.1rem',
                  border: '1px solid transparent',
                  transition: 'background 0.1s, color 0.1s'
                }}
              >
                <span>{dir.name}</span>
                <span>&lt;DIR&gt;</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '15px', color: '#33ff33' }}>
            {DIRECTORIES.length} File(s)<br />
            C:\&gt; <span className="cursor-blink" />
          </div>
        </div>
      )}
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
