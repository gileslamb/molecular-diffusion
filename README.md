# Molecular Diffusion – Underwater Particle Flow Environment

An immersive underwater generative art experience built with React Three Fiber + TypeScript.

## Phase 1: Foundation

- Underwater environment with exponential fog and deep ocean gradients
- 7,000 shader-based instanced particles with Brownian motion
- Animated caustic light patterns on the ocean floor
- Depth-based lighting with sun shimmer
- Gentle floating camera drift with OrbitControls
- Post-processing: bloom, vignette, chromatic aberration
- Real-time parameter tweaking via Leva GUI

## Quick Start

```bash
cd molecular-diffusion
npm install
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── ParticleSystem.tsx     # Instanced shader particles (Brownian motion + settling)
│   ├── FloatingParticles.tsx   # Atmospheric dust points
│   ├── Caustics.tsx            # Animated ocean floor light patterns
│   ├── UnderwaterEnvironment.tsx # Fog and background
│   ├── UnderwaterLighting.tsx  # Sun, ambient, hemisphere lights
│   ├── CameraRig.tsx           # Floating drift + orbit controls
│   ├── PostProcessing.tsx      # Bloom, vignette, chromatic aberration
│   ├── Scene.tsx               # Scene composition
│   └── index.ts
├── shaders/
│   ├── particle.vert           # Particle vertex shader
│   ├── particle.frag           # Particle fragment shader
│   ├── caustics.vert           # Caustics vertex shader
│   └── caustics.frag           # Caustics fragment shader
├── utils/
│   ├── types.ts                # TypeScript interfaces
│   ├── math.ts                 # Math utilities
│   ├── audio.ts                # Tone.js stub (Phase 2)
│   └── index.ts
├── App.tsx                     # Main app with Canvas + Leva controls
├── main.tsx                    # Entry point
└── vite-env.d.ts               # GLSL module declarations
```

## Controls (Leva GUI)

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| Particle Count | 1,000–10,000 | 7,000 | Number of instanced particles |
| Brownian Intensity | 0–2 | 0.4 | Random drift strength |
| Settling Speed | 0–1 | 0.15 | Downward gravity drift |
| Fog Density | 0–1 | 0.5 | Depth visibility falloff |
| Sun Intensity | 0–3 | 1.2 | Surface light brightness |
| Caustics Speed | 0–2 | 0.5 | Caustic animation speed |
| Caustics Opacity | 0–1 | 0.3 | Caustic brightness |
| Auto Rotate | on/off | on | Camera auto-rotation |

## Tech Stack

- **Vite** – Build tool
- **React 18** + **TypeScript**
- **React Three Fiber** – React renderer for Three.js
- **@react-three/drei** – R3F helpers (OrbitControls)
- **@react-three/postprocessing** – Post-processing effects
- **Three.js** – 3D engine
- **Leva** – Real-time GUI controls
- **Tone.js** – Audio (stubbed for Phase 2)
- **vite-plugin-glsl** – GLSL shader imports

## Performance Notes

- Particles use instanced rendering via `<instancedMesh>`
- Custom GLSL shaders handle Brownian motion on the GPU
- Additive blending with `depthWrite: false` for glow effects
- Target: 60fps with 7,000+ particles
