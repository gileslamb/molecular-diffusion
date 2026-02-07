/**
 * Underwater lighting rig — enhanced for photorealistic plankton & whale rendering.
 * Directional "sun" from surface, ambient fill, hemisphere light for depth,
 * and subtle point lights for volumetric feel.
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { UnderwaterLightingProps } from '../utils/types'

export function UnderwaterLighting({
  sunIntensity = 1.2,
  sunColor = '#aaddff',
  ambientIntensity = 0.2,
  ambientColor = '#003355',
  sunPosition = [5, 30, 10],
}: UnderwaterLightingProps) {
  const directionalRef = useRef<THREE.DirectionalLight>(null)

  // Subtle sun shimmer (light ripple through surface)
  useFrame((state) => {
    if (!directionalRef.current) return
    const t = state.clock.elapsedTime
    directionalRef.current.intensity =
      sunIntensity + Math.sin(t * 0.4) * 0.15 + Math.sin(t * 1.1) * 0.08
    // Very slight position wobble to simulate surface wave refraction
    directionalRef.current.position.x = sunPosition[0] + Math.sin(t * 0.3) * 2
    directionalRef.current.position.z = sunPosition[2] + Math.cos(t * 0.25) * 2
  })

  return (
    <>
      {/* Base ambient */}
      <ambientLight color={ambientColor} intensity={ambientIntensity} />

      {/* Sun from surface */}
      <directionalLight
        ref={directionalRef}
        color={sunColor}
        intensity={sunIntensity}
        position={sunPosition}
        castShadow={false}
      />

      {/* Hemisphere: sky = surface light, ground = deep ocean */}
      <hemisphereLight args={['#446688', '#000d1a', 0.35]} />

      {/* Scattered volumetric fill lights */}
      <pointLight
        color="#113344"
        intensity={0.3}
        distance={30}
        position={[-10, 5, -8]}
      />
      <pointLight
        color="#0a2233"
        intensity={0.2}
        distance={25}
        position={[12, -3, 6]}
      />
    </>
  )
}
