/**
 * cursor.js v2.2 — GPU-composited custom cursor
 */
export function initCursor() {
  if (window.innerWidth < 768) return

  const ring = document.querySelector('.cursor-ring')
  const dot = document.querySelector('.cursor-dot')
  if (!ring || !dot) return

  // Hide native cursor
  document.body.classList.add('liquid-glass')

  // Promote to GPU layer
  ring.style.willChange = 'transform'
  dot.style.willChange = 'transform'

  let mouseX = 0, mouseY = 0
  let ringX = 0, ringY = 0
  let hovering = false

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`
  }, { passive: true })

  function tick() {
    ringX += (mouseX - ringX) * 0.15
    ringY += (mouseY - ringY) * 0.15
    const s = hovering ? 1.5 : 1
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${s})`
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)

  document.querySelectorAll('a, button, .project-card, .other-card, .research-card, .experience-card').forEach((el) => {
    el.addEventListener('mouseenter', () => { hovering = true; ring.classList.add('hover') })
    el.addEventListener('mouseleave', () => { hovering = false; ring.classList.remove('hover') })
  })
}