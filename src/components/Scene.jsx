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
 * Desk geometry — floating in deep space.
 */
function Desk() {
  return (
    <group>
      {/* Desk surface */}
      <mesh receiveShadow position={[0, -0.52, 0.2]}>
        <boxGeometry args={[4, 0.07, 2.2]} />
        <meshStandardMaterial color={new THREE.Color(0x2a1a0e)} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Desk legs — shorter, fade into void */}
      {[[-1.8, -1], [1.8, -1], [-1.8, 1], [1.8, 1]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, -1.0, z * 0.5]}>
          <boxGeometry args={[0.06, 1.0, 0.06]} />
          <meshStandardMaterial color={0x1a0e05} roughness={0.9} />
        </mesh>
      ))}
      {/* Subtle green glow beneath desk — CRT ambient bounce */}
      <pointLight position={[0, -0.7, 0.2]} intensity={0.4} color={0x003311} distance={2.5} decay={2} />
      {/* Volumetric floor mist — a large dark semi-transparent plane below desk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.58, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial
          color={new THREE.Color(0x020408)}
          roughness={1}
          transparent
          opacity={0.85}
        />
      </mesh>
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
      <Desk />
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
