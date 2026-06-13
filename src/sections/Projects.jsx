import { useState } from 'react'

const PROJECTS = [
  {
    id: 'proj1',
    name: 'SKILLSWAP.EXE',
    size: '2,048 bytes',
    date: '2025-09-01',
    description: 'Peer-to-peer skill exchange platform. Secure auth using JWT, persistent sessions, and role-based access.',
    tech: ['React', 'Node.js', 'MongoDB'],
    url: 'https://github.com/m4yankkkk',
    live: null,
  },
  {
    id: 'proj2',
    name: 'COASTAL_MONITOR.EXE',
    size: '1,337 bytes',
    date: '2025-12-01',
    description: 'ML-driven coastal erosion monitor. Extracted shoreline trends from Sentinel-2 imagery using OpenCV and Earth Engine.',
    tech: ['Python', 'OpenCV', 'Earth Engine'],
    url: 'https://github.com/m4yankkkk',
    live: null,
  },
  {
    id: 'proj3',
    name: 'ORION_ORCHESTRATOR.SYS',
    size: '4,096 bytes',
    date: '2025-11-01',
    description: 'Distributed container orchestrator using Raft for consensus. Engineered OCI-compliant runtime with namespaces and cgroups.',
    tech: ['Go', 'gRPC', 'Linux Kernel', 'Raft'],
    url: 'https://github.com/m4yankkkk',
    live: null,
  },
]

export default function Projects() {
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)

  if (selected) {
    return <ProjectModal project={selected} onClose={() => setSelected(null)} />
  }

  return (
    <div className="dos-window" style={{ width: '380px', fontSize: '0.95rem' }}>
      <div className="dos-titlebar">
        <span>■ C:\PROJECTS\</span>
        <span>[ □ ] [ ✕ ]</span>
      </div>
      <div className="dos-content">
        <div className="terminal-line" style={{ marginBottom: 6, color: 'rgba(51,255,51,0.5)', fontSize: '0.85rem' }}>
          Volume: PORTFOLIO  Serial: 1984-1987
        </div>
        <div className="terminal-line" style={{ marginBottom: 8, color: 'rgba(51,255,51,0.5)', fontSize: '0.85rem' }}>
          {PROJECTS.length} file(s) · Press ENTER to open
        </div>

        {PROJECTS.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelected(p)}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '3px 6px',
              marginBottom: 2,
              background: hovered === p.id ? '#33ff33' : 'transparent',
              color: hovered === p.id ? '#000' : '#33ff33',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontFamily: 'VT323, monospace',
              transition: 'background 0.08s',
            }}
          >
            <span>📄 {p.name}</span>
            <span style={{ opacity: 0.6 }}>{p.size}</span>
          </div>
        ))}

        <div style={{ marginTop: 10 }}>
          <span className="terminal-line" style={{ opacity: 0.5 }}>C:\PROJECTS&gt; </span>
          <span className="cursor-blink" />
        </div>
      </div>
    </div>
  )
}

function ProjectModal({ project, onClose }) {
  return (
    <div className="dos-window" style={{ width: '380px', fontSize: '0.95rem' }}>
      <div className="dos-titlebar" style={{ justifyContent: 'space-between' }}>
        <span>■ {project.name}</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer', fontFamily: 'VT323, monospace', fontSize: '1rem', fontWeight: 'bold' }}
        >
          [✕] CLOSE
        </button>
      </div>
      <div className="dos-content" style={{ padding: '16px' }}>
        <div style={{ color: '#33ff33', fontSize: '0.85rem', marginBottom: 10, opacity: 0.6 }}>
          Last modified: {project.date} · {project.size}
        </div>
        <div style={{ color: '#33ff33', fontSize: '1rem', marginBottom: 14, lineHeight: 1.5 }}>
          {project.description}
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ color: '#ffb000', marginBottom: 6, fontSize: '0.9rem' }}>TECH STACK:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {project.tech.map(t => (
              <span
                key={t}
                style={{
                  border: '1px solid #33ff33',
                  color: '#33ff33',
                  padding: '2px 8px',
                  fontSize: '0.85rem',
                  fontFamily: 'VT323, monospace',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            <button className="retro-btn">[ VIEW SOURCE ]</button>
          </a>
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer">
              <button className="retro-btn" style={{ background: '#ffb000' }}>[ LIVE DEMO ]</button>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
