import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

/**
 * Camera position/lookAt presets for each scroll section.
 * Tweak these values once the model is on screen.
 */
export const CAMERA_PRESETS = {
  hero: {
    position: [0.3, 0.9, 2.2],
    target:   [0, 0.42, 0],
  },
  about: {
    position: [1.2, 0.7, 1.8],
    target:   [0, 0.42, 0],
  },
  projects: {
    position: [-1.0, 0.7, 1.8],
    target:   [0, 0.42, 0],
  },
  skills: {
    position: [0, 1.1, 1.9],
    target:   [0, 0.42, 0],
  },
  contact: {
    position: [0.2, 0.5, 1.7],
    target:   [0, 0.42, 0],
  },
}

/**
 * useScrollCamera
 * Registers GSAP ScrollTrigger entries and smoothly tweens
 * a `cameraState` object that the R3F camera reads each frame.
 *
 * @param {object} cameraState - { position: THREE.Vector3, target: THREE.Vector3 }
 * @param {string} scrollWrapper - selector for the scroll container
 */
export function useScrollCamera(cameraState, scrollWrapper = '#scroll-wrapper') {
  const tweens = useRef([])

  useEffect(() => {
    if (!cameraState) return

    const sections = [
      { id: '#section-about',    preset: 'about' },
      { id: '#section-projects', preset: 'projects' },
      { id: '#section-skills',   preset: 'skills' },
      { id: '#section-contact',  preset: 'contact' },
    ]

    // Start at hero
    const hero = CAMERA_PRESETS.hero
    cameraState.position.set(...hero.position)
    cameraState.target.set(...hero.target)

    sections.forEach(({ id, preset }) => {
      const cfg = CAMERA_PRESETS[preset]
      const tween = gsap.to(cameraState.position, {
        x: cfg.position[0],
        y: cfg.position[1],
        z: cfg.position[2],
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: id,
          scroller: scrollWrapper,
          start: 'top 80%',
          end: 'top 20%',
          scrub: 1.5,
        },
      })

      gsap.to(cameraState.target, {
        x: cfg.target[0],
        y: cfg.target[1],
        z: cfg.target[2],
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: id,
          scroller: scrollWrapper,
          start: 'top 80%',
          end: 'top 20%',
          scrub: 1.5,
        },
      })

      tweens.current.push(tween)
    })

    return () => {
      tweens.current.forEach(t => t.kill())
      ScrollTrigger.getAll().forEach(st => st.kill())
    }
  }, [cameraState, scrollWrapper])
}
