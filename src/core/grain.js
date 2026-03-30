/**
 * grain.js — Canvas film grain overlay
 * Renders subtle noise at ~30fps (every 2nd frame) for cinematic texture
 */

let canvas = null
let ctx = null
let rafId = null
let frameCount = 0

/**
 * Initialize the film grain overlay
 * Expects a <canvas id="grain-canvas"> in the DOM.
 * If not found, creates one and appends to body.
 */
export function initGrain() {
  canvas = document.getElementById('grain-canvas')

  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.id = 'grain-canvas'
    canvas.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9997;
      opacity: 0.4;
    `
    document.body.appendChild(canvas)
  }

  ctx = canvas.getContext('2d')
  resize()
  window.addEventListener('resize', resize)

  // Start render loop
  tick()
}

function resize() {
  if (!canvas) return
  // Use a lower resolution for performance — grain doesn't need retina
  canvas.width = window.innerWidth / 2
  canvas.height = window.innerHeight / 2
}

function tick() {
  frameCount++

  // Only render every 2nd frame (~30fps visual)
  if (frameCount % 2 === 0) {
    renderNoise()
  }

  rafId = requestAnimationFrame(tick)
}

function renderNoise() {
  if (!ctx || !canvas) return

  const w = canvas.width
  const h = canvas.height
  const imageData = ctx.createImageData(w, h)
  const data = imageData.data

  for (let i = 0, len = data.length; i < len; i += 4) {
    const value = Math.random() * 255

    // Monochrome noise — all channels same
    data[i] = value       // R
    data[i + 1] = value   // G
    data[i + 2] = value   // B
    // Very subtle alpha: 5-8 range
    data[i + 3] = 5 + Math.random() * 3
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Destroy the grain overlay and clean up
 */
export function destroyGrain() {
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resize)
}
