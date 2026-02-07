// Caustics fragment shader – animated light patterns
uniform float uTime;
uniform float uSpeed;
uniform float uOpacity;
uniform vec3 uColor;

varying vec2 vUv;

// Simplex-like noise for caustic patterns
vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  const float K1 = 0.366025404; // (sqrt(3)-1)/2
  const float K2 = 0.211324865; // (3-sqrt(3))/6

  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(dot(a, hash(i)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
  return dot(n, vec3(70.0));
}

float causticPattern(vec2 uv, float time) {
  float scale = 3.0;
  vec2 p = uv * scale;

  float n1 = noise(p + time * 0.1);
  float n2 = noise(p * 1.5 + time * -0.15 + 3.7);
  float n3 = noise(p * 2.3 + time * 0.08 + 7.3);

  // Layered caustic pattern
  float caustic = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
  caustic = caustic * 0.5 + 0.5; // normalize to 0-1

  // Sharpen the bright lines
  caustic = pow(caustic, 2.0);
  caustic = smoothstep(0.2, 0.8, caustic);

  return caustic;
}

void main() {
  float t = uTime * uSpeed;

  // Two overlapping caustic layers for more realism
  float c1 = causticPattern(vUv, t);
  float c2 = causticPattern(vUv * 1.3 + vec2(1.7, 2.3), t * 0.8);
  float caustic = max(c1, c2 * 0.7);

  // Edge fade
  vec2 edge = smoothstep(vec2(0.0), vec2(0.15), vUv) *
              smoothstep(vec2(0.0), vec2(0.15), 1.0 - vUv);
  float edgeFade = edge.x * edge.y;

  vec3 color = uColor * caustic;
  float alpha = caustic * uOpacity * edgeFade;

  gl_FragColor = vec4(color, alpha);
}
