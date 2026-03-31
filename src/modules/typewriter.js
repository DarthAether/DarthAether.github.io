/**
 * typewriter.js — Hero bio types itself character by character.
 */
import { state } from '../core/state.js'
import { emitter } from '../core/emitter.js'

export function initTypewriter() {
  if (state.get('prefersReducedMotion')) return

  const bio = document.querySelector('.hero-bio')
  if (!bio) return

  const fullText = bio.textContent
  bio.textContent = ''
  bio.style.minHeight = '3em' // prevent layout shift

  // Create cursor
  const cursor = document.createElement('span')
  cursor.className = 'typewriter-cursor'
  bio.appendChild(cursor)

  // Start typing after preloader completes
  emitter.on('preloader:complete', () => {
    let i = 0
    const speed = 25 // ms per character

    function typeChar() {
      if (i < fullText.length) {
        // Insert character before cursor
        const textNode = document.createTextNode(fullText[i])
        bio.insertBefore(textNode, cursor)
        i++
        setTimeout(typeChar, speed + Math.random() * 15)
      } else {
        // Done — remove cursor after a pause
        setTimeout(() => {
          cursor.style.animation = 'none'
          cursor.style.opacity = '0'
          cursor.style.transition = 'opacity 0.5s ease'
          setTimeout(() => cursor.remove(), 600)
        }, 2000)
      }
    }

    // Small delay after preloader
    setTimeout(typeChar, 800)
  })
}
