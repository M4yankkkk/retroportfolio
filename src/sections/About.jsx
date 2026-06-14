/**
 * About.exe — retro window overlay for the About section.
 * Shown on the PCjr screen when camera dollies to the about angle.
 */
export default function About({ onNavigate }) {
  const handleClose = () => {
    if (onNavigate) {
      onNavigate('hero')
    } else {
      document.getElementById('section-hero')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="dos-window" style={{ width: '340px', fontSize: '1rem' }}>
      <div className="dos-titlebar">
        <span>■ ABOUT.EXE</span>
        <span>
          [ ? ] [ □ ] <span style={{ cursor: 'pointer' }} onClick={handleClose}>[ ✕ ]</span>
        </span>
      </div>
      <div className="dos-content" style={{ padding: '12px 14px' }}>
        <div className="terminal-line amber" style={{ marginBottom: 8 }}>
          ┌─ WHO AM I ─────────────────────┐
        </div>
        <div className="terminal-line" style={{ marginBottom: 6 }}>
          Hi. I'm Mayank Tiwari.
        </div>
        <div className="terminal-line" style={{ marginBottom: 6, color: 'rgba(51,255,51,0.75)' }}>
          A full-stack developer who loves<br/>
          building things people actually use.
        </div>
        <div className="terminal-line" style={{ marginBottom: 6 }}>
          Based in Surathkal, India.
        </div>
        <div className="terminal-line amber" style={{ marginTop: 10, marginBottom: 6 }}>
          ┌─ EXPERIENCE ───────────────────┐
        </div>
        <div className="terminal-line" style={{ color: 'rgba(51,255,51,0.75)' }}>
          Web Developer @ IRIS, NITK<br/>
          Building tools for 6,000+ users
        </div>
        <div className="terminal-line" style={{ marginTop: 10, color: 'rgba(51,255,51,0.5)' }}>
          └──────────────────────────────────┘
        </div>
        <div style={{ marginTop: 8 }}>
          <span className="terminal-line" style={{ color: 'rgba(51,255,51,0.5)' }}>C:\&gt; </span>
          <span className="cursor-blink" />
        </div>
      </div>
    </div>
  )
}
