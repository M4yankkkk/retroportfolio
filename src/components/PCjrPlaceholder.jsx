import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Placeholder PCjr — shown while pcjr.glb is not yet loaded/present.
 * Looks like a stylised retro computer made from boxes.
 */
export default function PCjrPlaceholder({ mouseParallax = { x: 0, y: 0 } }) {
  const group = useRef()

  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    group.current.position.y = Math.sin(t * 0.5) * 0.04
    group.current.rotation.y = mouseParallax.x * 0.12 + Math.PI / 6
    group.current.rotation.x = mouseParallax.y * 0.06
  })

  const greenEmissive = new THREE.Color(0x004400)
  const screenMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x001100),
    emissive: new THREE.Color(0x00ff33),
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.1,
  })
  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd4c9a8),
    roughness: 0.85,
    metalness: 0.05,
  })
  const darkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x222222),
    roughness: 0.9,
  })

  return (
    <group ref={group} position={[0, -0.5, 0]} castShadow receiveShadow dispose={null}>
      {/* Monitor body */}
      <mesh castShadow receiveShadow position={[0, 1.0, 0]} material={bodyMat}>
        <boxGeometry args={[1.6, 1.1, 0.55]} />
      </mesh>

      {/* Screen bezel inset */}
      <mesh position={[0, 1.0, 0.28]} material={darkMat}>
        <boxGeometry args={[1.3, 0.85, 0.02]} />
      </mesh>

      {/* Glowing screen */}
      <mesh position={[0, 1.0, 0.295]} material={screenMat}>
        <boxGeometry args={[1.15, 0.72, 0.01]} />
      </mesh>

      {/* Neck */}
      <mesh castShadow position={[0, 0.45, -0.05]} material={bodyMat}>
        <boxGeometry args={[0.3, 0.15, 0.45]} />
      </mesh>

      {/* Base / keyboard unit */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0.4]} material={bodyMat}>
        <boxGeometry args={[1.8, 0.08, 1.0]} />
      </mesh>

      {/* Keyboard keys (decorative rows) */}
      {[-0.3, 0, 0.3].map((z, i) => (
        <mesh key={i} position={[0, 0.35, 0.3 + z * 0.2]} material={darkMat}>
          <boxGeometry args={[1.55, 0.04, 0.07]} />
        </mesh>
      ))}

      {/* Disk drive slot */}
      <mesh position={[0.55, 0.68, 0.275]} material={darkMat}>
        <boxGeometry args={[0.4, 0.06, 0.04]} />
      </mesh>

      {/* Power LED */}
      <mesh position={[0.55, 0.62, 0.277]}>
        <boxGeometry args={[0.04, 0.04, 0.01]} />
        <meshStandardMaterial
          color={0x00ff33}
          emissive={new THREE.Color(0x00ff33)}
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  )
}
