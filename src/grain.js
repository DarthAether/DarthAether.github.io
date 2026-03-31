/**
 * grain.js v2.1 — Film grain canvas, optimized with Uint32Array bulk fill
 */

export function initGrain() {
  const canvas = document.querySelector('#grain')
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) return

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return

  let frame = 0

  function resize() {
    // Render at quarter resolution for performance
    canvas.width = Math.ceil(window.innerWidth / 3)
    canvas.height = Math.ceil(window.innerHeight / 3)
  }

  resize()
  window.addEventListener('resize', resize, { passive: true })

  function render() {
    requestAnimationFrame(render)

    frame++
    // Only render every 3rd frame — grain doesn't need 60fps
    if (frame % 3 !== 0) return

    const w = canvas.width
    const h = canvas.height
    const imageData = ctx.createImageData(w, h)
    // Use Uint32Array view for 4x faster pixel writes
    const buf32 = new Uint32Array(imageData.data.buffer)
    const len = buf32.length

    for (let i = 0; i < len; i++) {
      const v = (Math.random() * 255) | 0
      // ABGR format (little-endian): alpha << 24 | blue << 16 | green << 8 | red
      const alpha = (5 + (Math.random() * 3)) | 0
      buf32[i] = (alpha << 24) | (v << 16) | (v << 8) | v
    }

    ctx.putImageData(imageData, 0, 0)
  }

  requestAnimationFrame(render)
}