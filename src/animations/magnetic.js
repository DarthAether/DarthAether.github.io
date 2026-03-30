/**
 * magnetic.js — Magnetic hover effect
 * Elements subtly follow the mouse cursor when hovered
 */
import { gsap } from 'gsap'

const boundElements = new Map()

/**
 * Initialize magnetic hover effects on all .magnetic and target elements
 */
export function initMagneticEffects() {
  const selectors = '.magnetic, .project-link, .contact-row a, .top-bar-badge'
  const elements = document.querySelectorAll(selectors)

  elements.forEach(bindMagnetic)
}

/**
 * Bind magnetic behavior to a single element
 * @param {HTMLElement} el
 */
function bindMagnetic(el) {
  if (boundElements.has(el)) return

  const strength = parseFloat(el.getAttribute('data-magnetic-strength')) || 0.3

  const handlers = {
    move: (e) => onMouseMove(e, el, strength),
    leave: () => onMouseLeave(el),
  }

  el.addEventListener('mousemove', handlers.move)
  el.addEventListener('mouseleave', handlers.leave)

  boundElements.set(el, handlers)
}

/**
 * Calculate offset from element center and apply transform
 */
function onMouseMove(e, el, strength) {
  const rect = el.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const offsetX = (e.clientX - centerX) * strength
  const offsetY = (e.clientY - centerY) * strength

  gsap.to(el, {
    x: offsetX,
    y: offsetY,
    duration: 0.4,
    ease: 'power2.out',
  })

  // Also apply a subtle rotation based on distance from center
  const rotation = offsetX * 0.02
  gsap.to(el, {
    rotation,
    duration: 0.4,
    ease: 'power2.out',
  })
}

/**
 * Animate element back to its original position
 */
function onMouseLeave(el) {
  gsap.to(el, {
    x: 0,
    y: 0,
    rotation: 0,
    duration: 0.7,
    ease: 'elastic.out(1, 0.5)',
  })
}

/**
 * Clean up all magnetic event listeners
 */
export function destroyMagneticEffects() {
  boundElements.forEach((handlers, el) => {
    el.removeEventListener('mousemove', handlers.move)
    el.removeEventListener('mouseleave', handlers.leave)
  })
  boundElements.clear()
}
