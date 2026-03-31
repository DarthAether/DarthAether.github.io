/**
 * sith.js — Order 66 / Sith mode
 */
import { state } from '../../core/state.js'

let sithActive = false

export function toggleOrder66() {
  sithActive = !sithActive

  if (sithActive) {
    // Flash "EXECUTE ORDER 66"
    const flash = document.createElement('div')
    flash.className = 'order66-flash'
    flash.innerHTML = '<span>Execute Order 66</span>'
    document.body.appendChild(flash)
    setTimeout(() => flash.remove(), 2600)

    // Activate Sith mode
    setTimeout(() => {
      document.body.classList.add('sith-mode')
      state.set('sithMode', true)
    }, 800)

    console.log(
      '%c THE DARK SIDE %c Order 66 executed. The Jedi are no more.',
      'background: #ef4444; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
      'color: #ef4444; font-style: italic;'
    )
  } else {
    document.body.classList.remove('sith-mode')
    state.set('sithMode', false)
    console.log(
      '%c LIGHT SIDE %c Balance restored to the Force.',
      'background: #818cf8; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
      'color: #818cf8; font-style: italic;'
    )
  }
}
