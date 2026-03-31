/**
 * cursor-trail.js — Afterimage trail following the cursor.
 * 5 ghost copies with increasing delay and decreasing opacity.
 */
import { state } from '../core/state.js'

export function initCursorTrail() {
  if (state.get('isMobile') || state.get('prefersReducedMotion')) return

  const TRAIL_COUNT = 5
  const trails = []
  let mouseX = 0, mouseY = 0

  // Create trail elements
  for (let i = 0; i < TRAIL_COUNT; i++) {
    const el = document.createElement('div')
    el.className = 'cursor-afterimage'
    const size = 30 - i * 4 // 30px → 14px
    el.style.width = size + 'px'
    el.style.height = size + 'px'
    el.style.opacity = (0.3 - i * 0.05).toFixed(2) // 0.3 → 0.1
    document.body.appendChild(el)
    trails.push({ el, x: 0, y: 0 })
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
  }, { passive: true })

  function animate() {
    // Each trail follows the previous one with increasing lag
    trails.forEach((trail, i) => {
      const target = i === 0 ? { x: mouseX, y: mouseY } : trails[i - 1]
      const lerp = 0.15 - i * 0.02 // 0.15 → 0.05

      trail.x += (target.x - trail.x) * lerp
      trail.y += (target.y - trail.y) * lerp

      trail.el.style.left = trail.x + 'px'
      trail.el.style.top = trail.y + 'px'
    })

    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}
