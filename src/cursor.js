/**
 * cursor.js v2 — Custom cursor with lerp ring + instant dot
 */

export function initCursor() {
  // Skip on mobile / touch
  if (window.innerWidth < 768) return

  const ring = document.querySelector('.cursor-ring')
  const dot = document.querySelector('.cursor-dot')
  if (!ring || !dot) return

  let mouseX = 0
  let mouseY = 0
  let ringX = 0
  let ringY = 0
  let isHovering = false

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY

    // Dot follows instantly
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`
  })

  // RAF loop for ring lerp
  function tick() {
    ringX += (mouseX - ringX) * 0.15
    ringY += (mouseY - ringY) * 0.15

    const scale = isHovering ? 1.5 : 1
    ring.style.transform = `translate(${ringX}px, ${ringY}px) scale(${scale})`

    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)

  // Hover detection
  const hoverTargets = document.querySelectorAll('a, button, .project-card')
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      isHovering = true
    })
    el.addEventListener('mouseleave', () => {
      isHovering = false
    })
  })
}
