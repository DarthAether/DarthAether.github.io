/**
 * hero.js — Hero entrance animation
 * SplitType char reveals, staggered fade-ups, counter animations
 */
import { gsap } from 'gsap'
import SplitType from 'split-type'
import { animateCounters } from './counters.js'

/**
 * Initialize the hero section entrance animation
 * Call after preloader completes for maximum impact
 */
export function initHeroAnimation() {
  const heroTitle = document.querySelector('.hero-title')
  if (!heroTitle) return

  // Split each .line element into chars using SplitType
  const lines = heroTitle.querySelectorAll('.line')
  const splitInstances = []

  lines.forEach((line) => {
    // Wrap content in a .line-inner for overflow clip reveal
    // Check if already wrapped (from existing code)
    if (!line.querySelector('.line-inner')) {
      const html = line.innerHTML
      line.innerHTML = `<span class="line-inner">${html}</span>`
    }

    const inner = line.querySelector('.line-inner')
    const split = new SplitType(inner, {
      types: 'chars',
      tagName: 'span',
    })
    splitInstances.push(split)
  })

  // Gather all chars across all lines
  const allChars = heroTitle.querySelectorAll('.line-inner .char')

  // Set initial state — chars start translated down (hidden by overflow:hidden on .line)
  gsap.set(allChars, {
    y: '110%',
    opacity: 1,
  })

  // Also set initial state for other hero elements
  gsap.set('.hero-tag', { opacity: 0, y: 20 })
  gsap.set('.hero-desc', { opacity: 0, y: 20 })
  gsap.set('.hero-stats', { opacity: 0, y: 20 })
  gsap.set('.scroll-indicator', { opacity: 0 })

  // Build the master timeline
  const tl = gsap.timeline({
    defaults: { ease: 'power4.out' },
  })

  // 1. Chars reveal — staggered translate from below
  tl.to(allChars, {
    y: '0%',
    duration: 1.2,
    stagger: 0.03,
  })

  // 2. Hero tag — fade up (overlapping)
  tl.to('.hero-tag', {
    opacity: 1,
    y: 0,
    duration: 0.8,
  }, '-=0.6')

  // 3. Hero description — fade up
  tl.to('.hero-desc', {
    opacity: 1,
    y: 0,
    duration: 0.8,
  }, '-=0.5')

  // 4. Hero stats — fade up
  tl.to('.hero-stats', {
    opacity: 1,
    y: 0,
    duration: 0.8,
  }, '-=0.4')

  // 5. Scroll indicator — fade in
  tl.to('.scroll-indicator', {
    opacity: 1,
    duration: 0.6,
  }, '-=0.3')

  // 6. Animate stat counters
  animateCounters('.hero-stat-val', {
    duration: 2,
    delay: 0.8,
  })
}
