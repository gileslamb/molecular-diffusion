/**
 * Main 3D scene composition.
 * Assembles the underwater environment with plankton and whales.
 */

import { UnderwaterEnvironment } from './UnderwaterEnvironment'
import { UnderwaterLighting } from './UnderwaterLighting'
import { Plankton } from './Plankton'
import { Whales } from './Whales'
import { FloatingParticles } from './FloatingParticles'
import { Caustics } from './Caustics'
import { CameraRig } from './CameraRig'
import { PostProcessing } from './PostProcessing'
import type { SceneControls } from '../utils/types'

interface SceneProps {
  controls: SceneControls
}

export function Scene({ controls }: SceneProps) {
  return (
    <>
      {/* Environment */}
      <UnderwaterEnvironment
        fogNearColor="#001a33"
        fogFarColor="#000a1a"
        fogNear={1}
        fogFar={35 + controls.fogDensity * 30}
      />

      {/* Lighting */}
      <UnderwaterLighting
        sunIntensity={controls.sunIntensity}
        sunColor="#aaddff"
        ambientIntensity={0.2}
        ambientColor="#003355"
        sunPosition={[5, 30, 10]}
      />

      {/* Photorealistic plankton */}
      <Plankton
        count={controls.planktonCount}
        spread={35}
        driftSpeed={controls.driftSpeed}
        pulseIntensity={controls.pulseIntensity}
        bioluminescence={controls.bioluminescence}
        translucency={0.8}
        color="#55ccbb"
      />

      {/* Whales */}
      <Whales
        count={controls.whaleCount}
        swimSpeed={controls.swimSpeed}
        pathRadius={1.0}
        undulationAmp={controls.undulationAmp}
      />

      {/* Atmospheric micro-particles (marine snow) */}
      <FloatingParticles
        count={3000}
        spread={50}
        size={0.04}
        color="#3388aa"
        opacity={0.15}
      />

      {/* Ocean floor caustics */}
      <Caustics
        scale={80}
        speed={controls.causticsSpeed}
        opacity={controls.causticsOpacity}
        color="#00ffcc"
        yPosition={-15}
      />

      {/* Camera */}
      <CameraRig
        autoRotate={controls.autoRotate}
        autoRotateSpeed={0.1}
        enableDamping
        dampingFactor={0.03}
        maxPolarAngle={Math.PI * 0.8}
        minPolarAngle={Math.PI * 0.2}
        maxDistance={35}
        minDistance={3}
      />

      {/* Post-processing */}
      <PostProcessing
        bloomIntensity={1.0}
        bloomThreshold={0.2}
        vignetteIntensity={0.6}
      />
    </>
  )
}
