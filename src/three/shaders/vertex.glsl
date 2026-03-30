/**
 * Custom vertex shader for particle constellation
 * Standard projection with time-based oscillation
 */

uniform float uTime;
uniform float uPixelRatio;

attribute float aSize;
attribute float aAlpha;

varying float vAlpha;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vAlpha = aAlpha;
  vUv = uv;
  vPosition = position;

  // Time-based subtle oscillation
  vec3 pos = position;
  float oscillation = sin(uTime * 0.5 + position.x * 2.0) * 0.02;
  pos.y += oscillation;
  pos.x += cos(uTime * 0.3 + position.z * 1.5) * 0.015;

  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  // Point size with perspective attenuation
  gl_PointSize = aSize * uPixelRatio;
  gl_PointSize *= (1.0 / -viewPosition.z);
  gl_PointSize = max(gl_PointSize, 1.0);
}
