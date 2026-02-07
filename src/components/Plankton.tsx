/**
 * Photorealistic plankton system.
 * Multiple organism types with translucent bodies, bioluminescence,
 * and organic drift patterns. Uses instanced rendering.
 *
 * Types: copepod (elongated), diatom (cylindrical), larvae (teardrop), radiolarian (spiky sphere)
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import planktonVert from '../shaders/plankton.vert'
import planktonFrag from '../shaders/plankton.frag'

export interface PlanktonProps {
  count?: number
  spread?: number
  driftSpeed?: number
  pulseIntensity?: number
  bioluminescence?: number
  translucency?: number
  color?: string
}

// ── Procedural plankton geometry builders ──────────────────────────

function createCopepodGeometry(): THREE.BufferGeometry {
  // Elongated body + antenna-like protrusions
  const body = new THREE.CapsuleGeometry(0.03, 0.12, 6, 12)

  // Add two antennae as thin cones merged in
  const antenna1 = new THREE.ConeGeometry(0.004, 0.08, 4)
  antenna1.translate(0.0, 0.1, 0.015)
  antenna1.rotateZ(-0.4)

  const antenna2 = new THREE.ConeGeometry(0.004, 0.08, 4)
  antenna2.translate(0.0, 0.1, -0.015)
  antenna2.rotateZ(0.4)

  // Tail filament
  const tail = new THREE.CylinderGeometry(0.003, 0.001, 0.06, 4)
  tail.translate(0.0, -0.1, 0.0)

  // Merge
  const merged = mergeGeometries([body, antenna1, antenna2, tail])
  merged.rotateZ(Math.PI / 2) // orient horizontally
  return merged
}

function createDiatomGeometry(): THREE.BufferGeometry {
  // Cylindrical with slight barrel shape — like a pillbox diatom
  const segments = 12
  const points: THREE.Vector2[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const y = (t - 0.5) * 0.08
    // barrel curve
    const r = 0.025 + Math.sin(t * Math.PI) * 0.012
    points.push(new THREE.Vector2(r, y))
  }
  const geo = new THREE.LatheGeometry(points, 8)
  return geo
}

function createLarvaeGeometry(): THREE.BufferGeometry {
  // Teardrop / tadpole shape
  const segments = 14
  const points: THREE.Vector2[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const y = (t - 0.3) * 0.15
    // teardrop profile: fat head, thin tail
    const r = 0.03 * Math.sin(t * Math.PI) * (1.0 - t * 0.5)
    points.push(new THREE.Vector2(Math.max(r, 0.002), y))
  }
  const geo = new THREE.LatheGeometry(points, 8)

  // Trailing filaments
  const filament = new THREE.CylinderGeometry(0.002, 0.0005, 0.07, 3)
  filament.translate(0.0, -0.06, 0.0)

  return mergeGeometries([geo, filament])
}

function createRadiolarianGeometry(): THREE.BufferGeometry {
  // Spiky sphere — icosahedron with extruded spines
  const core = new THREE.IcosahedronGeometry(0.025, 1)

  // Add spines at each vertex of a lower-detail icosahedron
  const spineBase = new THREE.IcosahedronGeometry(0.025, 0)
  const spinePositions = spineBase.getAttribute('position')
  const spines: THREE.BufferGeometry[] = [core]

  const seen = new Set<string>()
  for (let i = 0; i < spinePositions.count; i++) {
    const x = spinePositions.getX(i)
    const y = spinePositions.getY(i)
    const z = spinePositions.getZ(i)
    const key = `${x.toFixed(3)}_${y.toFixed(3)}_${z.toFixed(3)}`
    if (seen.has(key)) continue
    seen.add(key)

    const spine = new THREE.ConeGeometry(0.003, 0.04, 3)
    // Point the spine outward from center
    const dir = new THREE.Vector3(x, y, z).normalize()
    const up = new THREE.Vector3(0, 1, 0)
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir)
    spine.applyQuaternion(quat)
    spine.translate(
      dir.x * 0.04,
      dir.y * 0.04,
      dir.z * 0.04,
    )
    spines.push(spine)
  }

  spineBase.dispose()
  return mergeGeometries(spines)
}

/** Merge multiple BufferGeometries into one (simple concat approach). */
function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  // Count total vertices
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
  merged.computeVertexNormals()
  return merged
}

// ── Component ──────────────────────────────────────────────────────

