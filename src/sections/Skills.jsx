import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const DIRECTORIES = [
  { 
    id: 'frontend', 
    name: 'FRONTEND', 
    skills: [
      { name: 'JavaScript', icon: 'https://cdn.simpleicons.org/javascript/33ff33', color: '#33ff33' },
      { name: 'React',      icon: 'https://cdn.simpleicons.org/react/33ff33', color: '#33ff33' }
    ] 
  },
  { 
    id: 'backend', 
    name: 'BACKEND', 
    skills: [
      { name: 'Python',     icon: 'https://cdn.simpleicons.org/python/33ff33', color: '#33ff33' },
      { name: 'Node.js',    icon: 'https://cdn.simpleicons.org/nodedotjs/33ff33', color: '#33ff33' },
      { name: 'Go',         icon: 'https://cdn.simpleicons.org/go/ffb000', color: '#ffb000' }
    ] 
  },
  { 
    id: 'tools', 
    name: 'TOOLS', 
    skills: [
      { name: 'C++',        icon: 'https://cdn.simpleicons.org/cplusplus/ffb000', color: '#ffb000' },
      { name: 'MongoDB',    icon: 'https://cdn.simpleicons.org/mongodb/ffb000', color: '#ffb000' },
      { name: 'Docker',     icon: 'https://cdn.simpleicons.org/docker/ffb000', color: '#ffb000' }
    ] 
  }
]

const BAR_TOTAL = 12

function Skill({ skill }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '8px',
      width: '70px',
      padding: '8px',
      cursor: 'pointer'
    }}>
      <div style={{ 
        width: '40px', 
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img src={skill.icon} alt={skill.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <div style={{ 
        fontSize: '0.85rem', 
        color: skill.color, 
        fontFamily: 'VT323, monospace',
        textAlign: 'center',
        lineHeight: '1'
      }}>
        {skill.name}
      </div>
    </div>
  )
}

export default function Skills({ onNavigate, onBack }) {
  const [animate, setAnimate] = useState(false)
  const [activeDir, setActiveDir] = useState('frontend')
  const ref = useRef()

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: '#section-skills',
      start: 'top 60%',
      onEnter: () => setAnimate(true),
    })
    return () => trigger.kill()
  }, [])

  const handleClose = () => {
    if (onBack) onBack()
    else if (onNavigate) onNavigate('hero')
    else document.getElementById('section-hero')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="dos-window" ref={ref} style={{ width: '420px', fontSize: '0.85rem' }}>
      <div className="dos-titlebar">
        <span>■ NC.EXE — SKILLS</span>
        <span>
          [ □ ] <span style={{ cursor: 'pointer' }} onClick={handleClose}>[ ✕ ]</span>
        </span>
      </div>
      <div className="dos-content" style={{ padding: '0', display: 'flex', flexDirection: 'row', height: '260px' }}>
        
        {/* LEFT PANE - DIRECTORIES */}
        <div style={{ flex: '0 0 140px', borderRight: '2px solid var(--crt-green)', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ color: '#33ff33', marginBottom: '8px', borderBottom: '1px solid #33ff33', paddingBottom: '4px' }}>
            C:\SKILLS&gt;
          </div>
          {DIRECTORIES.map(dir => (
            <div 
              key={dir.id} 
              onClick={() => setActiveDir(dir.id)}
              onMouseEnter={(e) => {
                if(activeDir !== dir.id) { e.currentTarget.style.background = '#33ff33'; e.currentTarget.style.color = '#000'; }
              }}
              onMouseLeave={(e) => {
                if(activeDir !== dir.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#33ff33'; }
              }}
              style={{ 
                cursor: 'pointer', 
                padding: '4px 6px',
                background: activeDir === dir.id ? '#33ff33' : 'transparent',
                color: activeDir === dir.id ? '#000' : '#33ff33',
                fontSize: '0.9rem',
                fontFamily: 'VT323, monospace',
                transition: 'background 0.1s, color 0.1s'
              }}
            >
              &lt;DIR&gt; {dir.name}
            </div>
          ))}
        </div>

        {/* RIGHT PANE - SKILLS */}
        <div style={{ flex: 1, padding: '10px 15px', display: 'flex', flexDirection: 'column' }}>
          <div className="terminal-line amber" style={{ marginBottom: 12, fontSize: '0.8rem' }}>
            DIR C:\SKILLS\{DIRECTORIES.find(d => d.id === activeDir).name}
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignContent: 'flex-start', flex: 1 }}>
            {DIRECTORIES.find(d => d.id === activeDir).skills.map((skill) => (
              <Skill key={`${activeDir}-${skill.name}`} skill={skill} />
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
            <span className="terminal-line" style={{ opacity: 0.5 }}>C:\&gt; </span>
            <span className="cursor-blink" />
          </div>
        </div>
        
      </div>
    </div>
  )
}
