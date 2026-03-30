/**
 * cursor.js — Custom cursor system
 * Outer ring (40px) with lerp follow, inner dot (6px) instant follow
 * Uses requestAnimationFrame for lightweight rendering
 */

let cursorEl = null
let dotEl = null
let mouseX = 0
let mouseY = 0
let ringX = 0
let ringY = 0
let rafId = null
let isVisible = false

const LERP = 0.12
const RING_SIZE = 40
const RING_HOVER_SIZE = 60
const RING_EXPAND_SIZE = 80

/**
 * Initialize the custom cursor system
 * Hidden on mobile devices (< 768px)
 */
export function initCursor() {
  if (window.innerWidth <= 768) return

  cursorEl = document.querySelector('.cursor')
  dotEl = document.querySelector('.cursor-dot')

  if (!cursorEl || !dotEl) return

  // Set initial styles
  cursorEl.style.width = `${RING_SIZE}px`
  cursorEl.style.height = `${RING_SIZE}px`

  // Track mouse position
  document.addEventListener('mousemove', onMouseMove)

  // Track hover targets
  bindHoverTargets()

  // Hide cursor when it leaves the window
  document.addEventListener('mouseleave', () => {
    cursorEl.style.opacity = '0'
    dotEl.style.opacity = '0'
    isVisible = false
  })

  document.addEventListener('mouseenter', () => {
    cursorEl.style.opacity = '1'
    dotEl.style.opacity = '1'
    isVisible = true
  })

  // Start RAF loop
  tick()
}

function onMouseMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY

  // Dot follows instantly via direct transform
  if (dotEl) {
    dotEl.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`
  }

  if (!isVisible) {
    isVisible = true
    cursorEl.style.opacity = '1'
    dotEl.style.opacity = '1'
  }
}

function tick() {
  // Lerp ring position toward mouse
  ringX += (mouseX - ringX) * LERP
  ringY += (mouseY - ringY) * LERP

  if (cursorEl) {
    cursorEl.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`
  }

  rafId = requestAnimationFrame(tick)
}

function bindHoverTargets() {
  // Standard hover: links, buttons, .magnetic elements
  const hoverTargets = document.querySelectorAll(
    'a, button, .magnetic, .project-row, .contact-row'
  )
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursorEl.classList.add('hover')
      cursorEl.style.width = `${RING_HOVER_SIZE}px`
      cursorEl.style.height = `${RING_HOVER_SIZE}px`
    })
    el.addEventListener('mouseleave', () => {
      cursorEl.classList.remove('hover')
      cursorEl.style.width = `${RING_SIZE}px`
      cursorEl.style.height = `${RING_SIZE}px`
    })
  })

  // Expanded hover: .cursor-expand elements
  const expandTargets = document.querySelectorAll('.cursor-expand')
  expandTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursorEl.classList.add('expand')
      cursorEl.style.width = `${RING_EXPAND_SIZE}px`
      cursorEl.style.height = `${RING_EXPAND_SIZE}px`
      cursorEl.style.background = 'var(--accent-color, #6366f1)'
      cursorEl.style.borderColor = 'var(--accent-color, #6366f1)'
      cursorEl.style.mixBlendMode = 'normal'
      cursorEl.style.opacity = '0.3'
    })
    el.addEventListener('mouseleave', () => {
      cursorEl.classList.remove('expand')
      cursorEl.style.width = `${RING_SIZE}px`
      cursorEl.style.height = `${RING_SIZE}px`
      cursorEl.style.background = 'transparent'
      cursorEl.style.borderColor = ''
      cursorEl.style.mixBlendMode = 'difference'
      cursorEl.style.opacity = '1'
    })
  })
}

/**
 * Destroy the cursor system and clean up
 */
export function destroyCursor() {
  if (rafId) cancelAnimationFrame(rafId)
  document.removeEventListener('mousemove', onMouseMove)
}
