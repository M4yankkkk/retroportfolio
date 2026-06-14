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
  { id: 'hero', label: 'BOOT' },
  { id: 'about', label: 'ABOUT' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'contact', label: 'CONTACT' },
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
const CAMERA_PRESETS = {
  hero: { pos: [-0.55, -0.06, 1.28], tgt: [0.27, -0.31, -0.28], html: { pos: [0.06, 0.42, 0.35], scale: 0.30 } },
  // about: { pos: [0.08, -0.06, 1.56], tgt: [0.08, -0.31, -0.32], html: { pos: [0.06, 0.42, 0.35], scale: 0.30 } },
  about: { pos: [0.08, 0.15, 1.16], tgt: [0.03, -0.31, -0.32], html: { pos: [0.06, 0.42, 0.35], scale: 0.30 } },
  // projects: { pos: [0.44, 0.25, 0.97], tgt: [-0.45, -0.42, -0.04], html: { pos: [0.06, 0.42, 0.35], scale: 0.30 } },

  projects: { pos: [0.38, 0.28, 1.07], tgt: [-0.24, -0.42, -0.04], html: { pos: [0.06, 0.42, 0.35], scale: 0.30 } },
  skills: { pos: [-0.38, 0.29, 1.13], tgt: [0.3, -0.33, -0.04], html: { pos: [0.06, 0.42, 0.35], scale: 0.30 } },
  contact: { pos: [-0.04, 0.23, 1.41], tgt: [0.14, -0.38, -0.35], html: { pos: [0.06, 0.40, 0.31], scale: 0.30 } },
}

