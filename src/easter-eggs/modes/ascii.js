/**
 * ascii.js — ASCII mode: scanlines, green particles, monospace override
 */
import { state } from '../../core/state.js'

let active = false
let scanlines = null

export function toggleAscii() {
  active = !active

  if (active) {
    document.body.classList.add('ascii-mode')
    state.set('particleColor', 0x00ff41)

    scanlines = document.createElement('div')
    scanlines.className = 'ascii-scanlines'
    document.body.appendChild(scanlines)

    console.log(
      '%c ASCII MODE %c > TERMINAL INTERFACE ACTIVATED\n> ALL SYSTEMS NOMINAL\n> RENDERING IN TEXT MODE',
      'background: #00ff41; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
      'color: #00ff41; font-family: monospace;'
    )
  } else {
    document.body.classList.remove('ascii-mode')
    state.set('particleColor', 0x818cf8)
    if (scanlines) { scanlines.remove(); scanlines = null }
  }
}
