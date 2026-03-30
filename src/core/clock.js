/**
 * clock.js — IST live clock
 * Displays time in Asia/Kolkata timezone
 * Format: "IST 30 MAR 26  21:32:15"
 */

let intervalId = null
let clockEl = null

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: 'short',
  year: '2-digit',
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

function formatClock() {
  const now = new Date()
  const dateParts = dateFormatter.format(now).toUpperCase() // "30 MAR 26"
  const timeParts = timeFormatter.format(now) // "21:32:15"
  return `IST ${dateParts}  ${timeParts}`
}

function update() {
  if (clockEl) {
    clockEl.textContent = formatClock()
  }
}

/**
 * Initialize the live clock
 * Targets the #clock element in the DOM
 */
export function initClock() {
  clockEl = document.getElementById('clock')
  if (!clockEl) return

  // Immediate update
  update()

  // Update every second
  intervalId = setInterval(update, 1000)
}

/**
 * Stop the clock interval
 */
export function destroyClock() {
  if (intervalId) clearInterval(intervalId)
}
