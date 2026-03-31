/**
 * scene.js — Performance-optimized Three.js particle background
 * Reads from state store, subscribes to changes. No window.__ globals.
 */
import * as THREE from 'three'
import { state } from '../core/state.js'
import { isLowEnd } from '../utils/device.js'

let renderer, scene, camera, particles, lineMesh
let mouseX = 0, mouseY = 0
let frameId = null
let frameCount = 0
let isVisible = true

// Adaptive particle count based on device capability
const IS_LOW_END = isLowEnd()
const PARTICLE_COUNT = IS_LOW_END ? 500 : 1000
const CONNECTION_DISTANCE = 0.8
const CONN_DIST_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE

export function initThreeBackground() {
  // Skip on mobile
  if (window.innerWidth < 768) return

  const wrap = document.getElementById('hero-canvas-wrap')
  if (!wrap) return

  // Scene
  scene = new THREE.Scene()

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    (wrap.clientWidth || window.innerWidth) / (wrap.clientHeight || window.innerHeight),
    0.1,
    100
  )
  camera.position.z = 6

  // Renderer — cap pixel ratio for performance
  const w = wrap.clientWidth || window.innerWidth
  const h = wrap.clientHeight || window.innerHeight
  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setClearColor(0x000000, 0)
  wrap.appendChild(renderer.domElement)

  // Particles
  const positions = new Float32Array(PARTICLE_COUNT * 3)
  const velocities = new Float32Array(PARTICLE_COUNT * 3)

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = Math.cbrt(Math.random()) * 4.0

    positions[i3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = r * Math.cos(phi)

    velocities[i3] = (Math.random() - 0.5) * 0.002
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.002
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.002
  }

  const particleGeom = new THREE.BufferGeometry()
  particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const particleMat = new THREE.PointsMaterial({
    color: 0x818cf8,
    size: 0.03,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  })

  particles = new THREE.Points(particleGeom, particleMat)
  scene.add(particles)

  // Lines geometry (pre-allocate)
  const maxLines = PARTICLE_COUNT * 3
  const linePositions = new Float32Array(maxLines * 6)
  const lineGeom = new THREE.BufferGeometry()
  lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
  lineGeom.setDrawRange(0, 0)

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x818cf8,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
  })

  lineMesh = new THREE.LineSegments(lineGeom, lineMat)
  scene.add(lineMesh)

  particles.userData.velocities = velocities

  // Mouse tracking — throttled via passive listener
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })

  // Visibility-aware: pause when hero is off-screen
  const observer = new IntersectionObserver(
    ([entry]) => { isVisible = entry.isIntersecting },
    { threshold: 0.05 }
  )
  observer.observe(wrap)

  animate()
}

function onMouseMove(e) {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1
}

