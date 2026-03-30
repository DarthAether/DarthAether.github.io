/**
 * color-shift.js — Per-section color transitions
 * Reads data-bg and data-accent from section[data-section] elements
 * Animates CSS custom properties on scroll using GSAP + ScrollTrigger
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const triggers = []

/**
 * Initialize color shifting based on section data attributes
 * Each section[data-section] can define:
 *   data-bg="#0a0a0a"
 *   data-accent="#6366f1"
 */
export function initColorShift() {
  const sections = document.querySelectorAll('section[data-section]')
  if (!sections.length) return

  // Set default CSS custom properties
  document.body.style.setProperty('--bg-color', '#f0ede8')
  document.body.style.setProperty('--accent-color', '#6366f1')

  sections.forEach((section) => {
    const bg = section.getAttribute('data-bg')
    const accent = section.getAttribute('data-accent')

    // Only create trigger if section has color data
    if (!bg && !accent) return

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => shiftColors(bg, accent),
      onEnterBack: () => shiftColors(bg, accent),
    })

    triggers.push(trigger)
  })

  // Handle the first visible section on load
  const firstSection = sections[0]
  if (firstSection) {
    const bg = firstSection.getAttribute('data-bg')
    const accent = firstSection.getAttribute('data-accent')
    if (bg || accent) {
      shiftColors(bg, accent)
    }
  }
}

function shiftColors(bg, accent) {
  const targets = {}

  if (bg) {
    targets['--bg-color'] = bg
  }
  if (accent) {
    targets['--accent-color'] = accent
  }

  // Animate CSS custom properties on body
  gsap.to(document.body, {
    duration: 0.8,
    ease: 'power2.inOut',
    ...Object.fromEntries(
      Object.entries(targets).map(([key, value]) => [key, value])
    ),
    onUpdate: function () {
      // GSAP can't natively tween CSS custom properties that are colors,
      // so we use a proxy approach with GSAP's color interpolation
    },
  })

  // Use direct property setting with transition (CSS handles the interpolation)
  // This is more reliable for CSS custom properties
  if (bg) document.body.style.setProperty('--bg-color', bg)
  if (accent) document.body.style.setProperty('--accent-color', accent)
}

/**
 * Clean up ScrollTrigger instances
 */
export function destroyColorShift() {
  triggers.forEach((t) => t.kill())
  triggers.length = 0
}