export function Plankton({
  count = 5000,
  spread = 35,
  driftSpeed = 1.0,
  pulseIntensity = 1.0,
  bioluminescence = 0.5,
  translucency = 0.8,
  color = '#55ccbb',
}: PlanktonProps) {
  // 4 types of plankton, distributed evenly
  const typeCount = 4
  const perType = Math.floor(count / typeCount)

  return (
    <group>
      <PlanktonInstances
        geometry="copepod"
        count={perType}
        spread={spread}
        typeIndex={0}
        driftSpeed={driftSpeed}
        pulseIntensity={pulseIntensity}
        bioluminescence={bioluminescence}
        translucency={translucency}
        color={color}
      />
      <PlanktonInstances
        geometry="diatom"
        count={perType}
        spread={spread}
        typeIndex={1}
        driftSpeed={driftSpeed}
        pulseIntensity={pulseIntensity}
        bioluminescence={bioluminescence}
        translucency={translucency}
        color={color}
      />
      <PlanktonInstances
        geometry="larvae"
        count={perType}
        spread={spread}
        typeIndex={2}
        driftSpeed={driftSpeed}
        pulseIntensity={pulseIntensity}
        bioluminescence={bioluminescence}
        translucency={translucency}
        color={color}
      />
      <PlanktonInstances
        geometry="radiolarian"
        count={count - perType * 3}
        spread={spread}
        typeIndex={3}
        driftSpeed={driftSpeed}
        pulseIntensity={pulseIntensity}
        bioluminescence={bioluminescence}
        translucency={translucency}
        color={color}
      />
    </group>
  )
}

// ── Per-type instanced sub-component ───────────────────────────────

interface PlanktonInstancesProps {
  geometry: 'copepod' | 'diatom' | 'larvae' | 'radiolarian'
  count: number
  spread: number
  typeIndex: number
  driftSpeed: number
  pulseIntensity: number
  bioluminescence: number
  translucency: number
  color: string
}

function PlanktonInstances({
  geometry: geoType,
  count,
  spread,
  typeIndex,
  driftSpeed,
  pulseIntensity,
  bioluminescence,
  translucency,
  color,
}: PlanktonInstancesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  // Build geometry once
  const geo = useMemo(() => {
    switch (geoType) {
      case 'copepod': return createCopepodGeometry()
      case 'diatom': return createDiatomGeometry()
      case 'larvae': return createLarvaeGeometry()
      case 'radiolarian': return createRadiolarianGeometry()
    }
  }, [geoType])

  // Instance data
  const { matrices, sizes, phases, types } = useMemo(() => {
    const matrices: THREE.Matrix4[] = []
    const sizes = new Float32Array(count)
    const phases = new Float32Array(count)
    const types = new Float32Array(count)
    const dummy = new THREE.Matrix4()

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * spread
      const y = (Math.random() - 0.5) * spread
      const z = (Math.random() - 0.5) * spread
      dummy.makeTranslation(x, y, z)
      matrices.push(dummy.clone())
      sizes[i] = 0.4 + Math.random() * 0.6
      phases[i] = Math.random() * Math.PI * 2
      types[i] = typeIndex / (4 - 1) // normalized 0..1
    }
    return { matrices, sizes, phases, types }
  }, [count, spread, typeIndex])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDriftSpeed: { value: driftSpeed },
      uPulseIntensity: { value: pulseIntensity },
      uBoundsY: { value: spread * 0.5 },
      uSpread: { value: spread },
      uColor: { value: new THREE.Color(color) },
      uBioluminescence: { value: bioluminescence },
      uTranslucency: { value: translucency },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // Set instance data on mount
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    for (let i = 0; i < count; i++) {
      mesh.setMatrixAt(i, matrices[i])
    }
    mesh.instanceMatrix.needsUpdate = true

    const iGeo = mesh.geometry as THREE.InstancedBufferGeometry
    iGeo.setAttribute('aSize', new THREE.InstancedBufferAttribute(sizes, 1))
    iGeo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1))
    iGeo.setAttribute('aType', new THREE.InstancedBufferAttribute(types, 1))
  }, [count, matrices, sizes, phases, types])

  useFrame((state) => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    materialRef.current.uniforms.uDriftSpeed.value = driftSpeed
    materialRef.current.uniforms.uPulseIntensity.value = pulseIntensity
    materialRef.current.uniforms.uColor.value.set(color)
    materialRef.current.uniforms.uBioluminescence.value = bioluminescence
    materialRef.current.uniforms.uTranslucency.value = translucency
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geo, undefined, count]}
      frustumCulled={false}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={planktonVert}
        fragmentShader={planktonFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  )
}
