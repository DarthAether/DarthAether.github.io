/**
 * main.js — Entry point orchestrator
 * Imports and initializes all modules in the correct order
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ──── Register GSAP plugins ────
gsap.registerPlugin(ScrollTrigger)

// ──── Core modules ────
import { lenis } from './core/smooth-scroll.js'
import { initCursor } from './core/cursor.js'
import { initGrain } from './core/grain.js'
import { initClock } from './core/clock.js'
import { initColorShift } from './core/color-shift.js'

// ──── Animation modules ────
import { initPreloader } from './animations/preloader.js'
import { initHeroAnimation } from './animations/hero.js'
import { initScrollTriggers } from './animations/scroll-triggers.js'
import { initMagneticEffects } from './animations/magnetic.js'
import { initMarquee } from './animations/marquee.js'
import { initProjectAnimations } from './animations/projects.js'
import { initTimeline } from './animations/timeline.js'
import { initClipReveals } from './animations/clip-reveals.js'
import { createTextReveal } from './animations/text-reveal.js'

// ──── Three.js ────
import { initScene } from './three/scene.js'
import { createParticles } from './three/particles.js'

// ──────────────────────────────────────
// Phase 1: Immediate initialization
// These run before the page is fully loaded
// ──────────────────────────────────────

// Core systems that should start immediately
initCursor()
initGrain()
initClock()

// ──────────────────────────────────────
// Phase 2: On window load — preloader + reveals
// ──────────────────────────────────────

window.addEventListener('load', async () => {
  // Initialize Three.js scene (renders behind hero)
  try {
    initScene()
    createParticles()
  } catch (err) {
    console.warn('Three.js initialization skipped:', err.message)
  }

  // Run preloader and wait for it to complete
  await initPreloader()

  // ──────────────────────────────────
  // Phase 3: Post-preloader animations
  // Everything below runs after the preloader hides
  // ──────────────────────────────────

  // Hero entrance animation (char reveals, counters)
  initHeroAnimation()

  // ScrollTrigger-based animations for all sections
  initScrollTriggers()

  // Magnetic hover effects
  initMagneticEffects()

  // Marquee hover controls
  initMarquee()

  // Project section animations
  initProjectAnimations()

  // Timeline SVG draw + entry reveals
  initTimeline()

  // Clip-path reveals for select elements
  initClipReveals()

  // Per-section color transitions
  initColorShift()

  // Text reveal for headings (about, contact titles)
  createTextReveal('.about-name', {
    type: 'chars',
    stagger: 0.02,
    duration: 1,
    ease: 'power4.out',
  })

  createTextReveal('.contact-title', {
    type: 'words',
    stagger: 0.08,
    duration: 0.8,
    ease: 'power3.out',
  })
})

// ──────────────────────────────────────
// Resize handler
// ──────────────────────────────────────

let resizeTimeout = null

window.addEventListener('resize', () => {
  // Debounce resize events
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    ScrollTrigger.refresh()
  }, 250)
})
