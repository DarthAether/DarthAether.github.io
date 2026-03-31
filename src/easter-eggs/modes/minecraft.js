/**
 * minecraft.js — Creeper screen shake
 */
export function triggerCreeper() {
  if (document.querySelector('.creeper-overlay')) return

  const overlay = document.createElement('div')
  overlay.className = 'creeper-overlay'
  overlay.innerHTML = '<span>Aww man...</span>'
  document.body.appendChild(overlay)
  document.body.classList.add('screen-shake')

  setTimeout(() => document.body.classList.remove('screen-shake'), 500)
  setTimeout(() => overlay.remove(), 2200)

  console.log(
    '%c MINECRAFT %c Creeper? Aww man... So we back in the mine.',
    'background: #22c55e; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
    'color: #22c55e;'
  )
}
