/**
 * triggers.js — Unified keyboard buffer, single keydown listener.
 * Maps trigger words to dynamic imports. Konami code. Shift-hold X-ray. Elden Ring rapid clicks.
 */
import { state } from '../core/state.js'
import { toggleOrder66 } from './modes/sith.js'
import { initEldenRing } from './modes/elden-ring.js'
import { initXray } from './modes/xray.js'

let buffer = ''

// Konami Code: up up down down left right left right B A
const KONAMI = [38,38,40,40,37,39,37,39,66,65]
let konamiIdx = 0

// Word triggers → dynamic imports (lazy-loaded modes)
const WORD_TRIGGERS = {
  'wish': () => import('./modes/genshin.js').then(m => m.triggerGenshinWish()),
  'hmm': () => import('./modes/witcher.js').then(m => m.triggerWitcher()),
  'creeper': () => import('./modes/minecraft.js').then(m => m.triggerCreeper()),
  'hesoyam': () => import('./modes/gta.js').then(m => m.triggerGTA()),
  'pokemon': () => import('./modes/pokemon.js').then(m => m.spawnPokemon()),
  'megaevolve': () => import('./modes/pokemon.js').then(m => m.megaEvolve()),
  'kitty': () => import('./modes/kitty.js').then(m => m.toggleKitty()),
  'ascii': () => import('./modes/ascii.js').then(m => m.toggleAscii()),
}

export function initTriggers() {
  // Single keydown listener for both Konami and word triggers
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

    // Konami code check
    if (e.keyCode === KONAMI[konamiIdx]) {
      konamiIdx++
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0
        toggleOrder66()
      }
    } else {
      konamiIdx = 0
    }

    // Word buffer check
    buffer += e.key.toLowerCase()
    if (buffer.length > 20) buffer = buffer.slice(-20)

    for (const [word, fn] of Object.entries(WORD_TRIGGERS)) {
      if (buffer.endsWith(word)) {
        fn()
        buffer = ''
        break
      }
    }
  })

  // Initialize eager modes (they use click/keyboard shortcuts, not word triggers)
  initEldenRing()
  initXray()
}
