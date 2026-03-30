/**
 * particles.js — Particle constellation system
 * 1500 particles in a sphere with connecting lines for nearby particles
 * Mouse reactivity + scroll-based spread
 */
import * as THREE from 'three'
import { scene, camera, mouse, onUpdate, offUpdate } from './scene.js'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

const PARTICLE_COUNT = 1500
const SPHERE_RADIUS = 4
const CONNECTION_DISTANCE = 0.8
const MAX_CONNECTIONS = 500  // limit for performance
const ROTATION_SPEED = 0.001
const MOUSE_LERP = 0.05

let particlesMesh = null
let linesMesh = null
let particleGroup = null
let positions = null
let originalPositions = null
let velocities = null
let scrollOffset = 0
let uniforms = null

/**
 * Create the particle constellation system
 */
export function createParticles() {
  if (!scene) return

  particleGroup = new THREE.Group()
  scene.add(particleGroup)

  createParticleMesh()
  createConnectionLines()

  // Register the update function
  onUpdate(updateParticles)

  // Listen for scroll to adjust spread
  window.addEventListener('scroll', onScroll)
}

function createParticleMesh() {
  const geometry = new THREE.BufferGeometry()
  positions = new Float32Array(PARTICLE_COUNT * 3)
  originalPositions = new Float32Array(PARTICLE_COUNT * 3)
  velocities = new Float32Array(PARTICLE_COUNT * 3)
  const sizes = new Float32Array(PARTICLE_COUNT)
  const alphas = new Float32Array(PARTICLE_COUNT)

  // Distribute particles in a sphere with random positions
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3

    // Fibonacci sphere for even distribution with some randomness
    const theta = Math.acos(1 - 2 * (i + 0.5) / PARTICLE_COUNT)
    const phi = Math.PI * (1 + Math.sqrt(5)) * i
    const r = SPHERE_RADIUS * (0.3 + Math.random() * 0.7)

    const x = r * Math.sin(theta) * Math.cos(phi)
    const y = r * Math.sin(theta) * Math.sin(phi)
    const z = r * Math.cos(theta)

    positions[i3] = x
    positions[i3 + 1] = y
    positions[i3 + 2] = z

    originalPositions[i3] = x
    originalPositions[i3 + 1] = y
    originalPositions[i3 + 2] = z

    // Small random velocities for subtle drift
    velocities[i3] = (Math.random() - 0.5) * 0.002
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.002
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.002

    // Random sizes between 2-4px equivalent
    sizes[i] = 2 + Math.random() * 2

    // Slight opacity variation
    alphas[i] = 0.4 + Math.random() * 0.6
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1))

  // Custom shader material
  uniforms = {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#818cf8') },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  }

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  particlesMesh = new THREE.Points(geometry, material)
  particleGroup.add(particlesMesh)
}

function createConnectionLines() {
  // Pre-allocate geometry for connections
  // Max connections * 2 vertices per line
  const lineGeo = new THREE.BufferGeometry()
  const linePositions = new Float32Array(MAX_CONNECTIONS * 6)
  const lineColors = new Float32Array(MAX_CONNECTIONS * 6)

  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3))
  lineGeo.setDrawRange(0, 0)

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  linesMesh = new THREE.LineSegments(lineGeo, lineMat)
  particleGroup.add(linesMesh)
}

function onScroll() {
  scrollOffset = window.scrollY / (document.body.scrollHeight - window.innerHeight)
}

/**
 * Update particles every frame
 * Called via the scene's onUpdate system
 */
export function updateParticles() {
  if (!particlesMesh || !particleGroup) return

  const time = performance.now() * 0.001

  // Update time uniform
  if (uniforms) {
    uniforms.uTime.value = time
  }

  // Gentle group rotation
  particleGroup.rotation.y += ROTATION_SPEED

  // Mouse reactivity: nudge particles toward mouse
  const mouseX = mouse.x * 2
  const mouseY = mouse.y * 2

  // Scroll spread: increase radius as user scrolls
  const spreadFactor = 1 + scrollOffset * 0.5

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3

    // Target position: original position * spread factor + mouse influence
    const targetX = originalPositions[i3] * spreadFactor
    const targetY = originalPositions[i3 + 1] * spreadFactor
    const targetZ = originalPositions[i3 + 2] * spreadFactor

    // Lerp toward target with mouse offset
    positions[i3] += ((targetX + mouseX * 0.1) - positions[i3]) * MOUSE_LERP
    positions[i3 + 1] += ((targetY + mouseY * 0.1) - positions[i3 + 1]) * MOUSE_LERP
    positions[i3 + 2] += (targetZ - positions[i3 + 2]) * MOUSE_LERP

    // Add subtle drift
    positions[i3] += velocities[i3]
    positions[i3 + 1] += velocities[i3 + 1]
    positions[i3 + 2] += velocities[i3 + 2]
  }

  particlesMesh.geometry.attributes.position.needsUpdate = true

  // Update connection lines
  updateConnections()
}

function updateConnections() {
  if (!linesMesh) return

  const linePositions = linesMesh.geometry.attributes.position.array
  const lineColors = linesMesh.geometry.attributes.color.array
  let lineIndex = 0
  const color = new THREE.Color('#818cf8')

  // Check connections (skip many particles for performance)
  const step = Math.max(1, Math.floor(PARTICLE_COUNT / 300)) // check ~300 particles

  for (let i = 0; i < PARTICLE_COUNT && lineIndex < MAX_CONNECTIONS; i += step) {
    const i3 = i * 3
    const ax = positions[i3]
    const ay = positions[i3 + 1]
    const az = positions[i3 + 2]

    for (let j = i + step; j < PARTICLE_COUNT && lineIndex < MAX_CONNECTIONS; j += step) {
      const j3 = j * 3
      const dx = ax - positions[j3]
      const dy = ay - positions[j3 + 1]
      const dz = az - positions[j3 + 2]
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (dist < CONNECTION_DISTANCE) {
        const li6 = lineIndex * 6

        linePositions[li6] = ax
        linePositions[li6 + 1] = ay
        linePositions[li6 + 2] = az
        linePositions[li6 + 3] = positions[j3]
        linePositions[li6 + 4] = positions[j3 + 1]
        linePositions[li6 + 5] = positions[j3 + 2]

        // Color fades with distance
        const alpha = 1 - dist / CONNECTION_DISTANCE
        lineColors[li6] = color.r * alpha
        lineColors[li6 + 1] = color.g * alpha
        lineColors[li6 + 2] = color.b * alpha
        lineColors[li6 + 3] = color.r * alpha
        lineColors[li6 + 4] = color.g * alpha
        lineColors[li6 + 5] = color.b * alpha

        lineIndex++
      }
    }
  }

  linesMesh.geometry.setDrawRange(0, lineIndex * 2)
  linesMesh.geometry.attributes.position.needsUpdate = true
  linesMesh.geometry.attributes.color.needsUpdate = true
}

/**
 * Dispose of the particle system
 */
export function disposeParticles() {
  offUpdate(updateParticles)
  window.removeEventListener('scroll', onScroll)

  if (particleGroup && scene) {
    scene.remove(particleGroup)

    particleGroup.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) obj.material.dispose()
    })
  }

  particlesMesh = null
  linesMesh = null
  particleGroup = null
  positions = null
  originalPositions = null
  velocities = null
}
