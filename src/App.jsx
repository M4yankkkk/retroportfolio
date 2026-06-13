import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import * as THREE from 'three'

import Scene from './components/Scene'
import CustomCursor from './components/CustomCursor'

gsap.registerPlugin(ScrollTrigger)

// ─── Loading Screen ──────────────────────────────────────────────────────────
function LoadingScreen({ progress, done }) {
  if (done) return null
  return (
    <div className="loading-screen" style={{ opacity: done ? 0 : 1, transition: 'opacity 0.5s' }}>
      <div style={{ fontSize: '2rem', letterSpacing: '0.15em', marginBottom: 8 }}>
        PORTFOLIO.EXE
      </div>
      <div style={{ fontSize: '1rem', opacity: 0.6, marginBottom: 20 }}>
        LOADING SYSTEM FILES...
      </div>
      <div className="loading-bar-track">
        <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div style={{ marginTop: 10, fontSize: '0.9rem', opacity: 0.5 }}>
        {Math.round(progress)}%
      </div>
      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: '0.75rem', opacity: 0.3 }}>
        IBM PC BIOS · 1983 · 256K BASE MEMORY
      </div>
    </div>
  )
}

// ─── Audio Toggle ────────────────────────────────────────────────────────────
function AudioToggle() {
  const [muted, setMuted] = useState(true)
  const audioRef = useRef(null)

  useEffect(() => {
    // Tiny inline ambient hum via Web Audio API (no external file needed)
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(60, ctx.currentTime)
    gainNode.gain.setValueAtTime(0, ctx.currentTime)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.start()

    audioRef.current = { ctx, oscillator, gainNode }

    return () => {
      oscillator.stop()
      ctx.close()
    }
  }, [])

  const toggle = () => {
    const { ctx, gainNode } = audioRef.current
    if (ctx.state === 'suspended') ctx.resume()

    const newMuted = !muted
    setMuted(newMuted)
    gainNode.gain.setTargetAtTime(newMuted ? 0 : 0.018, ctx.currentTime, 0.3)
  }

  return (
    <button
      className={`power-btn ${!muted ? 'active' : ''}`}
      onClick={toggle}
      title={muted ? 'Unmute ambient sound' : 'Mute'}
      aria-label={muted ? 'Enable ambient sound' : 'Disable ambient sound'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}

// ─── Scroll Section Markers ──────────────────────────────────────────────────
const SECTIONS = [
  { id: 'hero',     label: 'BOOT' },
  { id: 'about',    label: 'ABOUT' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'skills',   label: 'SKILLS' },
  { id: 'contact',  label: 'CONTACT' },
]

// ─── Nav ─────────────────────────────────────────────────────────────────────
function RetroNav({ activeSection }) {
  return (
    <nav
      style={{
        position: 'fixed',
        top: '50%',
        left: '1.5rem',
        transform: 'translateY(-50%)',
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#section-${s.id}`}
          style={{
            fontFamily: 'VT323, monospace',
            fontSize: '0.85rem',
            color: activeSection === s.id ? '#33ff33' : 'rgba(51,255,51,0.3)',
            textDecoration: 'none',
            letterSpacing: '0.1em',
            textShadow: activeSection === s.id ? '0 0 8px #33ff33' : 'none',
            transition: 'color 0.2s, text-shadow 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ opacity: activeSection === s.id ? 1 : 0 }}>▶</span>
          {s.label}
        </a>
      ))}
    </nav>
  )
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [loadProgress, setLoadProgress] = useState(0)
  const [loadDone, setLoadDone]         = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [isMobile, setIsMobile]         = useState(false)

  // Camera state — mutable refs so R3F can read each frame without re-renders
  const cameraState = useRef({
    position: new THREE.Vector3(0.3, 0.9, 2.2),
    target:   new THREE.Vector3(0, 0.42, 0),
  })

  // ── Detect mobile ──
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Fake loading progress (real asset loads happen inside Suspense) ──
  useEffect(() => {
    let p = 0
    const id = setInterval(() => {
      p += Math.random() * 18
      if (p >= 100) {
        p = 100
        clearInterval(id)
        setTimeout(() => setLoadDone(true), 400)
      }
      setLoadProgress(p)
    }, 120)
    return () => clearInterval(id)
  }, [])

  // ── Lenis smooth scroll ──
  useEffect(() => {
    if (!loadDone) return

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
    }
  }, [loadDone])

  // ── GSAP ScrollTrigger camera choreography ──
  useEffect(() => {
    if (!loadDone || isMobile) return

    const CAMERA_PRESETS = {
      hero:     { pos: [0.3, 0.9, 2.2],   tgt: [0, 0.42, 0] },
      about:    { pos: [1.2, 0.7, 1.8],   tgt: [0, 0.42, 0] },
      projects: { pos: [-1.0, 0.7, 1.8],  tgt: [0, 0.42, 0] },
      skills:   { pos: [0, 1.1, 1.9],     tgt: [0, 0.42, 0] },
      contact:  { pos: [0.2, 0.5, 1.7],   tgt: [0, 0.42, 0] },
    }

    const triggers = []

    SECTIONS.slice(1).forEach(({ id }) => {
      const cfg = CAMERA_PRESETS[id]
      const el  = document.getElementById(`section-${id}`)
      if (!el) return

      const t1 = gsap.to(cameraState.current.position, {
        x: cfg.pos[0], y: cfg.pos[1], z: cfg.pos[2],
        ease: 'power2.inOut',
        scrollTrigger: { trigger: el, start: 'top 75%', end: 'top 25%', scrub: 2 },
      })
      const t2 = gsap.to(cameraState.current.target, {
        x: cfg.tgt[0], y: cfg.tgt[1], z: cfg.tgt[2],
        ease: 'power2.inOut',
        scrollTrigger: { trigger: el, start: 'top 75%', end: 'top 25%', scrub: 2 },
      })
      triggers.push(t1, t2)
    })

    // Section detection for nav highlight & screen content
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(`section-${id}`)
      if (!el) return
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 45%',
        onEnter:     () => setActiveSection(id),
        onEnterBack: () => setActiveSection(id),
      })
    })

    return () => {
      triggers.forEach(t => t.kill())
      ScrollTrigger.getAll().forEach(st => st.kill())
    }
  }, [loadDone, isMobile])

  return (
    <>
      <LoadingScreen progress={loadProgress} done={loadDone} />

      {/* Custom cursor — desktop only */}
      {!isMobile && <CustomCursor />}

      {/* Audio toggle */}
      <AudioToggle />

      {/* Retro side nav */}
      <RetroNav activeSection={activeSection} />

      {/* Fixed 3D canvas */}
      <div id="canvas-container" aria-hidden="true">
        <Scene
          cameraState={cameraState.current}
          activeSection={activeSection}
          isMobile={isMobile}
        />
      </div>

      {/* Scroll wrapper — sections drive ScrollTrigger */}
      <div id="scroll-wrapper">
        {/* Each section is a full-screen spacer that triggers camera moves.
            On mobile they become stacked content blocks. */}
        <section
          id="section-hero"
          className="section-spacer"
          style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '4rem' }}
        >
          {isMobile && (
            <div style={{ padding: '2rem', fontFamily: 'VT323, monospace', color: '#33ff33' }}>
              <div style={{ fontSize: '2rem', textShadow: '0 0 10px #33ff33' }}>
                [ YOUR NAME ]
              </div>
              <div style={{ fontSize: '1.1rem', opacity: 0.7, marginTop: 8 }}>
                Developer · Builder · Human
              </div>
              <div style={{ marginTop: 16, fontSize: '0.9rem', opacity: 0.5 }}>
                ↓ Scroll to explore
              </div>
            </div>
          )}
        </section>

        <section
          id="section-about"
          className="section-spacer"
          style={isMobile ? { height: 'auto', padding: '6rem 1.5rem' } : {}}
        >
          {isMobile && (
            <div className="dos-window" style={{ maxWidth: 480 }}>
              <div className="dos-titlebar"><span>■ ABOUT.EXE</span></div>
              <div className="dos-content">
                <div className="terminal-line">Hi, I'm [YOUR NAME].</div>
                <div className="terminal-line" style={{ opacity: 0.75, marginTop: 8 }}>
                  Full-stack developer. I build things people use.
                </div>
              </div>
            </div>
          )}
        </section>

        <section
          id="section-projects"
          className="section-spacer"
          style={isMobile ? { height: 'auto', padding: '6rem 1.5rem' } : {}}
        >
          {isMobile && (
            <div style={{ fontFamily: 'VT323, monospace', color: '#33ff33' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 16 }}>C:\PROJECTS\</div>
              {['Project One', 'Project Two', 'Project Three'].map(p => (
                <div key={p} style={{ padding: '6px 0', borderBottom: '1px solid rgba(51,255,51,0.2)', fontSize: '1.1rem' }}>
                  📄 {p.toUpperCase().replace(' ', '_')}.EXE
                </div>
              ))}
            </div>
          )}
        </section>

        <section
          id="section-skills"
          className="section-spacer"
          style={isMobile ? { height: 'auto', padding: '6rem 1.5rem' } : {}}
        >
          {isMobile && (
            <div style={{ fontFamily: 'VT323, monospace', color: '#33ff33' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 16 }}>SKILLS.SYS</div>
              {['JavaScript 92%', 'React 90%', 'Node 82%', 'TypeScript 88%'].map(s => (
                <div key={s} style={{ marginBottom: 8, fontSize: '1.1rem' }}>{s}</div>
              ))}
            </div>
          )}
        </section>

        <section
          id="section-contact"
          className="section-spacer"
          style={isMobile ? { height: 'auto', padding: '6rem 1.5rem 10rem' } : {}}
        >
          {isMobile && (
            <div style={{ fontFamily: 'VT323, monospace', color: '#33ff33', maxWidth: 400 }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 16 }}>MAIL.EXE</div>
              <div style={{ opacity: 0.7, marginBottom: 16 }}>
                Drop me a message at:<br />
                <span style={{ color: '#ffb000' }}>hello@yourdomain.com</span>
              </div>
              <a
                href="mailto:hello@yourdomain.com"
                className="retro-btn"
                style={{ display: 'inline-block', textDecoration: 'none' }}
              >
                [ SEND EMAIL ]
              </a>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer style={{
          padding: '3rem',
          textAlign: 'center',
          fontFamily: 'VT323, monospace',
          color: 'rgba(51,255,51,0.3)',
          fontSize: '0.85rem',
          borderTop: '1px solid rgba(51,255,51,0.1)',
          background: '#050505',
        }}>
          <div>PORTFOLIO.EXE v1.0 · Built with React + Three.js</div>
          <div style={{ marginTop: 6 }}>
            © {new Date().getFullYear()} [YOUR NAME] · All rights reserved.
          </div>
          <div style={{ marginTop: 6, opacity: 0.5 }}>
            C:\&gt; <span className="cursor-blink" />
          </div>
        </footer>
      </div>
    </>
  )
}
