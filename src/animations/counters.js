/**
 * counters.js — Number counter animation
 * Animates elements from 0 to their data-count value
 * Supports decimals, integers, "+" suffix, and "," thousand separators
 */
import { gsap } from 'gsap'

/**
 * Animate counter elements from 0 to their target value
 * @param {string} selector - CSS selector for counter elements
 * @param {object} opts - Options
 * @param {number} opts.duration - Animation duration (default: 2)
 * @param {number} opts.delay - Animation delay (default: 0)
 * @param {string} opts.ease - GSAP ease (default: 'power2.out')
 */
export function animateCounters(selector, opts = {}) {
  const {
    duration = 2,
    delay = 0,
    ease = 'power2.out',
  } = opts

  const elements = document.querySelectorAll(selector)

  elements.forEach((el) => {
    const raw = el.getAttribute('data-count')
    if (raw === null) return

    const target = parseFloat(raw)
    if (isNaN(target)) return

    // Determine display format
    const isDecimal = target < 10 && raw.includes('.')
    const hasSuffix = el.getAttribute('data-suffix') || ''

    const obj = { val: 0 }

    gsap.to(obj, {
      val: target,
      duration,
      delay,
      ease,
      onUpdate: () => {
        let display

        if (isDecimal) {
          // Decimal values like 0.967 -> show with 3 decimal places
          display = obj.val.toFixed(3)
        } else {
          // Integer values — round and format with commas
          display = formatWithCommas(Math.round(obj.val))
        }

        // Append suffix if present (e.g., "+")
        el.textContent = display + hasSuffix
      },
    })
  })
}

/**
 * Format a number with comma thousand separators
 * @param {number} num
 * @returns {string}
 */
function formatWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
