import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 80

function randomInRange(min, max) {
  return min + Math.random() * (max - min)
}

// Pre-generate particle data
const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
  position: [
    randomInRange(-4, 4),
    randomInRange(0, 4),
    randomInRange(-3, 1),
  ],
  speed: randomInRange(0.001, 0.006),
  phase: Math.random() * Math.PI * 2,
  size: randomInRange(0.006, 0.02),
}))

/**
 * Ambient dust-mote particles drifting in the scene.
 */
export default function DustParticles() {
  const meshRef = useRef()

  const positions = new Float32Array(PARTICLE_COUNT * 3)
  const sizes     = new Float32Array(PARTICLE_COUNT)

  particles.forEach((p, i) => {
    positions[i * 3]     = p.position[0]
    positions[i * 3 + 1] = p.position[1]
    positions[i * 3 + 2] = p.position[2]
    sizes[i] = p.size
  })

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const pos = meshRef.current.geometry.attributes.position.array

    particles.forEach((p, i) => {
      pos[i * 3 + 1] = p.position[1] + Math.sin(t * p.speed * 60 + p.phase) * 0.3
      pos[i * 3]     = p.position[0] + Math.sin(t * p.speed * 30 + p.phase) * 0.15
    })

    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={sizes}
          count={PARTICLE_COUNT}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        color={new THREE.Color(0xffb000)}
        size={0.015}
        sizeAttenuation
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </points>
  )
}
