/**
 * app.js — The orchestrator. Imports all modules, calls init in order.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { state } from './state.js'
import { emitter } from './emitter.js'

// Modules
import { initScroll, scrollTo } from '../modules/scroll.js'
import { initCursor } from '../modules/cursor.js'
import { initGrain } from '../modules/grain.js'
import { navbarBehavior, mobileMenu } from '../modules/navigation.js'
import { heroReveal, initFontMorph } from '../modules/hero.js'
import { scrollAnimations, initTextDistortion } from '../modules/scroll-animations.js'
import { initMagneticButtons } from '../modules/magnetic.js'
import { initPreloader } from '../modules/preloader.js'
import { startClock } from '../modules/clock.js'
import { marqueeHover } from '../modules/marquee.js'
import { initGyroscope } from '../modules/gyroscope.js'

// Components
import { initProjectModal } from '../components/modal.js'

// Three.js
import { initThreeBackground } from '../three/scene.js'

// New extravagant features
import { initCursorTrail } from '../modules/cursor-trail.js'
import { initTypewriter } from '../modules/typewriter.js'
import { initProgressDots } from '../modules/progress-dots.js'
import { initTextScramble } from '../modules/text-scramble.js'

// Easter eggs
import '../easter-eggs/console-art.js'
import { initTriggers } from '../easter-eggs/triggers.js'
import { initAudioReactive } from '../easter-eggs/modes/audio-reactive.js'

gsap.registerPlugin(ScrollTrigger)

function initAll() {
  heroReveal()
  navbarBehavior()
  mobileMenu()
  scrollAnimations()
  startClock()
  marqueeHover()

  const prefersReducedMotion = state.get('prefersReducedMotion')

  if (!prefersReducedMotion) {
    try { initThreeBackground() } catch (e) { console.warn('Three.js skipped:', e.message) }
  }
  initCursor()
  if (!prefersReducedMotion) initGrain()
  initProjectModal()
  initMagneticButtons()
  initBackToTop()

  // Cutting edge features
  initFontMorph()
  initTextDistortion()
  initAudioReactive()
  initGyroscope()

  // Easter egg triggers
  initTriggers()
}

function initBackToTop() {
  const btt = document.querySelector('.back-to-top')
  if (!btt) return
  btt.addEventListener('click', (e) => {
    e.preventDefault()
    scrollTo('#hero', { offset: 0 })
  })
}

export function init() {
  // Init scroll first (sets up Lenis, ScrollTrigger, progress bar)
  initScroll()

  // Resize handler
  let resizeTimeout = null
  window.addEventListener('resize', () => {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      ScrollTrigger.refresh()
      state.set('isMobile', window.innerWidth < 768)
      emitter.emit('resize', { width: window.innerWidth, height: window.innerHeight })
    }, 250)
  })

  // Preloader orchestrates page init — it calls initAll, then emits preloader:complete
  initPreloader(initAll)
}
