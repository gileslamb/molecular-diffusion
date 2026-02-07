// Plankton fragment shader — translucent, bioluminescent, organic
uniform float uTime;
uniform vec3 uColor;
uniform float uBioluminescence;
uniform float uTranslucency;

varying float vAlpha;
varying float vDepth;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vType;
varying float vPhase;
varying vec3 vViewPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // Fresnel / rim-light for translucent membrane look
  float fresnel = 1.0 - abs(dot(normal, viewDir));
  fresnel = pow(fresnel, 2.5);

  // Subsurface scattering approximation
  float sss = pow(max(0.0, dot(normal, vec3(0.0, 1.0, 0.0))), 1.5) * 0.4;

  // Depth-based color temperature
  float depthFactor = smoothstep(3.0, 40.0, vDepth);
  vec3 warmColor = uColor * vec3(1.2, 1.0, 0.8);
  vec3 coolColor = uColor * vec3(0.5, 0.7, 1.3);
  vec3 baseColor = mix(warmColor, coolColor, depthFactor);

  // Bioluminescent pulse — type-dependent
  float bioPhase = uTime * 0.8 + vPhase * 6.28;
  float bioGlow = sin(bioPhase) * 0.5 + 0.5;
  bioGlow = pow(bioGlow, 3.0); // sharp pulse
  
  // Different glow colors per type
  vec3 glowColor;
  float typeVal = vType;
  if (typeVal < 0.25) {
    glowColor = vec3(0.2, 0.8, 1.0); // cyan copepod
  } else if (typeVal < 0.5) {
    glowColor = vec3(0.1, 1.0, 0.6); // green diatom
  } else if (typeVal < 0.75) {
    glowColor = vec3(0.4, 0.6, 1.0); // blue larvae
  } else {
    glowColor = vec3(0.3, 1.0, 0.9); // teal radiolarian
  }

  // Translucent body
  float bodyAlpha = mix(0.15, 0.6, 1.0 - fresnel) * uTranslucency;

  // Membrane edge glow
  vec3 membraneGlow = baseColor * fresnel * 1.5;

  // Inner body with subsurface
  vec3 innerColor = baseColor * (0.3 + sss * 0.7);

  // Combine
  vec3 color = innerColor + membraneGlow;

  // Add bioluminescence
  color += glowColor * bioGlow * uBioluminescence * 0.6;

  // Subtle internal structure pattern
  float structure = sin(vWorldPos.x * 30.0 + uTime * 0.3) *
                    sin(vWorldPos.y * 25.0 + uTime * 0.2) *
                    sin(vWorldPos.z * 28.0);
  structure = structure * 0.5 + 0.5;
  color += baseColor * structure * 0.1;

  float alpha = vAlpha * (bodyAlpha + fresnel * 0.4 + bioGlow * uBioluminescence * 0.3);

  gl_FragColor = vec4(color, alpha);
}
