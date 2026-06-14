import React, { useState, useEffect, useCallback } from 'react'

export default function SnakeGame({ onNavigate, onBack }) {
  const handleClose = (e) => {
    e.stopPropagation()
    if (onBack) onBack()
    else if (onNavigate) onNavigate('hero')
  }

  const [snake, setSnake] = useState([{x: 5, y: 5}])
  const [food, setFood] = useState({x: 10, y: 10})
  const [dir, setDir] = useState({x: 1, y: 0})
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)

  const GRID_SIZE = 15
  
  const moveSnake = useCallback(() => {
    if (gameOver) return
    setSnake(prev => {
      const head = prev[0]
      const newHead = { x: head.x + dir.x, y: head.y + dir.y }

      // Wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true)
        return prev
      }

      // Self collision
      for (let segment of prev) {
        if (segment.x === newHead.x && segment.y === newHead.y) {
          setGameOver(true)
          return prev
        }
      }

      const newSnake = [newHead, ...prev]
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10)
        let newFood
        while (true) {
          newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
          }
          if (!newSnake.some(s => s.x === newFood.x && s.y === newFood.y)) break
        }
        setFood(newFood)
      } else {
        newSnake.pop()
      }
      return newSnake
    })
  }, [dir, food, gameOver])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // prevent default scrolling for arrows
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
      }
      switch (e.key) {
        case 'ArrowUp': if (dir.y !== 1) setDir({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (dir.y !== -1) setDir({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (dir.x !== 1) setDir({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (dir.x !== -1) setDir({ x: 1, y: 0 }); break;
      }
    }
    window.addEventListener('keydown', handleKeyDown, { passive: false })
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dir])

  useEffect(() => {
    const timer = setInterval(moveSnake, 150)
    return () => clearInterval(timer)
  }, [moveSnake])

  const restart = () => {
    setSnake([{x: 5, y: 5}])
    setDir({x: 1, y: 0})
    setGameOver(false)
    setScore(0)
    setFood({
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    })
  }

  return (
    <div className="dos-window" style={{ width: '350px', height: '350px', fontSize: '1rem', display: 'flex', flexDirection: 'column' }}>
      <div className="dos-titlebar">
        <span>■ SNAKE.EXE</span>
        <span>[ ? ] [ □ ] <span style={{ cursor: 'pointer' }} onClick={handleClose}>[ ✕ ]</span></span>
      </div>
      <div className="dos-content" style={{ flex: 1, overflow: 'hidden', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#100e04' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', marginBottom: '10px', color: '#33ff33' }}>
          <span>SCORE: {score}</span>
        </div>
        
        <div 
          style={{ 
            width: '225px', 
            height: '225px', 
            border: '2px solid #33ff33', 
            position: 'relative',
            backgroundColor: '#000'
          }}
        >
          {!gameOver && snake.map((s, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${(s.x / GRID_SIZE) * 100}%`,
              top: `${(s.y / GRID_SIZE) * 100}%`,
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              backgroundColor: '#33ff33',
              border: '1px solid #000'
            }} />
          ))}
          {!gameOver && (
            <div style={{
              position: 'absolute',
              left: `${(food.x / GRID_SIZE) * 100}%`,
              top: `${(food.y / GRID_SIZE) * 100}%`,
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              backgroundColor: '#ff3333'
            }} />
          )}

          {gameOver && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)'
            }}>
              <span className="amber" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>GAME OVER</span>
              <button 
                onClick={restart}
                style={{
                  background: '#33ff33', color: '#000', border: 'none', padding: '4px 12px', cursor: 'pointer', fontFamily: 'VT323, monospace', fontSize: '1rem', fontWeight: 'bold'
                }}
              >RESTART</button>
            </div>
          )}
        </div>
        <span style={{ fontSize: '0.8rem', marginTop: '15px', color: '#33ff33', opacity: 0.8 }}>Use Arrow Keys to move</span>
      </div>
    </div>
  )
}
