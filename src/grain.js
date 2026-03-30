/**
 * grain.js v2 — Film grain canvas at half resolution, every 2nd frame
 */

export function initGrain() {
  const canvas = document.querySelector('#grain')
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let frame = 0

  function resize() {
    canvas.width = Math.ceil(window.innerWidth / 2)
    canvas.height = Math.ceil(window.innerHeight / 2)
  }

  resize()
  window.addEventListener('resize', resize)

  function render() {
    requestAnimationFrame(render)

    frame++
    if (frame % 2 !== 0) return

    const w = canvas.width
    const h = canvas.height
    const imageData = ctx.createImageData(w, h)
    const data = imageData.data

    for (let i = 0, len = data.length; i < len; i += 4) {
      const v = Math.random() * 255
      data[i] = v       // R
      data[i + 1] = v   // G
      data[i + 2] = v   // B
      data[i + 3] = 5 + Math.random() * 3 // Alpha 5-8
    }

    ctx.putImageData(imageData, 0, 0)
  }

  requestAnimationFrame(render)
}
