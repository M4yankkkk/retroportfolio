import { useState, useRef } from 'react'

export default function Contact({ onNavigate, onBack }) {
  const [form, setForm] = useState({ name: '', email: '', message: '', botcheck: false })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [lines, setLines] = useState([
    '> MAIL.EXE initialized',
    '> Server: smtp.portfolio.local:25',
    '> Ready to transmit.',
    '',
  ])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Honeypot check for spam bots
    if (form.botcheck) {
      console.warn("Spam detected. Aborting transmission.")
      return
    }

    if (!form.name || !form.email || !form.message) return
    setSending(true)
    setLines(prev => [...prev, `> SENDING to tiwarimayank485@gmail.com...`, '> Encoding message...'])

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
          name: form.name,
          email: form.email,
          message: form.message,
        })
      });

      const result = await response.json();
      
      if (response.status === 200) {
        setLines(prev => [...prev, '> [200 OK] Message delivered.', '> Thank you! I\'ll reply soon.'])
        setSent(true)
        setForm({ name: '', email: '', message: '', botcheck: false })
      } else {
        setLines(prev => [...prev, '> [ERROR] Transmission failed.', `> ${result.message}`])
      }
    } catch (error) {
      setLines(prev => [...prev, '> [ERROR] Connection lost.', '> Please try again later.'])
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    if (onBack) onBack()
    else if (onNavigate) onNavigate('hero')
    else document.getElementById('section-hero')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="dos-window" style={{ width: '340px' }}>
      <div className="dos-titlebar">
        <span>■ MAIL.EXE — SEND MESSAGE</span>
        <span>
          [ □ ] <span style={{ cursor: 'pointer' }} onClick={handleClose}>[ ✕ ]</span>
        </span>
      </div>
      <div className="dos-content" style={{ padding: '12px 14px' }}>

        {/* Terminal log */}
        <div style={{ marginBottom: 6, maxHeight: 48, overflow: 'hidden' }}>
          {lines.map((l, i) => (
            <div key={i} className="terminal-line" style={{ fontSize: '0.8rem', opacity: l ? 1 : 0.1 }}>
              {l || '─'}
            </div>
          ))}
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            {/* Honeypot Spam Protection (Invisible to humans) */}
            <input 
              type="checkbox" 
              name="botcheck" 
              style={{ display: 'none' }} 
              checked={form.botcheck}
              onChange={(e) => setForm({ ...form, botcheck: e.target.checked })} 
            />

            <div style={{ marginBottom: 6 }}>
              <div className="terminal-line" style={{ fontSize: '0.85rem', marginBottom: 3 }}>FROM_NAME:</div>
              <input
                className="retro-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name..."
                autoComplete="off"
              />
            </div>

            <div style={{ marginBottom: 6 }}>
              <div className="terminal-line" style={{ fontSize: '0.85rem', marginBottom: 3 }}>FROM_EMAIL:</div>
              <input
                className="retro-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="user@domain.com"
                autoComplete="off"
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <div className="terminal-line" style={{ fontSize: '0.85rem', marginBottom: 3 }}>MESSAGE_BODY:</div>
              <textarea
                className="retro-input"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Type your message..."
                rows={2}
                style={{ resize: 'none', display: 'block' }}
              />
            </div>

            <button
              type="submit"
              className="retro-btn"
              disabled={sending}
              style={{ width: '100%', fontSize: '1rem', letterSpacing: '0.1em' }}
            >
              {sending ? '[ TRANSMITTING... ]' : '[ SEND MESSAGE > ]'}
            </button>
          </form>
        ) : (
          <div>
            <div className="terminal-line amber" style={{ fontSize: '1rem', marginBottom: 8 }}>
              ✓ TRANSMISSION COMPLETE
            </div>
            <div className="terminal-line" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Message delivered successfully.<br />
              Expect a reply within 24–48 hrs.
            </div>
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <span className="terminal-line" style={{ opacity: 0.5 }}>C:\MAIL&gt; </span>
          <span className="cursor-blink" />
        </div>
      </div>
    </div>
  )
}
