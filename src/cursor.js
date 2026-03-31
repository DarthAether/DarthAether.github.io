/**
 * cursor.js v2.1 — Fixed translate offset
 */
export function initCursor() {
  if (window.innerWidth < 768) return

  const ring = document.querySelector('.cursor-ring')
  const dot = document.querySelector('.cursor-dot')
  if (!ring || !dot) return

  let mouseX = 0, mouseY = 0
  let ringX = 0, ringY = 0
  let hovering = false

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`
  })

  function tick() {
    ringX += (mouseX - ringX) * 0.15
    ringY += (mouseY - ringY) * 0.15
    const s = hovering ? 1.5 : 1
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%) scale(${s})`
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)

  document.querySelectorAll('a, button, .project-card, .other-card').forEach((el) => {
    el.addEventListener('mouseenter', () => { hovering = true })
    el.addEventListener('mouseleave', () => { hovering = false })
  })
}
