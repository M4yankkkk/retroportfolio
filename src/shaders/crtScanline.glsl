// CRT Scanline Fragment Shader
// Used as a ShaderMaterial on the screen mesh OR as a post-process pass

varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uScanlineIntensity;    // 0.0 – 1.0
uniform float uFlickerIntensity;     // 0.0 – 0.05
uniform float uChromaticAberration; // 0.0 – 0.008
uniform float uCurvature;           // 0.0 – 0.15

// Barrel / CRT curvature distortion
vec2 curveUV(vec2 uv, float curvature) {
  uv = uv * 2.0 - 1.0;
  vec2 offset = abs(uv.yx) / vec2(6.0, 6.0);
  uv = uv + uv * offset * offset * curvature;
  uv = uv * 0.5 + 0.5;
  return uv;
}

void main() {
  vec2 uv = curveUV(vUv, uCurvature);

  // Vignette at screen edges after curvature
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Chromatic aberration – slight RGB channel shift
  float ca = uChromaticAberration;
  float r = texture2D(tDiffuse, uv + vec2(ca, 0.0)).r;
  float g = texture2D(tDiffuse, uv).g;
  float b = texture2D(tDiffuse, uv - vec2(ca, 0.0)).b;
  vec3 col = vec3(r, g, b);

  // Scanlines
  float scanline = sin(uv.y * 800.0) * 0.04 * uScanlineIntensity;
  col -= scanline;

  // Moving glow scanline
  float glowLine = smoothstep(0.97, 1.0, sin(uv.y * 3.14159 - uTime * 0.8));
  col += glowLine * vec3(0.1, 0.4, 0.1) * 0.3;

  // CRT vignette (darkens edges)
  vec2 vigUv = uv * (1.0 - uv.yx);
  float vig = pow(vigUv.x * vigUv.y * 15.0, 0.4);
  col *= vig;

  // Flicker
  float flicker = 1.0 - uFlickerIntensity * fract(sin(uTime * 123.456) * 43758.5453);
  col *= flicker;

  // Phosphor glow tint (green CRT)
  col *= vec3(0.85, 1.0, 0.85);

  gl_FragColor = vec4(col, 1.0);
}
