/**
 * Sets up underwater fog and background color.
 * Uses exponential fog for realistic depth-based visibility falloff.
 */

import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import type { UnderwaterEnvironmentProps } from '../utils/types'

export function UnderwaterEnvironment({
  fogNearColor = '#001a33',
  fogFarColor = '#000a1a',
  fogNear = 1,
  fogFar = 50,
}: UnderwaterEnvironmentProps) {
  const { scene } = useThree()

  useEffect(() => {
    // Deep ocean background
    scene.background = new THREE.Color(fogFarColor)

    // Linear fog for depth-based visibility
    scene.fog = new THREE.Fog(fogNearColor, fogNear, fogFar)

    return () => {
      scene.fog = null
      scene.background = null
    }
  }, [scene, fogNearColor, fogFarColor, fogNear, fogFar])

  return null
}
