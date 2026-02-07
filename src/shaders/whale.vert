// Whale vertex shader — body undulation, tail & fin animation
uniform float uTime;
uniform float uSwimSpeed;
uniform float uUndulationAmp;
uniform vec3 uDirection; // swim direction

varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDepth;
varying vec3 vViewPosition;
varying float vBodyFactor; // 0 at head, 1 at tail

void main() {
  vec3 pos = position;

  // Body factor: how far along the body (x-axis assumed head-to-tail)
  // Normalize to 0..1 based on geometry bounds (~-1 to 1 for unit shapes)
  vBodyFactor = (pos.x + 1.0) * 0.5;

  // Swimming undulation — increases toward the tail
  float wave = sin(pos.x * 3.0 - uTime * uSwimSpeed * 3.0) * uUndulationAmp;
  float tailFactor = pow(max(0.0, vBodyFactor), 2.0);
  pos.z += wave * tailFactor;

  // Gentle vertical bob
  pos.y += sin(uTime * uSwimSpeed * 0.5) * 0.1;

  // Subtle body flex
  pos.y += sin(pos.x * 2.0 - uTime * uSwimSpeed * 1.5) * 0.03 * tailFactor;

  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;

  vNormal = normalize(normalMatrix * normal);
  vWorldPos = worldPosition.xyz;
  vDepth = -mvPosition.z;
  vViewPosition = -mvPosition.xyz;

  gl_Position = projectionMatrix * mvPosition;
}
