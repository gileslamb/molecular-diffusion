import type { Color } from 'three'

// ─── Environment ────────────────────────────────────────────────────
export interface UnderwaterEnvironmentProps {
  fogNearColor: string
  fogFarColor: string
  fogNear: number
  fogFar: number
}

// ─── Plankton ───────────────────────────────────────────────────────
export interface PlanktonProps {
  count: number
  spread: number
  driftSpeed: number
  pulseIntensity: number
  bioluminescence: number
  translucency: number
  color: string
}

// ─── Whales ─────────────────────────────────────────────────────────
export interface WhalesProps {
  count: number
  swimSpeed: number
  pathRadius: number
  undulationAmp: number
}

// ─── Caustics ───────────────────────────────────────────────────────
export interface CausticsProps {
  scale: number
  speed: number
  opacity: number
  color: string
  yPosition: number
}

// ─── Lighting ───────────────────────────────────────────────────────
export interface UnderwaterLightingProps {
  sunIntensity: number
  sunColor: string
  ambientIntensity: number
  ambientColor: string
  sunPosition: [number, number, number]
}

// ─── Camera ─────────────────────────────────────────────────────────
export interface CameraControlsProps {
  autoRotate: boolean
  autoRotateSpeed: number
  enableDamping: boolean
  dampingFactor: number
  maxPolarAngle: number
  minPolarAngle: number
  maxDistance: number
  minDistance: number
}

// ─── Scene Controls (Leva) ──────────────────────────────────────────
export interface SceneControls {
  // Plankton
  planktonCount: number
  driftSpeed: number
  pulseIntensity: number
  bioluminescence: number
  // Whales
  whaleCount: number
  swimSpeed: number
  undulationAmp: number
  // Environment
  fogDensity: number
  causticsSpeed: number
  causticsOpacity: number
  sunIntensity: number
  // Camera
  autoRotate: boolean
}

// ─── Audio stub ─────────────────────────────────────────────────────
export interface AudioState {
  initialized: boolean
  playing: boolean
  volume: number
}

// ─── Color helpers ──────────────────────────────────────────────────
export type ColorInput = string | number | Color
