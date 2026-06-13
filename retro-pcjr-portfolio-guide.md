# Retro PCjr 3D Portfolio — Build Guide

## 1. Overview
A 3D portfolio website built around an IBM PCjr retro computer model. The computer sits on a desk; its CRT screen acts as a terminal that boots up and displays portfolio content. Scroll-driven camera movement reveals different "apps" on the screen for each section.

**Stack:** React + Vite, @react-three/fiber, @react-three/drei, GSAP + ScrollTrigger, Lenis, Tailwind CSS, @react-three/postprocessing.

---

## 2. Asset Preparation (Do This First)

### 2.1 Download the model
From the Sketchfab/Fab listing, download:
- **GLB, 1k texture, 25MB** (NOT the 2k/65MB or .gltf/.dae versions)

### 2.2 Compress the model
Raw 25MB is too heavy for web. Compress before use:

```bash
npm install -g @gltf-transform/cli

# Optimize: Draco geometry compression + WebP textures
npx gltf-transform optimize pcjr-raw.glb pcjr.glb --compress draco --texture-compress webp
```

Target: **under 5MB**. Verify the result visually (open in https://gltf.report or drei's `<Stage>`) — check no textures/materials broke.

Place the final file at: `public/models/pcjr.glb`

### 2.3 Draco decoder setup
Since the model uses Draco compression, the GLTFLoader needs the Draco decoder:
- Use drei's `useGLTF(path, true)` (second arg enables Draco) — drei bundles the decoder via CDN by default
- Or self-host decoder files in `public/draco/` for offline/CDN-independent builds

---

## 3. Project Setup Order

1. Scaffold with Vite: `npm create vite@latest portfolio -- --template react`
2. Install core deps:
   ```bash
   npm install three @react-three/fiber @react-three/drei @react-three/postprocessing gsap lenis
   npm install -D tailwindcss postcss autoprefixer @gltf-transform/cli
   ```
3. Set up Tailwind config
4. Add Google Fonts: **VT323** and/or **Press Start 2P** (for terminal/pixel text)
5. Build incrementally — **don't try to generate everything in one shot**:
   - Step 1: Canvas + lighting + load PCjr model (just get it on screen, rotating)
   - Step 2: Boot-up screen overlay (typewriter text via drei `Html`)
   - Step 3: CRT shader overlay (scanlines, flicker, chromatic aberration)
   - Step 4: Lenis + GSAP ScrollTrigger camera choreography
   - Step 5: Per-section screen content (About, Projects, Skills, Contact)
   - Step 6: Bloom post-processing
   - Step 7: Mobile fallback (static model + scrollable overlays, no camera animation)
   - Step 8: Audio toggle (ambient hum)

---

## 4. Section-by-Section Plan

| Section | Screen Content | Notes |
|---|---|---|
| Hero | Boot sequence: "BOOTING SYSTEM...", "LOADING PORTFOLIO.EXE", welcome message | GSAP typewriter on `Html` overlay positioned on screen mesh |
| About | "About.exe" window, pixel font bio text, blinking cursor | Fade/slide in via ScrollTrigger |
| Projects | DOS-style file directory list | Click a "file" → modal styled as old dialog box |
| Skills | Retro progress bars: `JAVASCRIPT.SYS ████████░░ 80%` | Animate fill on scroll into view |
| Contact | Terminal-style form: blinking cursor, monospace inputs | Style as `SEND MESSAGE >` prompt |

---

## 5. Visual Style Reference

- **Colors:** `#0a0a0a`, `#1a1a1a` background; `#33ff33` (green) or `#ffb000` (amber) accent; warm lamp glow
- **Fonts:** VT323 / Press Start 2P for screen UI; clean sans-serif for off-screen text
- **Effects:** CRT scanlines + curvature + chromatic aberration shader on screen texture; film grain overlay on whole page; pixelated custom cursor

---

## 6. Lighting & Camera

- One warm spotlight (desk lamp) as key light
- Low ambient fill light
- Rim light for silhouette definition
- Define camera position/lookAt **presets** per section; GSAP interpolates between them on scroll
- Use `@react-three/postprocessing`'s `Bloom` for glowing screen effect

---

## 7. Performance Checklist

- [ ] Model compressed under 5MB
- [ ] `useGLTF.preload()` called for the model
- [ ] Suspense + loading fallback (retro "LOADING..." progress bar) wraps the Canvas
- [ ] Mobile: disable full camera choreography, use static angle + scrollable HTML
- [ ] Lazy-load non-hero sections
- [ ] Test Lighthouse performance score after first full build

---

## 8. Folder Structure

```
src/
  components/
    PCjr.jsx
    CRTOverlay.jsx
    CustomCursor.jsx
  sections/
    Hero.jsx
    About.jsx
    Projects.jsx
    Skills.jsx
    Contact.jsx
  shaders/
    crtScanline.glsl
  hooks/
    useScrollCamera.js
public/
  models/
    pcjr.glb
  draco/ (if self-hosting decoder)
```

---

## 9. Prompts to Use (in order)

1. **Initial build prompt** — full concept (computer hero, boot sequence, CRT shader, scroll-driven camera, per-section screen apps, compression instructions for `pcjr.glb`)
2. **Follow-ups** (after base works):
   - "Replace placeholder content with my real projects: [list]"
   - "Tune the CRT shader intensity / scanline opacity"
   - "Add the mobile fallback layout"
   - "Add the audio toggle with [file]"

---

## 10. Common Pitfalls

- Forgetting Draco decoder config → model fails to load silently
- Putting `Html` overlay content not aligned to the screen mesh's UV/transform → text floats off the monitor
- Heavy post-processing (Bloom + DOF + chromatic aberration all at once) tanking FPS on mobile
- Not testing scroll camera transitions on resize/different aspect ratios
- Forgetting `useGLTF.preload()` causing pop-in on first load
