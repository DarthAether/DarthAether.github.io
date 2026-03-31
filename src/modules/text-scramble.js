/**
 * text-scramble.js — Hover over project names/headings to scramble characters
 * through random glyphs before resolving. Hollywood hacking terminal effect.
 */
import { state } from '../core/state.js'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>{}[]~^'

export function initTextScramble() {
  if (state.get('prefersReducedMotion')) return

  const targets = document.querySelectorAll('.card-name, .other-card h4, .exp-role, .research-paper-title')

  targets.forEach(el => {
    const originalText = el.textContent
    let isScrambling = false
    let rafId = null

    el.classList.add('scramble-text')

    el.addEventListener('mouseenter', () => {
      if (isScrambling) return
      isScrambling = true

      const chars = originalText.split('')
      const resolved = new Array(chars.length).fill(false)
      let frame = 0

      function scramble() {
        frame++
        let text = ''

        for (let i = 0; i < chars.length; i++) {
          if (resolved[i] || chars[i] === ' ') {
            text += chars[i]
          } else {
            text += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          }

          // Resolve characters progressively (left to right with some randomness)
          if (!resolved[i] && frame > 3 + i * 1.5 + Math.random() * 3) {
            resolved[i] = true
          }
        }

        el.textContent = text

        if (resolved.every(Boolean)) {
          el.textContent = originalText
          isScrambling = false
          return
        }

        rafId = requestAnimationFrame(scramble)
      }

      rafId = requestAnimationFrame(scramble)
    })

    el.addEventListener('mouseleave', () => {
      if (rafId) cancelAnimationFrame(rafId)
      el.textContent = originalText
      isScrambling = false
    })
  })
}
