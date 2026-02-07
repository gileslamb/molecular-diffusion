/**
 * Procedurally generated whales swimming through the underwater environment.
 * Each whale follows a slow looping path with realistic body undulation.
 * Multiple whale sizes for sense of scale.
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import whaleVert from '../shaders/whale.vert'
import whaleFrag from '../shaders/whale.frag'

export interface WhalesProps {
  count?: number
  swimSpeed?: number
  pathRadius?: number
  undulationAmp?: number
}

// ── Procedural whale body geometry ─────────────────────────────────

function createWhaleGeometry(): THREE.BufferGeometry {
  // Main body — lathe profile (side view)
  const bodySegments = 32
  const bodyPoints: THREE.Vector2[] = []

  for (let i = 0; i <= bodySegments; i++) {
    const t = i / bodySegments // 0 (nose) to 1 (tail)
    const x = (t - 0.5) * 2 // -1 to 1

    // Whale body profile: bulge at ~30%, taper to nose and tail
    let radius: number
    if (t < 0.15) {
      // Rounded nose
      radius = 0.15 * Math.sqrt(1 - Math.pow((t - 0.15) / 0.15, 2))
    } else if (t < 0.55) {
      // Widest section (belly/head)
      const bt = (t - 0.15) / 0.4
      radius = 0.15 + 0.05 * Math.sin(bt * Math.PI)
    } else {
      // Taper to tail
      const tt = (t - 0.55) / 0.45
      radius = 0.2 * (1 - tt) * (1 - tt * 0.3)
    }

    bodyPoints.push(new THREE.Vector2(Math.max(radius, 0.005), x))
  }

  const body = new THREE.LatheGeometry(bodyPoints, 16)

  // Dorsal fin
  const dorsalShape = new THREE.Shape()
  dorsalShape.moveTo(0, 0)
  dorsalShape.bezierCurveTo(0.02, 0.08, 0.08, 0.1, 0.1, 0.0)
  dorsalShape.lineTo(0, 0)

  const dorsalGeo = new THREE.ExtrudeGeometry(dorsalShape, {
    depth: 0.008,
    bevelEnabled: false,
  })
  dorsalGeo.rotateX(Math.PI / 2)
  dorsalGeo.rotateZ(Math.PI / 2)
  dorsalGeo.translate(-0.004, 0.15, 0.1)

  // Tail fluke — two angled planes
  const flukeShape = new THREE.Shape()
  flukeShape.moveTo(0, 0)
  flukeShape.bezierCurveTo(0.15, 0.02, 0.2, 0.08, 0.22, 0.12)
  flukeShape.bezierCurveTo(0.18, 0.06, 0.1, 0.02, 0, 0)

  const flukeGeo1 = new THREE.ExtrudeGeometry(flukeShape, {
    depth: 0.006,
    bevelEnabled: false,
  })
  flukeGeo1.rotateY(Math.PI / 2)
  flukeGeo1.translate(0, -0.003, -0.9)

  const flukeGeo2 = flukeGeo1.clone()
  flukeGeo2.scale(1, 1, -1)

  // Pectoral fins
  const pecFinShape = new THREE.Shape()
  pecFinShape.moveTo(0, 0)
  pecFinShape.bezierCurveTo(0.04, -0.01, 0.12, -0.03, 0.15, -0.08)
  pecFinShape.bezierCurveTo(0.1, -0.04, 0.05, -0.01, 0, 0)

  const pecFinGeo = new THREE.ExtrudeGeometry(pecFinShape, {
    depth: 0.005,
    bevelEnabled: false,
  })
  pecFinGeo.rotateY(Math.PI / 2)
  pecFinGeo.translate(0.06, -0.08, 0.35)

  const pecFinGeo2 = pecFinGeo.clone()
  pecFinGeo2.scale(-1, 1, 1)

  // Merge all parts
  const merged = mergeWhaleGeos([body, dorsalGeo, flukeGeo1, flukeGeo2, pecFinGeo, pecFinGeo2])

  // Orient so whale faces +X (swimming direction)
  merged.rotateZ(-Math.PI / 2)
  merged.computeVertexNormals()
  return merged
}

function mergeWhaleGeos(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let totalVerts = 0
  let totalIndices = 0
  for (const g of geos) {
    totalVerts += g.getAttribute('position').count
    if (g.index) totalIndices += g.index.count
    else totalIndices += g.getAttribute('position').count
  }

  const positions = new Float32Array(totalVerts * 3)
  const normals = new Float32Array(totalVerts * 3)
  const indices = new Uint32Array(totalIndices)

  let vertOffset = 0
  let idxOffset = 0

  for (const g of geos) {
    const pos = g.getAttribute('position')
    const norm = g.getAttribute('normal')
    const idx = g.index

    for (let i = 0; i < pos.count; i++) {
      positions[(vertOffset + i) * 3] = pos.getX(i)
      positions[(vertOffset + i) * 3 + 1] = pos.getY(i)
      positions[(vertOffset + i) * 3 + 2] = pos.getZ(i)
      if (norm) {
        normals[(vertOffset + i) * 3] = norm.getX(i)
        normals[(vertOffset + i) * 3 + 1] = norm.getY(i)
        normals[(vertOffset + i) * 3 + 2] = norm.getZ(i)
      }
    }

    if (idx) {
      for (let i = 0; i < idx.count; i++) {
        indices[idxOffset + i] = idx.array[i] + vertOffset
      }
      idxOffset += idx.count
    } else {
      for (let i = 0; i < pos.count; i++) {
        indices[idxOffset + i] = vertOffset + i
      }
      idxOffset += pos.count
    }

    vertOffset += pos.count
  }

  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  merged.setIndex(new THREE.BufferAttribute(indices, 1))
  return merged
}

// ── Whale path config ──────────────────────────────────────────────

interface WhaleConfig {
  scale: number
  pathRadius: number
  pathHeight: number
  pathSpeed: number
  phaseOffset: number
  yOffset: number
}

const WHALE_CONFIGS: WhaleConfig[] = [
  // Large whale — far, slow, majestic
  { scale: 4.5, pathRadius: 28, pathHeight: 3, pathSpeed: 0.06, phaseOffset: 0, yOffset: 2 },
  // Medium whale — mid distance
  { scale: 3.0, pathRadius: 20, pathHeight: 2, pathSpeed: 0.08, phaseOffset: Math.PI * 0.7, yOffset: -1 },
  // Smaller whale — closer
  { scale: 2.0, pathRadius: 15, pathHeight: 1.5, pathSpeed: 0.1, phaseOffset: Math.PI * 1.4, yOffset: -3 },
  // Baby whale following medium
  { scale: 1.2, pathRadius: 19, pathHeight: 2, pathSpeed: 0.085, phaseOffset: Math.PI * 0.7 + 0.3, yOffset: -1.5 },
]

// ── Component ──────────────────────────────────────────────────────

export function Whales({
  count = 4,
  swimSpeed = 1.0,
  pathRadius = 1.0,
  undulationAmp = 0.15,
}: WhalesProps) {
  const whaleCount = Math.min(count, WHALE_CONFIGS.length)

  return (
    <group>
      {WHALE_CONFIGS.slice(0, whaleCount).map((config, i) => (
        <SingleWhale
          key={i}
          config={config}
          swimSpeed={swimSpeed}
          pathRadiusMult={pathRadius}
          undulationAmp={undulationAmp}
        />
      ))}
    </group>
  )
}

// ── Single Whale ───────────────────────────────────────────────────

interface SingleWhaleProps {
  config: WhaleConfig
  swimSpeed: number
  pathRadiusMult: number
  undulationAmp: number
}

function SingleWhale({ config, swimSpeed, pathRadiusMult, undulationAmp }: SingleWhaleProps) {
  const groupRef = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => createWhaleGeometry(), [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSwimSpeed: { value: config.pathSpeed * swimSpeed },
      uUndulationAmp: { value: undulationAmp },
      uDirection: { value: new THREE.Vector3(1, 0, 0) },
      uSkinColor: { value: new THREE.Color('#1a2a3d') },
      uBellyColor: { value: new THREE.Color('#4a6070') },
      uRoughness: { value: 0.7 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((state) => {
    if (!groupRef.current || !materialRef.current) return

    const t = state.clock.elapsedTime * config.pathSpeed * swimSpeed + config.phaseOffset
    const r = config.pathRadius * pathRadiusMult

    // Elliptical looping path
    const x = Math.cos(t) * r
    const z = Math.sin(t) * r * 0.7
    const y = config.yOffset + Math.sin(t * 0.5) * config.pathHeight

    groupRef.current.position.set(x, y, z)
    groupRef.current.scale.setScalar(config.scale)

    // Face the swimming direction (tangent of the path)
    const dx = -Math.sin(t) * r
    const dz = Math.cos(t) * r * 0.7
    const dy = Math.cos(t * 0.5) * config.pathHeight * 0.5
    const angle = Math.atan2(dz, dx)
    groupRef.current.rotation.y = angle + Math.PI / 2

    // Gentle banking into turns
    groupRef.current.rotation.z = Math.sin(t) * 0.08

    // Subtle pitch
    groupRef.current.rotation.x = dy * 0.05

    // Update shader
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    materialRef.current.uniforms.uSwimSpeed.value = config.pathSpeed * swimSpeed
    materialRef.current.uniforms.uUndulationAmp.value = undulationAmp
  })

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={whaleVert}
          fragmentShader={whaleFrag}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
