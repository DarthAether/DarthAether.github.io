/**
 * clip-reveals.js — Clip-path section transitions
 * Subtle, performant clip-path animations for key elements
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const triggers = []

/**
 * Initialize clip-path reveal animations
 */
export function initClipReveals() {
  gridCards()
  aboutSection()
  sectionLabels()
}

/**
 * Grid cards: reveal with clip-path from right edge
 * inset(0 100% 0 0) -> inset(0 0% 0 0)
 */
function gridCards() {
  const cards = document.querySelectorAll(
    '.project-row, .about-block, .metric-card, .grid-card'
  )
  if (!cards.length) return

  cards.forEach((card, i) => {
    // Only apply to a subset to keep it subtle
    // Apply to about-blocks and grid-cards
    if (!card.classList.contains('about-block') && !card.classList.contains('grid-card')) return

    gsap.set(card, {
      clipPath: 'inset(0 100% 0 0)',
    })

    const trigger = ScrollTrigger.create({
      trigger: card,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(card, {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1,
          delay: i * 0.1,
          ease: 'power3.inOut',
        })
      },
    })

    triggers.push(trigger)
  })
}

/**
 * About section: reveal from center circle outward
 */
function aboutSection() {
  const about = document.querySelector('.section-about')
  if (!about) return

  const aboutName = about.querySelector('.about-name')
  if (!aboutName) return

  gsap.set(aboutName, {
    clipPath: 'circle(0% at 50% 50%)',
  })

  const trigger = ScrollTrigger.create({
    trigger: aboutName,
    start: 'top 80%',
    onEnter: () => {
      gsap.to(aboutName, {
        clipPath: 'circle(100% at 50% 50%)',
        duration: 1.2,
        ease: 'power3.out',
      })
    },
  })

  triggers.push(trigger)
}

/**
 * Section labels: wipe reveal from left
 */
function sectionLabels() {
  const labels = document.querySelectorAll('.section-label')
  if (!labels.length) return

  labels.forEach((label) => {
    // Skip if already handled by fade-up animation
    if (label.getAttribute('data-animate') === 'fade-up') return

    gsap.set(label, {
      clipPath: 'inset(0 100% 0 0)',
    })

    const trigger = ScrollTrigger.create({
      trigger: label,
      start: 'top 88%',
      onEnter: () => {
        gsap.to(label, {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.8,
          ease: 'power2.inOut',
        })
      },
    })

    triggers.push(trigger)
  })
}

/**
 * Clean up all clip-reveal triggers
 */
export function destroyClipReveals() {
  triggers.forEach((t) => t.kill())
  triggers.length = 0
}
