import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SKILLS = [
  { name: 'JAVASCRIPT.SYS',   pct: 92, color: '#33ff33' },
  { name: 'TYPESCRIPT.SYS',   pct: 88, color: '#33ff33' },
  { name: 'REACT.EXE',        pct: 90, color: '#33ff33' },
  { name: 'NODE.EXE',         pct: 82, color: '#33ff33' },
  { name: 'THREE_JS.DLL',     pct: 75, color: '#ffb000' },
  { name: 'POSTGRES.DB',      pct: 78, color: '#33ff33' },
  { name: 'DOCKER.SYS',       pct: 70, color: '#ffb000' },
  { name: 'DESIGN_UI.EXE',    pct: 80, color: '#33ff33' },
]

const BAR_TOTAL = 12

function SkillBar({ skill, animate }) {
  const [filled, setFilled] = useState(0)

  useEffect(() => {
    if (!animate) return
    const target = Math.round((skill.pct / 100) * BAR_TOTAL)
    let current = 0
    const interval = setInterval(() => {
      current++
      setFilled(current)
      if (current >= target) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [animate, skill.pct])

  return (
    <div className="retro-progress">
      <div style={{ fontSize: '0.8rem', marginBottom: 1, color: skill.color }}>
        {skill.name}
      </div>
      <div style={{ fontSize: '0.85rem', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
        <span className="bar-fill" style={{ color: skill.color }}>{'█'.repeat(filled)}</span>
        <span className="bar-track" style={{ color: 'rgba(51,255,51,0.2)' }}>{'░'.repeat(BAR_TOTAL - filled)}</span>
        <span style={{ marginLeft: 6, color: 'rgba(51,255,51,0.7)', fontSize: '0.75rem' }}>
          {skill.pct}%
        </span>
      </div>
    </div>
  )
}

export default function Skills() {
  const [animate, setAnimate] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: '#section-skills',
      start: 'top 60%',
      onEnter: () => setAnimate(true),
    })
    return () => trigger.kill()
  }, [])

  return (
    <div className="dos-window" ref={ref} style={{ width: '380px', fontSize: '0.85rem' }}>
      <div className="dos-titlebar">
        <span>■ SYSINFO.EXE — SKILLS</span>
        <span>[ □ ] [ ✕ ]</span>
      </div>
      <div className="dos-content" style={{ padding: '10px 12px' }}>
        <div className="terminal-line amber" style={{ marginBottom: 8, fontSize: '0.8rem' }}>
          C:\&gt; sysinfo /skills /verbose
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '16px', rowGap: '8px' }}>
          {SKILLS.map((skill) => (
            <SkillBar key={skill.name} skill={skill} animate={animate} />
          ))}
        </div>

        <div style={{ marginTop: 10 }}>
          <span className="terminal-line" style={{ opacity: 0.5 }}>C:\&gt; </span>
          <span className="cursor-blink" />
        </div>
      </div>
    </div>
  )
}
