import React, { Suspense, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

import PCjrPlaceholder from './PCjrPlaceholder'
import PCjr from './PCjr'
import DustParticles from './DustParticles'
import Hero from '../sections/Hero'
import About from '../sections/About'
import Projects from '../sections/Projects'
import Skills from '../sections/Skills'
import Contact from '../sections/Contact'
import SnakeGame from '../sections/SnakeGame'
import Terminal from '../sections/Terminal'

const SCREEN_SECTIONS = ['hero', 'about', 'projects', 'skills', 'contact']

/**
 * HtmlRig — applies htmlState dynamically.
 */
function HtmlRig({ htmlState, children, refs }) {
  const groupRef = useRef()

  useFrame(() => {
    if (!htmlState || !groupRef.current) return
    groupRef.current.position.copy(htmlState.position)
    groupRef.current.scale.copy(htmlState.scale)

    if (htmlState.boxData && refs[0].current) {
      // Use bw, bh, bd for the "hole" dimensions.
      const w = htmlState.boxData.w
      const h = htmlState.boxData.h
      const d = htmlState.boxData.d
      const ox = htmlState.boxData.x || 0
      const oy = htmlState.boxData.y || 0
      const oz = htmlState.boxData.z || 0
      const show = htmlState.boxData.show
      const t = 1.0 // thick walls to catch extreme angles

      // Left
      refs[0].current.scale.set(t, h + 2 * t, d)
      refs[0].current.position.set(-w / 2 - t / 2 + ox, oy, -d / 2 + oz)
      // Right
      refs[1].current.scale.set(t, h + 2 * t, d)
      refs[1].current.position.set(w / 2 + t / 2 + ox, oy, -d / 2 + oz)
      // Top
      refs[2].current.scale.set(w, t, d)
      refs[2].current.position.set(ox, h / 2 + t / 2 + oy, -d / 2 + oz)
      // Bottom
      refs[3].current.scale.set(w, t, d)
      refs[3].current.position.set(ox, -h / 2 - t / 2 + oy, -d / 2 + oz)
      // Back
      refs[4].current.scale.set(w + 2 * t, h + 2 * t, t)
      refs[4].current.position.set(ox, oy, -d - t / 2 + oz)

      refs.forEach(r => {
        if (r.current && r.current.material) {
          r.current.material.wireframe = show === 1
          r.current.material.colorWrite = show === 1
          r.current.material.depthWrite = show === 1
          r.current.material.needsUpdate = true
        }
      })
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={refs[0]}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="red" colorWrite={false} depthWrite={false} /></mesh>
      <mesh ref={refs[1]}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="red" colorWrite={false} depthWrite={false} /></mesh>
      <mesh ref={refs[2]}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="red" colorWrite={false} depthWrite={false} /></mesh>
      <mesh ref={refs[3]}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="red" colorWrite={false} depthWrite={false} /></mesh>
      <mesh ref={refs[4]}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="red" colorWrite={false} depthWrite={false} /></mesh>
      {children}
    </group>
  )
}

/**
 * CameraController — allows scroll-driven cinematic movement, 
 * but yields to user interaction (rotation & pinch-to-zoom).
 */
function CameraController({ cameraState }) {
  const { camera, gl } = useThree()
  const controls = useRef()
  const userInteracting = useRef(false)

  useEffect(() => {
    const canvas = gl.domElement

    const handleWheel = (e) => {
      // Pinch-to-zoom or Ctrl+Scroll
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        userInteracting.current = true

        if (controls.current) {
          // Zoom by changing FOV to avoid fighting OrbitControls target distance
          const newFov = camera.fov + e.deltaY * 0.05
          camera.fov = THREE.MathUtils.clamp(newFov, 15, 100)
          camera.updateProjectionMatrix()
        }
      } else {
        // Normal page scroll -> snap back to programmatic track
        userInteracting.current = false
      }
    }

    const handlePointerDown = () => {
      userInteracting.current = true
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('pointerdown', handlePointerDown)

    return () => {
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [camera, gl])

  useFrame(() => {
    if (!cameraState || !controls.current) return

    // If not interacting, smoothly pull camera and target to the scroll track
    if (!userInteracting.current) {
      camera.position.lerp(cameraState.position, 0.05)
      controls.current.target.lerp(cameraState.target, 0.05)
      controls.current.update()
    }
  })

  return (
    <OrbitControls
      ref={controls}
      enableZoom={false} // We handle zoom manually so we don't break page scroll
      enablePan={false}
      enableDamping={true}
      dampingFactor={0.05}
      makeDefault
    />
  )
}

/**
 * StarField — 2000 procedural stars as a deep-space backdrop.
 */
function StarField() {
  const ref = useRef()
  const STAR_COUNT = 2000

  const positions = useMemo(() => {
    const arr = new Float32Array(STAR_COUNT * 3)
    for (let i = 0; i < STAR_COUNT; i++) {
      // Distribute on a large sphere shell around the scene
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 20 + Math.random() * 30
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    // Very slow drift rotation to give parallax depth
    ref.current.rotation.y = clock.getElapsedTime() * 0.005
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.003) * 0.05
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={STAR_COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color={new THREE.Color(0xddeeff)}
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  )
}

/**
 * SpaceStationPlatform — hexagonal metal grating panel floating in space.
 * Procedural grid/grating texture, rivet bolts, safety edge strip, worn metal.
 */
function makeGratingTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')

  // Dark gunmetal base
  ctx.fillStyle = '#1c2228'
  ctx.fillRect(0, 0, size, size)

  // Grating grid lines
  ctx.strokeStyle = '#2e3f4a'
  ctx.lineWidth = 2
  const cell = 32
  for (let x = 0; x <= size; x += cell) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke()
  }
  for (let y = 0; y <= size; y += cell) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke()
  }

  // Diagonal crosshatch inside each cell (grating cutouts)
  ctx.strokeStyle = '#141c21'
  ctx.lineWidth = 1
  for (let x = 0; x < size; x += cell) {
    for (let y = 0; y < size; y += cell) {
      ctx.beginPath(); ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + cell - 4, y + cell - 4); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x + cell - 4, y + 4); ctx.lineTo(x + 4, y + cell - 4); ctx.stroke()
    }
  }

  // Rivets at grid intersections
  ctx.fillStyle = '#3a4d5c'
  for (let x = 0; x <= size; x += cell) {
    for (let y = 0; y <= size; y += cell) {
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 3)
  return tex
}

const gratingTex = makeGratingTexture()

// Rivet positions on the platform (corner bolts)
const RIVET_POSITIONS = [
  [1.05, 0, 0.15], [-1.05, 0, 0.15],
  [0.75, 0, 0.9],  [-0.75, 0, 0.9],
  [0.75, 0, -0.6], [-0.75, 0, -0.6],
  [1.05, 0, -0.25],[-1.05, 0, -0.25],
]

function SpaceStationPlatform() {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    // Very slight slow drift, like it’s drifting in microgravity
    groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.35) * 0.025
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.12) * 0.008
  })

  return (
    <group ref={groupRef}>
      {/* Main hexagonal grating slab */}
      <mesh receiveShadow castShadow position={[0, -0.545, 0.15]}>
        <cylinderGeometry args={[1.5, 1.5, 0.08, 6]} />
        <meshStandardMaterial
          map={gratingTex}
          color={new THREE.Color(0x8aaabb)}
          roughness={0.75}
          metalness={0.85}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* Underside — darker plating */}
      <mesh position={[0, -0.59, 0.15]}>
        <cylinderGeometry args={[1.5, 1.5, 0.01, 6]} />
        <meshStandardMaterial
          color={new THREE.Color(0x0e1418)}
          roughness={0.9}
          metalness={0.7}
        />
      </mesh>

      {/* Safety edge strip — thin bright rim */}
      <mesh position={[0, -0.54, 0.15]}>
        <torusGeometry args={[1.49, 0.025, 8, 6]} />
        <meshStandardMaterial
          color={new THREE.Color(0xffcc00)}
          emissive={new THREE.Color(0xffaa00)}
          emissiveIntensity={0.9}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Inner structural ring */}
      <mesh position={[0, -0.54, 0.15]}>
        <torusGeometry args={[1.1, 0.015, 6, 6]} />
        <meshStandardMaterial
          color={new THREE.Color(0x445566)}
          roughness={0.5}
          metalness={0.9}
        />
      </mesh>

      {/* Rivet bolts */}
      {RIVET_POSITIONS.map(([x, , z], i) => (
        <mesh key={i} position={[x, -0.504, z]}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 8]} />
          <meshStandardMaterial
            color={new THREE.Color(0x667788)}
            roughness={0.4}
            metalness={0.95}
          />
        </mesh>
      ))}

      {/* Structural support stanchion hanging below — fades into void */}
      <mesh position={[0, -1.0, 0.15]}>
        <cylinderGeometry args={[0.04, 0.08, 0.9, 8]} />
        <meshStandardMaterial
          color={new THREE.Color(0x1a2530)}
          roughness={0.8}
          metalness={0.7}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Warm industrial underglow — like maintenance lighting */}
      <pointLight position={[0, -0.65, 0.15]} intensity={0.6} color={0xffbb44} distance={3.0} decay={2} />
      {/* Cool fill from opposite side */}
      <pointLight position={[0, -0.5, -0.8]} intensity={0.3} color={0x334455} distance={2.5} decay={2} />
    </group>
  )
}

