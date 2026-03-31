/**
 * magnetic.js — Magnetic hover on buttons with elastic snapback
 */
import { gsap } from 'gsap'
import { state } from '../core/state.js'

export function initMagneticButtons() {
  if (state.get('isMobile') || state.get('prefersReducedMotion')) return

  document.querySelectorAll('.btn, .contact-cv, .nav-brand').forEach((btn) => {
    const strength = parseFloat(btn.dataset.strength) || 25

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect()
      const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width
      const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height

      gsap.to(btn, {
        x: dx * strength,
        y: dy * strength,
        duration: 0.4,
        ease: 'power3.out',
      })
    }, { passive: true })

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0, y: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)',
      })
    })
  })
}
