/**
 * scroll-triggers.js — All section ScrollTrigger animations
 * Fade-ups, stagger reveals, skill bars, metric counters, card reveals
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { animateCounters } from './counters.js'

gsap.registerPlugin(ScrollTrigger)

const triggers = []

/**
 * Initialize all scroll-triggered animations across sections
 */
export function initScrollTriggers() {
  fadeUpElements()
  aboutItems()
  skillBars()
  metricsCards()
  researchCards()
  contactRows()
  heroParallax()
}

/**
 * Generic fade-up for [data-animate="fade-up"] elements (outside hero)
 */
function fadeUpElements() {
  gsap.utils.toArray('[data-animate="fade-up"]').forEach((el) => {
    // Skip hero elements — they're animated separately
    if (el.closest('.hero')) return

    gsap.set(el, { y: 40, opacity: 0 })

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none none',
      onEnter: () => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        })
      },
    })

    triggers.push(trigger)
  })
}

/**
 * About section items — stagger reveal from left
 */
function aboutItems() {
  const items = gsap.utils.toArray('.about-item')
  if (!items.length) return

  items.forEach((item, i) => {
    gsap.set(item, { x: -20, opacity: 0 })

    const trigger = ScrollTrigger.create({
      trigger: item,
      start: 'top 90%',
      onEnter: () => {
        gsap.to(item, {
          x: 0,
          opacity: 1,
          duration: 0.5,
          delay: i * 0.05,
          ease: 'power2.out',
        })
      },
    })

    triggers.push(trigger)
  })
}

/**
 * Skill bars — animate .skill-fill width to data-width
 */
function skillBars() {
  const bars = gsap.utils.toArray('.skill-fill')
  if (!bars.length) return

  bars.forEach((bar) => {
    const targetWidth = bar.getAttribute('data-width') || '0%'
    gsap.set(bar, { width: '0%' })

    const trigger = ScrollTrigger.create({
      trigger: bar,
      start: 'top 90%',
      onEnter: () => {
        gsap.to(bar, {
          width: targetWidth,
          duration: 1.2,
          ease: 'power3.out',
        })
      },
    })

    triggers.push(trigger)
  })
}

/**
 * Metrics cards — counter animation when scrolled into view
 */
function metricsCards() {
  const cards = gsap.utils.toArray('.metric-card')
  if (!cards.length) return

  cards.forEach((card) => {
    const trigger = ScrollTrigger.create({
      trigger: card,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        // Fade card in
        gsap.to(card, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
        })

        // Animate counter within card
        const counter = card.querySelector('[data-count]')
        if (counter) {
          animateCounters('[data-count]', {
            duration: 2,
          })
        }
      },
    })

    triggers.push(trigger)
  })
}

/**
 * Research section cards — slide up on scroll
 */
function researchCards() {
  const cards = gsap.utils.toArray('.research-card, .project-row')
  if (!cards.length) return

  cards.forEach((card, i) => {
    gsap.set(card, { y: 30, opacity: 0 })

    const trigger = ScrollTrigger.create({
      trigger: card,
      start: 'top 88%',
      onEnter: () => {
        gsap.to(card, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: i * 0.08,
          ease: 'power3.out',
        })
      },
    })

    triggers.push(trigger)
  })
}

/**
 * Contact rows — stagger slide up
 */
function contactRows() {
  const rows = gsap.utils.toArray('.contact-row')
  if (!rows.length) return

  rows.forEach((row, i) => {
    gsap.set(row, { y: 20, opacity: 0 })

    const trigger = ScrollTrigger.create({
      trigger: row,
      start: 'top 90%',
      onEnter: () => {
        gsap.to(row, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: i * 0.08,
          ease: 'power2.out',
        })
      },
    })

    triggers.push(trigger)
  })
}

/**
 * Hero parallax — stats drift up and fade on scroll
 */
function heroParallax() {
  const stats = document.querySelector('.hero-stats')
  if (!stats) return

  const trigger = gsap.to(stats, {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
    y: -30,
    opacity: 0.3,
  })
}

/**
 * Kill all scroll triggers
 */
export function destroyScrollTriggers() {
  triggers.forEach((t) => t.kill())
  triggers.length = 0
}
