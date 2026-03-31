/**
 * progress-dots.js — Scroll-linked side navigation dots.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { state } from '../core/state.js'

export function initProgressDots() {
  if (state.get('isMobile')) return

  const dots = document.querySelectorAll('.scroll-dot')
  if (!dots.length) return

  // Track active section and update dots
  document.querySelectorAll('section[id]').forEach((section) => {
    const id = section.id
    const dot = document.querySelector(`.scroll-dot[data-section="${id}"]`)
    if (!dot) return

    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => setActiveDot(dot),
      onEnterBack: () => setActiveDot(dot),
    })
  })

  function setActiveDot(activeDot) {
    dots.forEach(d => d.classList.remove('active'))
    activeDot.classList.add('active')
  }

  // Click to scroll
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const section = dot.dataset.section
      const target = document.getElementById(section)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    })
  })
}
