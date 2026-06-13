import { Suspense, useRef, useEffect } from 'react'
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

const SCREEN_SECTIONS = ['hero', 'about', 'projects', 'skills', 'contact']

/**
 * HtmlRig — applies htmlState dynamically.
 */
function HtmlRig({ htmlState, children }) {
  const groupRef = useRef()
  useFrame(() => {
    if (!htmlState || !groupRef.current) return
    groupRef.current.position.copy(htmlState.position)
    // Three.js doesn't have a Vector3.setScalar to scale easily via .copy from a single value if it's passed as a Vector3,
    // but in App.jsx we set htmlState.current.scale to a Vector3 (via .setScalar), so we can just .copy it:
    groupRef.current.scale.copy(htmlState.scale)
  })
  return <group ref={groupRef}>{children}</group>
}

/**
 * CameraRig — reads cameraState (position + target vectors) updated by scroll,
 * and smoothly lerps the R3F camera each frame.
 */
function CameraRig({ cameraState }) {
  const { camera } = useThree()
  useFrame(() => {
    if (!cameraState) return
    camera.position.lerp(cameraState.position, 0.05)
    camera.lookAt(cameraState.target)
  })
  return null
}

/**
 * Desk geometry — simple dark wood surface + floor plane.
 */
function Desk() {
  return (
    <group>
      {/* Desk surface */}
      <mesh receiveShadow position={[0, -0.52, 0.2]}>
        <boxGeometry args={[4, 0.07, 2.2]} />
        <meshStandardMaterial color={new THREE.Color(0x2a1a0e)} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Desk legs */}
      {[[-1.8, -1], [1.8, -1], [-1.8, 1], [1.8, 1]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, -1.0, z * 0.5]}>
          <boxGeometry args={[0.06, 1.0, 0.06]} />
          <meshStandardMaterial color={0x1a0e05} roughness={0.9} />
        </mesh>
      ))}
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.56, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={new THREE.Color(0x0d0d0d)} roughness={0.95} />
      </mesh>
      {/* Wall behind */}
      <mesh receiveShadow position={[0, 2, -3]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color={new THREE.Color(0x111111)} roughness={1} />
      </mesh>
    </group>
  )
}

/**
 * Screen content switcher — renders the right section overlay on the monitor.
 */
function ScreenContent({ activeSection }) {
  const map = {
    hero: <Hero />,
    about: <About />,
    projects: <Projects />,
    skills: <Skills />,
    contact: <Contact />,
  }
  return map[activeSection] || <Hero />
}

/**
 * The main R3F scene graph.
 */
export default function Scene({ cameraState, htmlState, activeSection, isMobile }) {
  const mouseParallax = useRef({ x: 0, y: 0 })

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
      style={{ background: '#080808' }}
    >
      {/* Camera controller */}
      {!isMobile && cameraState && <CameraRig cameraState={cameraState} />}
      {isMobile && <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />}

      {/* ── Lighting ── */}
      {/* Low ambient fill */}
      <ambientLight intensity={0.08} color={0xffeedd} />

      {/* Warm desk-lamp spotlight */}
      <spotLight
        position={[1.5, 3.5, 2.0]}
        angle={0.35}
        penumbra={0.7}
        intensity={60}
        color={0xffcc88}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
      />

      {/* Rim light for silhouette */}
      <directionalLight
        position={[-3, 2, -2]}
        intensity={0.3}
        color={0x334466}
      />

      {/* CRT screen glow — behind the screen face, subtle */}
      <pointLight
        position={[0, 0.42, 0.10]}
        intensity={0.5}
        color={0x00ff44}
        distance={1.8}
        decay={2}
      />

      {/* ── 3D Objects ── */}
      <Desk />
      <DustParticles />

      {/* PCjr model — streams in with Draco, fallback to box placeholder */}
      <Suspense fallback={<PCjrPlaceholder mouseParallax={mouseParallax.current} />}>
        <PCjr mouseParallax={mouseParallax.current}>
          {/* Screen HTML overlay — centered on the CRT screen face */}
          <HtmlRig htmlState={htmlState}>
            <Html
              transform
              distanceFactor={1}
              style={{ userSelect: 'none', pointerEvents: 'auto' }}
            >
              <div style={{ width: 280, marginLeft: -140, marginTop: -70 }}>
                <ScreenContent activeSection={activeSection} />
              </div>
            </Html>
          </HtmlRig>
        </PCjr>
      </Suspense>

      {/* ── Post Processing ── */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.55}
          luminanceSmoothing={0.6}
          intensity={0.8}
          radius={0.5}
        />
      </EffectComposer>
    </Canvas>
  )
}
