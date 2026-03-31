/**
 * scroll.js — Lenis smooth scroll + ScrollTrigger integration + velocity tracking
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import { state } from '../core/state.js'
import { emitter } from '../core/emitter.js'

gsap.registerPlugin(ScrollTrigger)

let lenis = null

export function initScroll() {
  const prefersReducedMotion = state.get('prefersReducedMotion')

  if (!prefersReducedMotion) {
    lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    })
    lenis.on('scroll', (e) => {
      ScrollTrigger.update()
      const velocity = e.velocity || 0
      state.set('scrollVelocity', velocity)
      emitter.emit('scroll:update', { velocity })
    })
    gsap.ticker.add((time) => lenis.raf(time * 1000))
  }
  gsap.ticker.lagSmoothing(500, 33)

  // Scroll progress bar
  const progressBar = document.getElementById('scroll-progress')
  if (progressBar) {
    progressBar.style.transformOrigin = 'left'
    progressBar.style.width = '100%'
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        progressBar.style.transform = `scaleX(${self.progress})`
        emitter.emit('scroll:update', { progress: self.progress })
      },
    })
  }

  // Section-based particle color shifting
  if (!prefersReducedMotion) {
    const sectionColors = {
      'hero': 0x818cf8,
      'projects': 0x6366f1,
      'other-work': 0x7c3aed,
      'about': 0x818cf8,
      'experience': 0x06b6d4,
      'research': 0xa855f7,
      'contact': 0x818cf8,
    }

    document.querySelectorAll('section[id]').forEach((section) => {
      const color = sectionColors[section.id]
      if (!color) return

      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => { state.set('particleColor', color) },
        onEnterBack: () => { state.set('particleColor', color) },
      })
    })
  }
}

export function getLenis() {
  return lenis
}

export function scrollTo(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, opts)
  else {
    const el = document.querySelector(target)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }
}
