/**
 * Animated caustic light patterns projected on a plane beneath the camera.
 * Simulates dappled sunlight filtering through ocean surface.
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { CausticsProps } from '../utils/types'

import causticsVert from '../shaders/caustics.vert'
import causticsFrag from '../shaders/caustics.frag'

export function Caustics({
  scale = 60,
  speed = 0.5,
  opacity = 0.3,
  color = '#00ffcc',
  yPosition = -12,
}: CausticsProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uOpacity: { value: opacity },
      uColor: { value: new THREE.Color(color) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((state) => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    materialRef.current.uniforms.uSpeed.value = speed
    materialRef.current.uniforms.uOpacity.value = opacity
    materialRef.current.uniforms.uColor.value.set(color)
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, yPosition, 0]}>
      <planeGeometry args={[scale, scale, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={causticsVert}
        fragmentShader={causticsFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
