/**
 * text-reveal.js — Reusable text reveal utility
 * Uses SplitType + ScrollTrigger for scroll-driven text reveals
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

gsap.registerPlugin(ScrollTrigger)

/**
 * Create a scroll-triggered text reveal animation
 * @param {string} selector - CSS selector for text elements to reveal
 * @param {object} options - Configuration
 * @param {'chars'|'words'|'lines'} options.type - Split type (default: 'chars')
 * @param {number} options.stagger - Stagger between units (default: 0.02)
 * @param {number} options.duration - Animation duration (default: 1)
 * @param {string} options.ease - GSAP ease (default: 'power3.out')
 * @param {string} options.start - ScrollTrigger start (default: 'top 85%')
 * @param {number} options.y - Initial Y offset (default: '100%' for chars, 40 for words/lines)
 * @returns {ScrollTrigger[]} Array of ScrollTrigger instances for cleanup
 */
export function createTextReveal(selector, options = {}) {
  const {
    type = 'chars',
    stagger = 0.02,
    duration = 1,
    ease = 'power3.out',
    start = 'top 85%',
    y = null,
  } = options

  const elements = document.querySelectorAll(selector)
  const triggers = []

  elements.forEach((el) => {
    // Split the text
    const split = new SplitType(el, {
      types: type,
      tagName: 'span',
    })

    // Get the split elements
    const targets = split[type]
    if (!targets || targets.length === 0) return

    // Determine Y offset based on type
    const yOffset = y !== null ? y : (type === 'chars' ? '100%' : 40)

    // Set initial state
    gsap.set(targets, {
      y: yOffset,
      opacity: type === 'chars' ? 1 : 0,
    })

    // If revealing chars, add overflow hidden to parent
    if (type === 'chars') {
      // Ensure parent words/lines have overflow hidden for clip effect
      const words = el.querySelectorAll('.word')
      words.forEach((w) => {
        w.style.overflow = 'hidden'
        w.style.display = 'inline-block'
      })
    }

    // Create ScrollTrigger animation
    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      toggleActions: 'play none none none',
      onEnter: () => {
        gsap.to(targets, {
          y: 0,
          opacity: 1,
          duration,
          stagger,
          ease,
        })
      },
    })

    triggers.push(trigger)
  })

  return triggers
}

/**
 * Kill text reveal triggers and revert splits
 * @param {ScrollTrigger[]} triggers
 */
export function destroyTextReveals(triggers) {
  if (triggers && triggers.length) {
    triggers.forEach((t) => t.kill())
  }
}
