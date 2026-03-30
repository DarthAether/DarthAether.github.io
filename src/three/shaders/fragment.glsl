/**
 * Custom fragment shader for particle constellation
 * Circular point with soft glow and distance-based fade
 */

uniform vec3 uColor;
uniform float uTime;

varying float vAlpha;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  // Distance from center of point (gl_PointCoord is 0-1 within the point)
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);

  // Discard pixels outside the circle radius
  if (dist > 0.5) discard;

  // Soft circular shape with glow falloff
  float strength = 1.0 - (dist * 2.0);
  strength = pow(strength, 1.5);

  // Soft glow halo
  float glow = exp(-dist * 4.0) * 0.6;

  // Combine core and glow
  float finalAlpha = (strength + glow) * vAlpha;

  // Slight color variation based on position for depth
  float posInfluence = length(vPosition) * 0.05;
  vec3 color = uColor + vec3(posInfluence * 0.1, -posInfluence * 0.05, posInfluence * 0.15);

  // Subtle time-based shimmer
  float shimmer = sin(uTime * 2.0 + vPosition.x * 10.0) * 0.1 + 0.9;
  finalAlpha *= shimmer;

  gl_FragColor = vec4(color, finalAlpha);
}
