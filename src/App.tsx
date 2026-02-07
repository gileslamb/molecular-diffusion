/**
 * Molecular Diffusion – Underwater Particle Flow Environment
 * Plankton & Whales Edition
 *
 * Immersive generative art: photorealistic plankton drifting
 * while whales glide through the deep.
 */

import { Canvas } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import { Suspense } from 'react'
import { Scene } from './components/Scene'
import type { SceneControls } from './utils/types'

function App() {
  const controls = useControls({
    Plankton: folder({
      planktonCount: { value: 4000, min: 500, max: 8000, step: 250 },
      driftSpeed: { value: 1.0, min: 0, max: 3, step: 0.1 },
      pulseIntensity: { value: 1.0, min: 0, max: 3, step: 0.1 },
      bioluminescence: { value: 0.5, min: 0, max: 2, step: 0.05 },
    }),
    Whales: folder({
      whaleCount: { value: 4, min: 1, max: 4, step: 1 },
      swimSpeed: { value: 1.0, min: 0.1, max: 3, step: 0.1 },
      undulationAmp: { value: 0.15, min: 0, max: 0.5, step: 0.01 },
    }),
    Environment: folder({
      fogDensity: { value: 0.5, min: 0, max: 1, step: 0.05 },
      sunIntensity: { value: 1.2, min: 0, max: 3, step: 0.1 },
    }),
    Caustics: folder({
      causticsSpeed: { value: 0.5, min: 0, max: 2, step: 0.05 },
      causticsOpacity: { value: 0.3, min: 0, max: 1, step: 0.05 },
    }),
    Camera: folder({
      autoRotate: { value: true },
    }),
  }) as SceneControls

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000a1a' }}>
      <Canvas
        camera={{
          position: [0, 2, 18],
          fov: 55,
          near: 0.1,
          far: 120,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Scene controls={controls} />
        </Suspense>
      </Canvas>

      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          color: 'rgba(80, 160, 200, 0.35)',
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          fontSize: 11,
          letterSpacing: 3,
          textTransform: 'uppercase',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        Molecular Diffusion · Deep Ocean
      </div>
    </div>
  )
}

export default App
