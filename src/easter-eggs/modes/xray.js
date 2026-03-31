/**
 * xray.js — Shift-hold cursor X-ray mode
 */
import { state } from '../../core/state.js'

export function initXray() {
  if (state.get('isMobile') || state.get('prefersReducedMotion')) return

  const ring = document.querySelector('.cursor-ring')
  if (!ring) return

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift' && !e.repeat) {
      ring.classList.add('xray-mode')
    }
  })

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
      ring.classList.remove('xray-mode')
    }
  })
}