export default function App() {
  const [loadProgress, setLoadProgress] = useState(0)
  const [loadDone, setLoadDone] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [interactiveSection, setInteractiveSection] = useState('hero')
  const [isMobile, setIsMobile] = useState(false)
  const [isInteractive, setIsInteractive] = useState(false)
  const [lenisInst, setLenisInst] = useState(null)

  const [debugCam, setDebugCam] = useState({ x: 0.3, y: 0.9, z: 2.2, tx: 0, ty: 0.42, tz: 0 })
  const [debugHtml, setDebugHtml] = useState({ hx: 0.06, hy: 0.42, hz: 0.41, hs: 0.30 })
  const [debugBox, setDebugBox] = useState({ bw: 1.10, bh: 0.52, bd: 1.48, bx: -0.12, by: 0.24, bz: 0.23, show: 0 })
  const [savedPresets, setSavedPresets] = useState({})
  const [showSliders, setShowSliders] = useState(true)

  // Camera state — mutable refs so R3F can read each frame without re-renders
  const cameraState = useRef({
    position: new THREE.Vector3(0.3, 0.9, 2.2),
    target: new THREE.Vector3(0, 0.42, 0),
  })

  // Html overlay state
  const htmlState = useRef({
    position: new THREE.Vector3(0.06, 0.42, 0.41),
    scale: new THREE.Vector3(0.30, 0.30, 0.30),
  })

  // Sync debug sliders when scrolling to a new section
  useEffect(() => {
    const p = CAMERA_PRESETS[activeSection]
    if (p) {
      setDebugCam({ x: p.pos[0], y: p.pos[1], z: p.pos[2], tx: p.tgt[0], ty: p.tgt[1], tz: p.tgt[2] })
      setDebugHtml({ hx: p.html.pos[0], hy: p.html.pos[1], hz: p.html.pos[2], hs: p.html.scale })
    }
  }, [activeSection])

  // Apply slider values directly to the camera and html refs
  useEffect(() => {
    cameraState.current.position.set(debugCam.x, debugCam.y, debugCam.z)
    cameraState.current.target.set(debugCam.tx, debugCam.ty, debugCam.tz)
    htmlState.current.position.set(debugHtml.hx, debugHtml.hy, debugHtml.hz)
    htmlState.current.scale.setScalar(debugHtml.hs)
    htmlState.current.boxData = { w: debugBox.bw, h: debugBox.bh, d: debugBox.bd, x: debugBox.bx, y: debugBox.by, z: debugBox.bz, show: debugBox.show }
  }, [debugCam, debugHtml, debugBox])

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

    setLenisInst(lenis)

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      setLenisInst(null)
      lenis.destroy()
    }
  }, [loadDone])

  // ── Handle Interactive Mode Toggle ──
  useEffect(() => {
    if (!isInteractive) {
      document.body.style.overflow = 'auto'
      lenisInst?.start()
      // Animate back to current section's preset
      const cfg = CAMERA_PRESETS[activeSection] || CAMERA_PRESETS.hero
      if (!isMobile) {
        gsap.to(cameraState.current.position, {
          x: cfg.pos[0], y: cfg.pos[1], z: cfg.pos[2],
          duration: 1.5, ease: 'power2.inOut', overwrite: 'auto'
        })
        gsap.to(cameraState.current.target, {
          x: cfg.tgt[0], y: cfg.tgt[1], z: cfg.tgt[2],
          duration: 1.5, ease: 'power2.inOut', overwrite: 'auto'
        })
      }
    } else {
      document.body.style.overflow = 'hidden'
      lenisInst?.stop()
      // Animate to perfectly frame the screen
      if (!isMobile) {
        gsap.to(cameraState.current.position, {
          x: 0.08, y: 0.15, z: 1.16, // close up
          duration: 1.5, ease: 'power2.inOut', overwrite: 'auto'
        })
        gsap.to(cameraState.current.target, {
          x: 0.03, y: -0.31, z: -0.32,
          duration: 1.5, ease: 'power2.inOut', overwrite: 'auto'
        })
      }
    }
  }, [isInteractive, lenisInst, activeSection, isMobile])

  // ── GSAP ScrollTrigger camera choreography ──
  useEffect(() => {
    if (!loadDone || isMobile) return

    const triggers = []

    let prevId = SECTIONS[0].id
    SECTIONS.slice(1).forEach(({ id }) => {
      const cfg = CAMERA_PRESETS[id]
      const prevCfg = CAMERA_PRESETS[prevId]
      const el = document.getElementById(`section-${id}`)
      if (!el) return

      const t1 = gsap.fromTo(cameraState.current.position,
        { x: prevCfg.pos[0], y: prevCfg.pos[1], z: prevCfg.pos[2] },
        {
          x: cfg.pos[0], y: cfg.pos[1], z: cfg.pos[2],
          ease: 'power2.inOut',
          scrollTrigger: { trigger: el, start: 'top 75%', end: 'top 25%', scrub: 2 },
          immediateRender: false
        }
      )
      const t2 = gsap.fromTo(cameraState.current.target,
        { x: prevCfg.tgt[0], y: prevCfg.tgt[1], z: prevCfg.tgt[2] },
        {
          x: cfg.tgt[0], y: cfg.tgt[1], z: cfg.tgt[2],
          ease: 'power2.inOut',
          scrollTrigger: { trigger: el, start: 'top 75%', end: 'top 25%', scrub: 2 },
          immediateRender: false
        }
      )
      const t3 = gsap.fromTo(htmlState.current.position,
        { x: prevCfg.html.pos[0], y: prevCfg.html.pos[1], z: prevCfg.html.pos[2] },
        {
          x: cfg.html.pos[0], y: cfg.html.pos[1], z: cfg.html.pos[2],
          ease: 'power2.inOut',
          scrollTrigger: { trigger: el, start: 'top 75%', end: 'top 25%', scrub: 2 },
          immediateRender: false
        }
      )
      const t4 = gsap.fromTo(htmlState.current.scale,
        { x: prevCfg.html.scale, y: prevCfg.html.scale, z: prevCfg.html.scale },
        {
          x: cfg.html.scale, y: cfg.html.scale, z: cfg.html.scale,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: el, start: 'top 75%', end: 'top 25%', scrub: 2 },
          immediateRender: false
        }
      )
      triggers.push(t1, t2, t3, t4)
      prevId = id
    })

    // Section detection for nav highlight & screen content
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(`section-${id}`)
      if (!el) return
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 45%',
        onEnter: () => setActiveSection(id),
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

      {/* Temporary Debug Panel */}
      {import.meta.env.DEV && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, color: 'lime', fontFamily: 'VT323, monospace', background: 'rgba(0,0,0,0.85)', padding: '15px', borderRadius: '5px', width: showSliders ? '310px' : 'auto', border: '1px solid lime', userSelect: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showSliders ? '10px' : '0' }}>
            {showSliders && <h3 style={{ margin: 0, borderBottom: '1px solid lime', textTransform: 'uppercase', fontSize: '1.2rem', width: '100%' }}>Pos: {activeSection}</h3>}
            <button
              onClick={() => setShowSliders(!showSliders)}
              style={{ background: 'lime', color: 'black', padding: '2px 8px', border: 'none', cursor: 'pointer', fontFamily: 'VT323, monospace', fontSize: '1rem', marginLeft: showSliders ? '10px' : '0' }}
            >
              {showSliders ? 'Hide' : 'Debug'}
            </button>
          </div>

          {showSliders && (
            <>
              {['x', 'y', 'z'].map(axis => (
                <div key={axis} style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                  <label style={{ display: 'inline-block', width: '30px' }}>P_{axis.toUpperCase()}</label>
                  <input type="range" min="-3" max="5" step="0.01" value={debugCam[axis]} onChange={(e) => setDebugCam({ ...debugCam, [axis]: parseFloat(e.target.value) })} style={{ width: '150px' }} />
                  <span style={{ marginLeft: '10px', width: '40px', textAlign: 'right' }}>{debugCam[axis].toFixed(2)}</span>
                </div>
              ))}

              <div style={{ height: '5px' }} />

              {['tx', 'ty', 'tz'].map(axis => (
                <div key={axis} style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                  <label style={{ display: 'inline-block', width: '30px' }}>T_{axis.replace('t', '').toUpperCase()}</label>
                  <input type="range" min="-3" max="3" step="0.01" value={debugCam[axis]} onChange={(e) => setDebugCam({ ...debugCam, [axis]: parseFloat(e.target.value) })} style={{ width: '150px' }} />
                  <span style={{ marginLeft: '10px', width: '40px', textAlign: 'right' }}>{debugCam[axis].toFixed(2)}</span>
                </div>
              ))}

              <div style={{ height: '5px', borderBottom: '1px solid lime', marginBottom: '10px' }} />

              {['hx', 'hy', 'hz', 'hs'].map(axis => (
                <div key={axis} style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                  <label style={{ display: 'inline-block', width: '30px' }}>H_{axis.replace('h', '').toUpperCase()}</label>
                  <input type="range" min={axis === 'hs' ? 0.05 : -1} max={axis === 'hs' ? 1 : 1} step="0.01" value={debugHtml[axis]} onChange={(e) => setDebugHtml({ ...debugHtml, [axis]: parseFloat(e.target.value) })} style={{ width: '150px' }} />
                  <span style={{ marginLeft: '10px', width: '40px', textAlign: 'right' }}>{debugHtml[axis].toFixed(2)}</span>
                </div>
              ))}

              <div style={{ height: '5px', borderBottom: '1px solid lime', marginBottom: '10px' }} />

              {['bw', 'bh', 'bd', 'bx', 'by', 'bz', 'show'].map(axis => (
                <div key={axis} style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                  <label style={{ display: 'inline-block', width: '30px' }}>B_{axis.replace('b', '').toUpperCase()}</label>
                  <input type="range" min={axis === 'show' ? 0 : -3} max={axis === 'show' ? 1 : 3} step={axis === 'show' ? 1 : 0.01} value={debugBox[axis]} onChange={(e) => setDebugBox({ ...debugBox, [axis]: parseFloat(e.target.value) })} style={{ width: '150px' }} />
                  <span style={{ marginLeft: '10px', width: '40px', textAlign: 'right' }}>{debugBox[axis].toFixed(2)}</span>
                </div>
              ))}

              <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setSavedPresets({ ...savedPresets, [activeSection]: { pos: [debugCam.x, debugCam.y, debugCam.z], tgt: [debugCam.tx, debugCam.ty, debugCam.tz], html: { pos: [debugHtml.hx, debugHtml.hy, debugHtml.hz], scale: debugHtml.hs } } })} style={{ background: 'green', color: 'black', padding: '5px 15px', border: 'none', cursor: 'pointer', fontFamily: 'VT323, monospace', fontSize: '1.1rem' }}>Save</button>
                <button onClick={() => navigator.clipboard.writeText(JSON.stringify(savedPresets, null, 2)).then(() => alert('Copied to clipboard!'))} style={{ background: 'lime', color: 'black', padding: '5px 15px', border: 'none', cursor: 'pointer', fontFamily: 'VT323, monospace', fontSize: '1.1rem' }}>Export</button>
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'green', wordWrap: 'break-word' }}>
                Saved: {Object.keys(savedPresets).join(', ') || 'none'}
              </div>
            </>
          )}
        </div>
      )}

      {/* Audio toggle */}
      <AudioToggle />

      {/* Mode Toggle */}
      {loadDone && !isMobile && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9000, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'VT323, monospace', color: '#33ff33', fontSize: '1.2rem', textShadow: '0 0 5px #33ff33' }}>
          <span style={{ opacity: isInteractive ? 0.5 : 1, cursor: 'pointer' }} onClick={() => setIsInteractive(false)}>STORY</span>
          <div 
            onClick={() => setIsInteractive(!isInteractive)}
            style={{ width: 44, height: 22, border: '2px solid #33ff33', borderRadius: 12, position: 'relative', cursor: 'pointer', background: 'rgba(0,0,0,0.5)' }}
          >
            <div style={{ position: 'absolute', top: 2, left: isInteractive ? 24 : 2, width: 14, height: 14, background: '#33ff33', borderRadius: '50%', transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </div>
          <span style={{ opacity: isInteractive ? 1 : 0.5, cursor: 'pointer' }} onClick={() => setIsInteractive(true)}>INTERACTIVE</span>
        </div>
      )}

      {/* Retro side nav */}
      {!isInteractive && <RetroNav activeSection={activeSection} />}

      {/* Fixed 3D canvas */}
      <div id="canvas-container" aria-hidden="true" style={{ background: '#080808' }}>
        <Scene
          cameraState={cameraState.current}
          htmlState={htmlState.current}
          activeSection={isInteractive ? interactiveSection : activeSection}
          isMobile={isMobile}
          onNavigate={isInteractive ? setInteractiveSection : null}
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
                MAYANK TIWARI
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
                <div className="terminal-line">Hi, I'm Mayank Tiwari.</div>
                <div className="terminal-line" style={{ opacity: 0.75, marginTop: 8 }}>
                  Web Developer @ IRIS, NITK. I build things people use.
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
              {['SkillSwap', 'Coastal Monitor', 'Orion Orchestrator'].map(p => (
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
              {['JavaScript 90%', 'Python 85%', 'C++ 80%', 'GoLang 75%'].map(s => (
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
                <span style={{ color: '#ffb000' }}>tiwarimayank485@gmail.com</span>
              </div>
              <a
                href="mailto:tiwarimayank485@gmail.com"
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
          pointerEvents: 'auto',
        }}>
          <div>PORTFOLIO.EXE v1.0 · Built with React + Three.js</div>
          <div style={{ marginTop: 6 }}>
            © {new Date().getFullYear()} Mayank Tiwari · All rights reserved.
          </div>
          <div style={{ marginTop: 6, opacity: 0.5 }}>
            C:\&gt; <span className="cursor-blink" />
          </div>
        </footer>
      </div>
    </>
  )
}
