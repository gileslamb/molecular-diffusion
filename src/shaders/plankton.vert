// Plankton vertex shader — organic drift, pulsing, rotation
uniform float uTime;
uniform float uDriftSpeed;
uniform float uPulseIntensity;
uniform float uBoundsY;
uniform float uSpread;

attribute float aPhase;
attribute float aSize;
attribute float aType; // 0=copepod, 1=diatom, 2=larvae, 3=radiolarian

varying float vAlpha;
varying float vDepth;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vType;
varying float vPhase;
varying vec3 vViewPosition;

// Hash for organic variation
vec3 hash3(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 74.7)),
    dot(p, vec3(269.5, 183.3, 246.1)),
    dot(p, vec3(113.5, 271.9, 124.6))
  );
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}

void main() {
  // Instance origin
  vec3 instancePos = vec3(
    instanceMatrix[3][0],
    instanceMatrix[3][1],
    instanceMatrix[3][2]
  );

  float t = uTime * 0.15 + aPhase;
  float slowT = uTime * 0.05 + aPhase;

  // Organic drift — slow sinusoidal with micro-turbulence
  vec3 drift = hash3(instancePos * 0.3 + slowT * 0.1) * 0.15 * uDriftSpeed;
  
  // Gentle current flow
  float currentX = sin(slowT * 0.3 + instancePos.z * 0.05) * 0.5;
  float currentZ = cos(slowT * 0.2 + instancePos.x * 0.04) * 0.3;

  // Very slow vertical settling with wrap
  float settledY = mod(
    instancePos.y - uTime * 0.02 + aPhase * 8.0 + sin(t * 0.4) * 0.3,
    uBoundsY * 2.0
  ) - uBoundsY;

  vec3 displaced = vec3(
    instancePos.x + drift.x + currentX + sin(t * 0.5) * 0.2,
    settledY + drift.y,
    instancePos.z + drift.z + currentZ + cos(t * 0.4) * 0.15
  );

  // Organic pulsing — body breathes
  float pulse = 1.0 + sin(uTime * 1.5 + aPhase * 6.28) * uPulseIntensity * 0.15;

  // Per-type rotation for variety
  float rotAngle = t * 0.3 + aPhase * 3.14;
  float cosR = cos(rotAngle);
  float sinR = sin(rotAngle);
  
  // Scale and rotate the vertex
  vec3 pos = position * (0.5 + aSize * 1.0) * pulse;
  
  // Gentle tumble rotation around Y
  vec3 rotatedPos = vec3(
    pos.x * cosR - pos.z * sinR,
    pos.y,
    pos.x * sinR + pos.z * cosR
  );

  vec3 worldPos = rotatedPos + displaced;
  vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);

  // Depth fade
  float depth = -mvPosition.z;
  vAlpha = smoothstep(55.0, 2.0, depth) * (0.35 + 0.65 * aSize);
  vDepth = depth;
  vNormal = normalMatrix * normal;
  vWorldPos = worldPos;
  vType = aType;
  vPhase = aPhase;
  vViewPosition = -mvPosition.xyz;

  gl_Position = projectionMatrix * mvPosition;
}
