/**
 * Camera rig with gentle automated drift + optional orbit controls.
 * Maintains an "underwater floating" feeling.
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { CameraControlsProps } from '../utils/types'

export function CameraRig({
  autoRotate = true,
  autoRotateSpeed = 0.15,
  enableDamping = true,
  dampingFactor = 0.05,
  maxPolarAngle = Math.PI * 0.75,
  minPolarAngle = Math.PI * 0.25,
  maxDistance = 25,
  minDistance = 3,
}: CameraControlsProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Gentle floating bob
  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.position.y =
      Math.sin(t * 0.3) * 0.4 + Math.sin(t * 0.7) * 0.15
    groupRef.current.position.x = Math.sin(t * 0.2) * 0.2
    groupRef.current.rotation.z = Math.sin(t * 0.15) * 0.01
  })

  return (
    <>
      <group ref={groupRef} />
      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        enableDamping={enableDamping}
        dampingFactor={dampingFactor}
        maxPolarAngle={maxPolarAngle}
        minPolarAngle={minPolarAngle}
        maxDistance={maxDistance}
        minDistance={minDistance}
        enablePan={false}
        makeDefault
      />
    </>
  )
}