/**
 * Screen content switcher — renders the right section overlay on the monitor.
 */
function ScreenContent({ activeSection, onNavigate, onBack }) {
  const [displaySection, setDisplaySection] = useState(activeSection)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    if (activeSection !== displaySection) {
      setIsClearing(true)
      const timer = setTimeout(() => {
        setDisplaySection(activeSection)
        setIsClearing(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [activeSection, displaySection])

  if (isClearing) {
    return (
      <div className="dos-window" style={{ width: '100%', height: '100%', minHeight: '200px', padding: '10px 12px', boxSizing: 'border-box' }}>
        <div style={{ color: '#33ff33', fontFamily: 'VT323, monospace', fontSize: '1rem' }}>
          C:\&gt; CLS<br />
          <span className="cursor-blink" />
        </div>
      </div>
    )
  }

  const map = {
    hero: <Hero onNavigate={onNavigate} onBack={onBack} />,
    about: <About onNavigate={onNavigate} onBack={onBack} />,
    projects: <Projects onNavigate={onNavigate} onBack={onBack} />,
    skills: <Skills onNavigate={onNavigate} onBack={onBack} />,
    contact: <Contact onNavigate={onNavigate} onBack={onBack} />,
    snake: <SnakeGame onNavigate={onNavigate} onBack={onBack} />,
    terminal: <Terminal onNavigate={onNavigate} onBack={onBack} />,
  }
  return map[displaySection] || <Hero onNavigate={onNavigate} onBack={onBack} />
}



/**
 * The main R3F scene graph.
 */
export default function Scene({ cameraState, htmlState, activeSection, isMobile, onNavigate, onBack }) {
  const mouseParallax = useRef({ x: 0, y: 0 })
  const r0 = useRef(), r1 = useRef(), r2 = useRef(), r3 = useRef(), r4 = useRef()
  const occludeRefs = [r0, r1, r2, r3, r4]

  useEffect(() => {
    const onMove = (e) => {
      mouseParallax.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0.3, 0.9, 2.2], fov: 45, near: 0.1, far: 100 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      style={{ background: '#00010a' }}
    >
      {/* Camera controller */}
      {!isMobile && cameraState && <CameraController cameraState={cameraState} />}
      {isMobile && <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />}

      {/* ── Lighting ── */}
      {/* Low ambient fill — deep space cold blue */}
      <ambientLight intensity={0.05} color={0x0a1030} />

      {/* Warm desk-lamp spotlight */}
      <spotLight
        position={[1.5, 3.5, 2.0]}
        angle={0.35}
        penumbra={0.7}
        intensity={55}
        color={0xffcc88}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
      />

      {/* Nebula rim — cool purple from top-left */}
      <directionalLight
        position={[-4, 3, -2]}
        intensity={0.5}
        color={0x5533aa}
      />
      {/* Nebula rim — teal accent from right */}
      <directionalLight
        position={[4, 1, -1]}
        intensity={0.25}
        color={0x004466}
      />

      {/* CRT screen glow — behind the screen face, subtle */}
      <pointLight
        position={[0, 0.42, 0.10]}
        intensity={0.8}
        color={0x00ff44}
        distance={2.2}
        decay={2}
      />

      {/* ── 3D Objects ── */}
      <StarField />
      <SpaceStationPlatform />
      <DustParticles />

      {/* PCjr model — streams in with Draco, fallback to box placeholder */}
      <Suspense fallback={<PCjrPlaceholder mouseParallax={mouseParallax.current} />}>
        <PCjr mouseParallax={mouseParallax.current}>
          {/* Screen HTML overlay — centered on the CRT screen face */}
          <HtmlRig htmlState={htmlState} refs={occludeRefs}>
            <Html
              transform
              occlude={occludeRefs}
              distanceFactor={1}
              style={{
                userSelect: 'none',
                pointerEvents: 'auto',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              <div style={{ width: 280, marginLeft: -140, marginTop: -70, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                <ScreenContent activeSection={activeSection} onNavigate={onNavigate} onBack={onBack} />
              </div>
            </Html>
          </HtmlRig>
        </PCjr>
      </Suspense>

      {/* ── Post Processing ── */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.3}
          luminanceSmoothing={0.7}
          intensity={1.4}
          radius={0.7}
        />
      </EffectComposer>
    </Canvas>
  )
}
