/**
 * gta.js — HESOYAM mode. Health bar HUD, golden accents, 10s timeout.
 */
export function triggerGTA() {
  if (document.querySelector('.gta-overlay')) return

  const overlay = document.createElement('div')
  overlay.className = 'gta-overlay'
  overlay.innerHTML = `
    <div class="gta-hud">
      <span>CHEAT ACTIVATED</span>
      <div class="gta-bar"><div class="gta-bar-fill"></div></div>
    </div>
  `
  document.body.appendChild(overlay)
  document.body.classList.add('gta-mode')

  setTimeout(() => overlay.remove(), 3500)
  setTimeout(() => document.body.classList.remove('gta-mode'), 10000)

  console.log(
    '%c GTA SAN ANDREAS %c HESOYAM activated. Health, armor, and $250,000.',
    'background: #f59e0b; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
    'color: #f59e0b;'
  )
}
