/**
 * Post-processing effects for photorealistic underwater look.
 * Enhanced bloom for bioluminescence, vignette for depth-of-field feel,
 * chromatic aberration for water refraction, and color grading.
 */

import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  HueSaturation,
  BrightnessContrast,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'

interface PostProcessingProps {
  bloomIntensity?: number
  bloomThreshold?: number
  vignetteIntensity?: number
}

export function PostProcessing({
  bloomIntensity = 1.0,
  bloomThreshold = 0.2,
  vignetteIntensity = 0.6,
}: PostProcessingProps) {
  return (
    <EffectComposer>
      {/* Bioluminescent glow bloom */}
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.9}
        mipmapBlur
      />

      {/* Deep vignette for submersion feel */}
      <Vignette
        offset={0.25}
        darkness={vignetteIntensity}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Water refraction simulation */}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.0008, 0.0008)}
        radialModulation={true}
        modulationOffset={0.4}
      />

      {/* Ocean color grading — slight cyan shift, desaturated depths */}
      <HueSaturation
        blendFunction={BlendFunction.NORMAL}
        hue={0.05}
        saturation={-0.1}
      />

      {/* Slight contrast boost for depth */}
      <BrightnessContrast
        brightness={-0.03}
        contrast={0.08}
      />
    </EffectComposer>
  )
}