function onResize() {
  const wrap = document.getElementById('hero-canvas-wrap')
  if (!wrap || !renderer || !camera) return

  const w = wrap.clientWidth
  const h = wrap.clientHeight

  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

function animate() {
  frameId = requestAnimationFrame(animate)

  // Skip rendering when hero is scrolled out of view
  if (!isVisible || !particles || !renderer || !scene || !camera) return

  frameCount++

  const posAttr = particles.geometry.attributes.position
  const pos = posAttr.array
  const vel = particles.userData.velocities

  // Update particle positions
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3
    pos[i3] += vel[i3]
    pos[i3 + 1] += vel[i3 + 1]
    pos[i3 + 2] += vel[i3 + 2]

    // Bounce within sphere
    const dist = Math.sqrt(pos[i3] ** 2 + pos[i3 + 1] ** 2 + pos[i3 + 2] ** 2)
    if (dist > 4.5) {
      vel[i3] *= -1
      vel[i3 + 1] *= -1
      vel[i3 + 2] *= -1
    }
  }
  posAttr.needsUpdate = true

  // Connection lines — only recalculate every 3rd frame
  if (frameCount % 3 === 0) {
    const lineAttr = lineMesh.geometry.attributes.position
    const linePos = lineAttr.array
    let lineIdx = 0
    const maxSegments = linePos.length / 6

    // Wider step for fewer checks
    const step = IS_LOW_END ? 5 : 3
    for (let i = 0; i < PARTICLE_COUNT && lineIdx < maxSegments; i += step) {
      const i3 = i * 3
      for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < maxSegments; j += step) {
        const j3 = j * 3
        const dx = pos[i3] - pos[j3]
        const dy = pos[i3 + 1] - pos[j3 + 1]
        const dz = pos[i3 + 2] - pos[j3 + 2]
        const distSq = dx * dx + dy * dy + dz * dz

        if (distSq < CONN_DIST_SQ) {
          const base = lineIdx * 6
          linePos[base] = pos[i3]
          linePos[base + 1] = pos[i3 + 1]
          linePos[base + 2] = pos[i3 + 2]
          linePos[base + 3] = pos[j3]
          linePos[base + 4] = pos[j3 + 1]
          linePos[base + 5] = pos[j3 + 2]
          lineIdx++
        }
      }
    }

    lineMesh.geometry.setDrawRange(0, lineIdx * 2)
    lineAttr.needsUpdate = true
  }

  // Scroll velocity influence — particles react to scroll speed
  const scrollVel = state.get('scrollVelocity') || 0
  const absVel = Math.min(Math.abs(scrollVel), 12)

  // Auto rotation — accelerates with scroll
  particles.rotation.y += 0.0005 + absVel * 0.0004
  lineMesh.rotation.y = particles.rotation.y

  // Mouse influence (subtle shift)
  const targetX = mouseY * 0.3
  particles.rotation.x += (targetX - particles.rotation.x) * 0.02
  lineMesh.rotation.x = particles.rotation.x

  // HYPERSPACE: scroll velocity stretches particles into star-streaks
  const hyperFactor = absVel > 4 ? absVel * 0.06 : absVel * 0.02
  const targetScaleY = 1 + hyperFactor
  particles.scale.y += (targetScaleY - particles.scale.y) * 0.1
  lineMesh.scale.y = particles.scale.y

  // Particle size increases during hyperspace
  const targetSize = 0.03 + (absVel > 4 ? absVel * 0.004 : 0)
  particles.material.size += (targetSize - particles.material.size) * 0.1

  // Particle opacity pulses with scroll intensity
  const targetOpacity = 0.5 + absVel * 0.05
  particles.material.opacity += (targetOpacity - particles.material.opacity) * 0.1

  // ── Color: Sith mode OR section-based shifting ──
  const sithMode = state.get('sithMode') || false
  let targetColor = sithMode ? 0xef4444 : (state.get('particleColor') || 0x818cf8)
  const currentHex = particles.material.color.getHex()
  if (currentHex !== targetColor) {
    // Lerp color for smooth transition
    const cur = particles.material.color
    const tgt = new THREE.Color(targetColor)
    cur.lerp(tgt, 0.03)
    lineMesh.material.color.copy(cur)
  }

  // ── Audio reactivity ──
  const bass = state.get('audioBass') || 0
  const mid = state.get('audioMid') || 0
  const high = state.get('audioHigh') || 0

  if (bass > 0.01 || mid > 0.01) {
    // Bass: displacement/scale pulse
    const bassScale = 1 + bass * 0.3
    particles.scale.x += (bassScale - particles.scale.x) * 0.15
    particles.scale.z += (bassScale - particles.scale.z) * 0.15

    // Mid: rotation speed boost
    particles.rotation.y += mid * 0.008

    // High: brightness/size boost
    const audioSize = 0.03 + high * 0.04
    particles.material.size += (audioSize - particles.material.size) * 0.15

    // Opacity reacts to overall energy
    const audioOpacity = 0.5 + (bass + mid) * 0.3
    particles.material.opacity += (audioOpacity - particles.material.opacity) * 0.12
  } else {
    // Settle back to defaults when no audio
    particles.scale.x += (1 - particles.scale.x) * 0.05
    particles.scale.z += (1 - particles.scale.z) * 0.05
  }

  // ── Gyroscope parallax (mobile) ──
  const gyroX = state.get('gyroX') || 0
  const gyroY = state.get('gyroY') || 0
  if (Math.abs(gyroX) > 0.01 || Math.abs(gyroY) > 0.01) {
    const gyroTargetY = gyroX * 0.5
    const gyroTargetX = gyroY * 0.3
    particles.rotation.y += (gyroTargetY - particles.rotation.y) * 0.03
    particles.rotation.x += (gyroTargetX - particles.rotation.x) * 0.03
    lineMesh.rotation.y = particles.rotation.y
    lineMesh.rotation.x = particles.rotation.x
  }

  // ── Cursor repulsion field (lightweight) ──
  if (mouseX !== 0 || mouseY !== 0) {
    const repulsorX = mouseX * 4
    const repulsorY = mouseY * 3
    const repulseRadius = 1.5
    const repulseStrength = 0.002

    // Only check a subset for performance
    for (let i = 0; i < PARTICLE_COUNT; i += (IS_LOW_END ? 4 : 2)) {
      const i3 = i * 3
      const dx = pos[i3] - repulsorX
      const dy = pos[i3 + 1] - repulsorY
      const distSq = dx * dx + dy * dy
      if (distSq < repulseRadius * repulseRadius && distSq > 0.01) {
        const d = Math.sqrt(distSq)
        const force = repulseStrength / d
        vel[i3] += dx * force
        vel[i3 + 1] += dy * force
      }
    }
  }

  renderer.render(scene, camera)
}

export function disposeThreeBackground() {
  if (frameId) cancelAnimationFrame(frameId)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', onResize)

  if (particles) {
    particles.geometry.dispose()
    particles.material.dispose()
  }
  if (lineMesh) {
    lineMesh.geometry.dispose()
    lineMesh.material.dispose()
  }
  if (renderer) {
    renderer.dispose()
    const wrap = document.getElementById('hero-canvas-wrap')
    if (wrap && renderer.domElement.parentNode === wrap) {
      wrap.removeChild(renderer.domElement)
    }
  }

  renderer = null
  scene = null
  camera = null
  particles = null
  lineMesh = null
  frameId = null
}
