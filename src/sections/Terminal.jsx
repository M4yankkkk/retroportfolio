import React, { useState, useEffect, useRef } from 'react'
import { useRetroAudio } from '../hooks/useRetroAudio'

export default function Terminal({ onNavigate, onBack }) {
  const { playKeyClack, playBlip, playCloseBlip } = useRetroAudio()
  const [history, setHistory] = useState([
    { type: 'output', text: 'MS-DOS Version 6.22' },
    { type: 'output', text: '(C)Copyright Microsoft Corp 1981-1994.' },
    { type: 'output', text: ' ' },
    { type: 'output', text: 'Type "help" for a list of available commands.' }
  ])
  const [input, setInput] = useState('')
  const inputRef = useRef(null)
  const terminalEndRef = useRef(null)

  // Auto-focus input on click anywhere in terminal
  const handleContainerClick = () => {
    if (inputRef.current) inputRef.current.focus()
  }

  // Scroll to bottom on new history — scroll the dos-content div, NOT the page
  const contentRef = useRef(null)
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [history])

  const handleKeyDown = (e) => {
    // Clack on every keypress
    if (e.key.length === 1 || e.key === 'Backspace') playKeyClack()
    if (e.key === 'Enter') {
      const cmd = input.trim()
      if (!cmd) {
        setHistory(prev => [...prev, { type: 'input', text: 'C:\\>' }])
        setInput('')
        return
      }

      const newHistory = [...history, { type: 'input', text: `C:\\>${cmd}` }]
      
      const args = cmd.toLowerCase().split(' ').filter(Boolean)
      const mainCmd = args[0]

      if (mainCmd === 'help') {
        newHistory.push(
          { type: 'output', text: 'Available commands:' },
          { type: 'output', text: '  help       - Show this message' },
          { type: 'output', text: '  dir        - List directory contents' },
          { type: 'output', text: '  cd <dir>   - Change directory (e.g. cd projects)' },
          { type: 'output', text: '  clear      - Clear the terminal screen' },
          { type: 'output', text: '  whoami     - Print current user' },
          { type: 'output', text: '  snake      - Execute SNAKE.EXE' },
          { type: 'output', text: '  exit/back  - Return to previous screen' },
        )
      } else if (mainCmd === 'dir' || mainCmd === 'ls') {
        newHistory.push(
          { type: 'output', text: ' Volume in drive C is PORTFOLIO' },
          { type: 'output', text: ' Directory of C:\\' },
          { type: 'output', text: ' ' },
          { type: 'output', text: '<DIR>          ABOUT' },
          { type: 'output', text: '<DIR>          SKILLS' },
          { type: 'output', text: '<DIR>          PROJECTS' },
          { type: 'output', text: '<DIR>          CONTACT' },
          { type: 'output', text: '        1 file(s)     SNAKE.EXE' },
          { type: 'output', text: '        1 file(s)     TERMINAL.EXE' }
        )
      } else if (mainCmd === 'clear' || mainCmd === 'cls') {
        setHistory([])
        setInput('')
        return
      } else if (mainCmd === 'whoami') {
        newHistory.push({ type: 'output', text: 'guest_user' })
      } else if (mainCmd === 'sudo') {
        newHistory.push({ type: 'output', text: 'Access Denied. This incident will be reported.' })
      } else if (mainCmd === 'snake') {
        newHistory.push({ type: 'output', text: 'Booting SNAKE.EXE...' })
        setTimeout(() => onNavigate('snake'), 500)
      } else if (mainCmd === 'exit' || mainCmd === 'back') {
        newHistory.push({ type: 'output', text: 'Returning to home...' })
        setTimeout(() => { if (onBack) onBack(); else if (onNavigate) onNavigate('hero') }, 400)
      } else if (mainCmd === 'cd') {
        const target = args[1]
        const validDirs = ['about', 'skills', 'projects', 'contact']
        if (!target) {
          newHistory.push({ type: 'output', text: 'Usage: cd <directory>' })
        } else if (target === '..') {
          newHistory.push({ type: 'output', text: 'Already at root.' })
        } else if (validDirs.includes(target)) {
          newHistory.push({ type: 'output', text: `Entering ${target.toUpperCase()}...` })
          setTimeout(() => onNavigate(target), 500)
        } else {
          newHistory.push({ type: 'output', text: `The system cannot find the path specified: ${target}` })
        }
      } else {
        newHistory.push({ type: 'output', text: `Bad command or file name: ${mainCmd}` })
      }

      setHistory(newHistory)
      setInput('')
    }
  }

  return (
    <div 
      className="dos-window" 
      onClick={handleContainerClick}
      style={{ 
        width: '350px', 
        height: '390px', 
        fontSize: '1rem', 
        display: 'flex', 
        flexDirection: 'column', 
        animation: 'fadeIn 0.5s ease-out' 
      }}
    >
      <div className="dos-titlebar">
        <span>■ TERMINAL.EXE</span>
        <button 
          onClick={(e) => { e.stopPropagation(); playCloseBlip(); if (onBack) onBack(); else if (onNavigate) onNavigate('hero'); }}
          className="retro-btn"
          style={{ padding: '2px 8px', fontSize: '0.9rem', cursor: 'pointer' }}
        >
          [X]
        </button>
      </div>
      <div ref={contentRef} className="dos-content" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {history.map((line, i) => (
          <div key={i} style={{ 
            color: line.type === 'input' ? '#fff' : '#33ff33',
            marginBottom: line.type === 'input' ? '4px' : '2px',
            fontFamily: 'VT323, monospace',
            fontSize: '1.1rem',
            wordBreak: 'break-all'
          }}>
            {line.text}
          </div>
        ))}
        
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ color: '#33ff33', fontFamily: 'VT323, monospace', fontSize: '1.1rem', whiteSpace: 'pre' }}>
            C:\&gt; 
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            autoComplete="off"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontFamily: 'VT323, monospace',
              fontSize: '1.1rem',
              outline: 'none',
              width: '100%',
              caretColor: '#33ff33'
            }}
            autoFocus
          />
        </div>
        <div style={{ height: '10px' }} />
      </div>
    </div>
  )
}
