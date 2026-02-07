// Whale fragment shader — realistic skin, subsurface scattering, depth
uniform float uTime;
uniform vec3 uSkinColor;
uniform vec3 uBellyColor;
uniform float uRoughness;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDepth;
varying vec3 vViewPosition;
varying float vBodyFactor;

// Simple noise for skin texture
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // Light from above (sun)
  vec3 lightDir = normalize(vec3(0.2, 1.0, 0.3));

  // Diffuse lighting
  float NdotL = max(dot(normal, lightDir), 0.0);
  float diffuse = NdotL * 0.7 + 0.3; // soft fill

  // Specular highlight — wet skin
  vec3 halfVec = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfVec), 0.0), 40.0 / (uRoughness + 0.01));
  spec *= 0.3;

  // Fresnel — rim light (underwater caustic-bounce)
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

  // Belly/dorsal blend (normal.y: +1 = top, -1 = bottom)
  float bellyFactor = smoothstep(-0.2, -0.6, normal.y);
  vec3 baseColor = mix(uSkinColor, uBellyColor, bellyFactor);

  // Skin texture — subtle noise variation
  vec2 skinUV = vWorldPos.xz * 2.0 + vWorldPos.y * 0.5;
  float skinNoise = noise(skinUV * 8.0) * 0.1 + noise(skinUV * 20.0) * 0.05;
  baseColor *= (0.9 + skinNoise);

  // Subsurface scattering — light passing through edges
  float sss = pow(max(0.0, dot(-normal, lightDir)), 2.0) * 0.2;
  vec3 sssColor = uBellyColor * sss;

  // Depth-based fog tint
  float depthFactor = smoothstep(5.0, 50.0, vDepth);
  vec3 fogColor = vec3(0.0, 0.06, 0.12);

  // Combine
  vec3 color = baseColor * diffuse + vec3(0.6, 0.8, 1.0) * spec;
  color += sssColor;
  color += vec3(0.15, 0.25, 0.4) * fresnel * 0.5; // underwater rim

  // Fog blend
  color = mix(color, fogColor, depthFactor * 0.6);

  // Alpha — solid body with slight depth fade at far distance
  float alpha = smoothstep(60.0, 15.0, vDepth);

  gl_FragColor = vec4(color, alpha);
}
