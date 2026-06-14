/**
 * useRetroAudio — synthesized PC-speaker & hardware SFX via Web Audio API.
 * No external audio files. All sounds are generated procedurally.
 */
import { useRef, useCallback } from 'react'

export function useRetroAudio() {
  const ctxRef = useRef(null)

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }

  /** Short white-noise burst — mechanical key clack */
  const playKeyClack = useCallback(() => {
    try {
      const ctx = getCtx()
      const bufferSize = ctx.sampleRate * 0.04 // 40ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) ** 3
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer

      // Slight bandpass to make it sound like a real key, not static
      const bpf = ctx.createBiquadFilter()
      bpf.type = 'bandpass'
      bpf.frequency.value = 2200 + Math.random() * 800
      bpf.Q.value = 0.8

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.18 + Math.random() * 0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04)

      source.connect(bpf)
      bpf.connect(gain)
      gain.connect(ctx.destination)
      source.start()
    } catch (_) {}
  }, [])

  /** Low-frequency noise with wow-flutter — floppy disk churn */
  const playFloppyChurn = useCallback((durationMs = 1200) => {
    try {
      const ctx = getCtx()
      const duration = durationMs / 1000

      // Motor hum base
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = 55
      // Slight pitch wobble for mechanical realism
      osc.frequency.linearRampToValueAtTime(58, ctx.currentTime + duration * 0.5)
      osc.frequency.linearRampToValueAtTime(54, ctx.currentTime + duration)

      // Noise layer for head seek
      const bufSize = ctx.sampleRate * duration
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < bufSize; i++) {
        d[i] = (Math.random() * 2 - 1) * 0.3
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buf

      const lpf = ctx.createBiquadFilter()
      lpf.type = 'lowpass'
      lpf.frequency.value = 300

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.12, ctx.currentTime + duration - 0.15)
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + duration)

      osc.connect(gain)
      noise.connect(lpf)
      lpf.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + duration)
      noise.start()
      noise.stop(ctx.currentTime + duration)
    } catch (_) {}
  }, [])

  /** Short sine blip — PC speaker UI feedback */
  const playBlip = useCallback((freq = 880, durationMs = 60) => {
    try {
      const ctx = getCtx()
      const duration = durationMs / 1000

      const osc = ctx.createOscillator()
      osc.type = 'square'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, ctx.currentTime + duration)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.07, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch (_) {}
  }, [])

  /** Lower blip for closing/error — negative feedback */
  const playCloseBlip = useCallback(() => {
    playBlip(330, 80)
  }, [playBlip])

  /** Hover blip — very quiet, high pitch */
  const playHoverBlip = useCallback(() => {
    playBlip(1100, 30)
  }, [playBlip])

  /** Boot-up ascending sweep */
  const playBootSweep = useCallback(() => {
    try {
      const ctx = getCtx()
      const osc = ctx.createOscillator()
      osc.type = 'square'
      osc.frequency.setValueAtTime(110, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.04, ctx.currentTime)
      gain.gain.setValueAtTime(0.04, ctx.currentTime + 0.55)
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.65)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.7)
    } catch (_) {}
  }, [])

  return { playKeyClack, playFloppyChurn, playBlip, playCloseBlip, playHoverBlip, playBootSweep }
}
