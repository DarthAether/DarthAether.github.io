/**
 * scene.js — Three.js scene setup and management
 * WebGLRenderer, PerspectiveCamera, Scene, mouse tracking, RAF loop
 */
import * as THREE from 'three'

let renderer = null
let camera = null
let scene = null
let canvas = null
let rafId = null
let isRunning = false

// Normalized mouse position (-1 to 1)
const mouse = new THREE.Vector2(0, 0)

// Update callbacks registered by particle system, etc.
const updateCallbacks = []

/**
 * Initialize the Three.js scene
 * Attaches to #hero-canvas if it exists, otherwise creates one
 */
export function initScene() {
  // Create canvas and append to .section-hero as first child
  canvas = document.createElement('canvas')
  canvas.id = 'hero-canvas'
  canvas.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  `
  const hero = document.querySelector('.section-hero')
  if (hero) {
    hero.style.position = 'relative'
    hero.insertBefore(canvas, hero.firstChild)
  } else {
    document.body.prepend(canvas)
  }

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x000000, 0)

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  )
  camera.position.z = 5

  // Scene
  scene = new THREE.Scene()

  // Mouse tracking
  window.addEventListener('mousemove', onMouseMove)

  // Resize
  window.addEventListener('resize', onResize)

  // Start render loop
  isRunning = true
  tick()
}

function onMouseMove(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
}

function onResize() {
  if (!camera || !renderer) return

  const w = window.innerWidth
  const h = window.innerHeight

  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

function tick() {
  if (!isRunning) return

  // Run all registered update callbacks
  updateCallbacks.forEach((cb) => cb())

  // Render
  renderer.render(scene, camera)

  rafId = requestAnimationFrame(tick)
}

/**
 * Register an update callback that runs every frame
 * @param {Function} callback
 */
export function onUpdate(callback) {
  updateCallbacks.push(callback)
}

/**
 * Remove an update callback
 * @param {Function} callback
 */
export function offUpdate(callback) {
  const idx = updateCallbacks.indexOf(callback)
  if (idx !== -1) updateCallbacks.splice(idx, 1)
}

/**
 * Dispose of the Three.js scene and clean up resources
 */
export function disposeScene() {
  isRunning = false
  if (rafId) cancelAnimationFrame(rafId)

  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', onResize)

  if (renderer) {
    renderer.dispose()
    renderer = null
  }

  if (scene) {
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose())
        } else {
          obj.material.dispose()
        }
      }
    })
    scene = null
  }

  camera = null
  updateCallbacks.length = 0
}

export { renderer, camera, scene, mouse }
