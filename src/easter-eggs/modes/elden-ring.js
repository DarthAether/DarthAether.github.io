/**
 * elden-ring.js — YOU DIED rapid click detector
 */
let clickTimes = []

export function initEldenRing() {
  document.addEventListener('click', () => {
    const now = Date.now()
    clickTimes.push(now)
    if (clickTimes.length > 10) clickTimes.shift()

    if (clickTimes.length === 10) {
      const span = clickTimes[9] - clickTimes[0]
      if (span < 2000) {
        triggerYouDied()
        clickTimes = []
      }
    }
  })
}

function triggerYouDied() {
  if (document.querySelector('.you-died')) return

  const overlay = document.createElement('div')
  overlay.className = 'you-died'
  overlay.innerHTML = '<span>YOU DIED</span>'
  document.body.appendChild(overlay)
  setTimeout(() => overlay.remove(), 4500)

  console.log(
    '%c ELDEN RING %c YOU DIED. But the Tarnished rises again.',
    'background: #dc2626; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
    'color: #dc2626; font-style: italic;'
  )
}
