import { useState } from 'react'

const PROJECTS = [
  {
    id: 'proj1',
    name: 'PROJECTNAME_1.EXE',
    size: '2,048 bytes',
    date: '2024-01-15',
    description: 'A full-stack SaaS app built with Next.js, Prisma, and Stripe. Handles user auth, billing, and a dashboard with real-time analytics.',
    tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe'],
    url: 'https://github.com/yourusername/project1',
    live: 'https://project1.com',
  },
  {
    id: 'proj2',
    name: 'PROJECTNAME_2.EXE',
    size: '1,337 bytes',
    date: '2023-08-22',
    description: 'Open-source CLI tool for managing dev environments. 800+ GitHub stars. Written in Go with a plugin system.',
    tech: ['Go', 'CLI', 'Docker'],
    url: 'https://github.com/yourusername/project2',
    live: null,
  },
  {
    id: 'proj3',
    name: 'PROJECTNAME_3.SYS',
    size: '4,096 bytes',
    date: '2023-03-10',
    description: 'Mobile app for tracking habits with gamification elements. React Native + Firebase backend. 5k+ downloads.',
    tech: ['React Native', 'Firebase', 'Expo'],
    url: 'https://github.com/yourusername/project3',
    live: 'https://apps.apple.com/app/project3',
  },
  {
    id: 'proj4',
    name: 'SIDE_QUEST.BAT',
    size: '512 bytes',
    date: '2022-11-01',
    description: 'Browser extension that replaces all images with pictures of capybaras. 2k+ Chrome Web Store installs.',
    tech: ['JavaScript', 'Chrome Extension API'],
    url: 'https://github.com/yourusername/project4',
    live: null,
  },
]

export default function Projects() {
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)

  return (
    <>
      <div className="dos-window" style={{ width: '340px', fontSize: '0.95rem' }}>
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

      {/* Project detail modal */}
      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}

function ProjectModal({ project, onClose }) {
  return (
    <div className="retro-modal-overlay" onClick={onClose}>
      <div className="retro-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dos-titlebar" style={{ justifyContent: 'space-between' }}>
          <span>■ {project.name}</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer', fontFamily: 'VT323, monospace', fontSize: '1rem' }}
          >
            [✕ CLOSE]
          </button>
        </div>
        <div style={{ padding: '16px', fontFamily: 'VT323, monospace' }}>
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

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
    </div>
  )
}
