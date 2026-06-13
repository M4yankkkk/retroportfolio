import { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Preload + enable Draco decoding (drei handles decoder via CDN by default)
useGLTF.preload('/models/pcjr.glb', true)

/**
 * PCjr 3D model component.
 * Auto-normalizes scale/position using a bounding box so the model
 * fits naturally on the desk regardless of the original model units.
 *
 * From the inspect: Y-span ≈ 420 units, so target height of ~1.4 Three.js units.
 */
export default function PCjr({ mouseParallax = { x: 0, y: 0 }, children }) {
  const group = useRef()
  const { scene } = useGLTF('/models/pcjr.glb', true)

  useEffect(() => {
    if (!scene) return

    // ── Auto-fit: center + scale to target height ──────────────────────────
    const box = new THREE.Box3().setFromObject(scene)
    const center = new THREE.Vector3()
    const size   = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)

    // Fit the tallest dimension to 1.4 Three.js units
    const TARGET_HEIGHT = 1.8
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale  = TARGET_HEIGHT / maxDim

    scene.scale.setScalar(scale)

    // Re-center after scaling
    scene.position.set(
      -center.x * scale,
      -box.min.y * scale,   // sit the bottom on y=0
      -center.z * scale
    )

    // Enable shadows on every mesh
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow    = true
        child.receiveShadow = true
        if (child.material) {
          child.material.envMapIntensity = 0.4
        }
      }
    })
  }, [scene])

  // Float animation + mouse parallax
  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    // group.current.position.y = Math.sin(t * 0.5) * 0.03
    group.current.rotation.y = mouseParallax.x * 0.10
    group.current.rotation.x = mouseParallax.y * 0.05
  })

  return (
    <group
      ref={group}
      dispose={null}
      // Sit model on the desk surface (desk top is at y ≈ -0.49)
      position={[0, -0.49, 0]}
      rotation={[0, Math.PI / 6, 0]}  /* slight 3/4 angle */
    >
      <primitive object={scene} />
      {children}
    </group>
  )
}
