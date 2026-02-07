/**
 * Audio stub for future Tone.js integration.
 * Phase 1 – no audio playback, just scaffolding.
 */

import type { AudioState } from './types'

let audioState: AudioState = {
  initialized: false,
  playing: false,
  volume: 0.5,
}

export function getAudioState(): AudioState {
  return { ...audioState }
}

export async function initAudio(): Promise<void> {
  // Future: await Tone.start()
  audioState = { ...audioState, initialized: true }
  console.log('[Audio] Stub initialized – Tone.js ready for Phase 2')
}

export function setVolume(v: number): void {
  audioState = { ...audioState, volume: Math.max(0, Math.min(1, v)) }
}

export function togglePlayback(): void {
  audioState = { ...audioState, playing: !audioState.playing }
}
