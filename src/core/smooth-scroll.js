/**
 * smooth-scroll.js — Lenis smooth scroll setup
 * Synced with GSAP ticker and ScrollTrigger
 */
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // exponential ease
  smooth: true,
  smoothTouch: false,
  touchMultiplier: 2,
})

// Sync Lenis scroll position with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update)

// Drive Lenis from GSAP's global ticker for frame-perfect sync
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

/**
 * Smooth scroll to a target element or position
 * @param {string|number|HTMLElement} target - CSS selector, pixel offset, or element
 * @param {object} opts - Lenis scrollTo options
 */
export function scrollTo(target, opts = {}) {
  lenis.scrollTo(target, {
    offset: 0,
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    ...opts,
  })
}

/**
 * Pause smooth scrolling (useful during modals/overlays)
 */
export function pauseScroll() {
  lenis.stop()
}

/**
 * Resume smooth scrolling
 */
export function resumeScroll() {
  lenis.start()
}

export { lenis }
export default lenis
