import { useEffect, useRef } from 'react'

/**
 * Pixelated custom cursor that follows the mouse.
 * Renders as a blocky 12×12 crosshair in CRT green.
 */
export default function CustomCursor() {
  const dotRef  = useRef()
  const ringRef = useRef()

  useEffect(() => {
    const dot  = dotRef.current
    const ring = ringRef.current

    let mx = -100, my = -100
    let rx = -100, ry = -100
    let raf

    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
    }

    const tick = () => {
      rx += (mx - rx) * 0.14
      ry += (my - ry) * 0.14

      if (dot)  dot.style.transform  = `translate(${mx - 4}px, ${my - 4}px)`
      if (ring) ring.style.transform = `translate(${rx - 14}px, ${ry - 14}px)`
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      {/* Inner dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 8, height: 8,
          background: '#33ff33',
          boxShadow: '0 0 6px #33ff33',
          zIndex: 99999,
          pointerEvents: 'none',
          imageRendering: 'pixelated',
        }}
      />
      {/* Outer ring (lagging) */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 28, height: 28,
          border: '2px solid #33ff33',
          boxShadow: '0 0 8px rgba(51,255,51,0.5)',
          zIndex: 99998,
          pointerEvents: 'none',
          imageRendering: 'pixelated',
        }}
      />
    </>
  )
}
