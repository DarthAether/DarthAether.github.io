/**
 * clock.js — IST clock with seconds
 */

export function startClock() {
  const el = document.getElementById('clock')
  if (!el) return

  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

  function tick() {
    const now = new Date()
    const utc = now.getTime() + now.getTimezoneOffset() * 60000
    const ist = new Date(utc + 5.5 * 3600000)

    const d = String(ist.getDate()).padStart(2, '0')
    const m = months[ist.getMonth()]
    const y = String(ist.getFullYear()).slice(-2)
    const h = String(ist.getHours()).padStart(2, '0')
    const mi = String(ist.getMinutes()).padStart(2, '0')
    const s = String(ist.getSeconds()).padStart(2, '0')

    el.textContent = `IST ${d} ${m} ${y} \u00B7 ${h}:${mi}:${s}`
  }

  tick()
  setInterval(tick, 1000)
}
