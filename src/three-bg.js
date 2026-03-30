/**
 * three-bg.js v2 — Simplified Three.js particle background
 * No custom shaders. Uses PointsMaterial + BufferGeometry lines.
 */
import * as THREE from 'three'

let renderer, scene, camera, particles, lineMesh
let mouseX = 0, mouseY = 0
let frameId = null
const PARTICLE_COUNT = 1000
const CONNECTION_DISTANCE = 0.8

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
    wrap.clientWidth / wrap.clientHeight,
    0.1,
    100
  )
  camera.position.z = 6

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(wrap.clientWidth, wrap.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  wrap.appendChild(renderer.domElement)

  // Particles
  const positions = new Float32Array(PARTICLE_COUNT * 3)
  const velocities = new Float32Array(PARTICLE_COUNT * 3)

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3
    // Distribute in a sphere
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

  // Lines geometry (pre-allocate max possible segments)
  const maxLines = PARTICLE_COUNT * 3 // rough upper bound
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

  // Store velocities for animation
  particles.userData.velocities = velocities

  // Mouse tracking
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('resize', onResize)

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

  if (!particles || !renderer || !scene || !camera) return

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
    if (dist > 2.8) {
      vel[i3] *= -1
      vel[i3 + 1] *= -1
      vel[i3 + 2] *= -1
    }
  }
  posAttr.needsUpdate = true

  // Connection lines
  const lineAttr = lineMesh.geometry.attributes.position
  const linePos = lineAttr.array
  let lineIdx = 0
  const maxSegments = linePos.length / 6

  // Only check a subset for performance
  const step = PARTICLE_COUNT > 500 ? 3 : 1
  for (let i = 0; i < PARTICLE_COUNT && lineIdx < maxSegments; i += step) {
    const i3 = i * 3
    for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < maxSegments; j += step) {
      const j3 = j * 3
      const dx = pos[i3] - pos[j3]
      const dy = pos[i3 + 1] - pos[j3 + 1]
      const dz = pos[i3 + 2] - pos[j3 + 2]
      const distSq = dx * dx + dy * dy + dz * dz

      if (distSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
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

  // Auto rotation
  particles.rotation.y += 0.0005
  lineMesh.rotation.y = particles.rotation.y

  // Mouse influence (subtle shift)
  const targetX = mouseY * 0.3
  const targetY = mouseX * 0.3
  particles.rotation.x += (targetX - particles.rotation.x) * 0.02
  lineMesh.rotation.x = particles.rotation.x

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
