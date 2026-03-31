/**
 * marquee.js — Dock magnification + tech popups
 */
import { TECH_DATA } from '../data/projects.js'

export function marqueeHover() {
  const popup = document.getElementById('tech-popup')
  const strip = document.querySelector('.marquee-strip')
  if (!strip) return

  const items = strip.querySelectorAll('.marquee-item')
  const MAGNIFY_RANGE = 120  // px radius of magnification effect
  const MAX_SCALE = 1.4
  const MIN_SCALE = 1.0

  // Dock magnification on mousemove
  strip.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX
    items.forEach((item) => {
      const rect = item.getBoundingClientRect()
      const itemCenterX = rect.left + rect.width / 2
      const dist = Math.abs(mouseX - itemCenterX)

      if (dist < MAGNIFY_RANGE) {
        const ratio = 1 - dist / MAGNIFY_RANGE
        const scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * ratio * ratio
        item.style.transform = `scale(${scale})`
        item.style.color = ratio > 0.5 ? 'var(--accent)' : ''
      } else {
        item.style.transform = 'scale(1)'
        item.style.color = ''
      }
    })
  })

  strip.addEventListener('mouseleave', () => {
    items.forEach((item) => {
      item.style.transform = 'scale(1)'
      item.style.color = ''
    })
  })

  // Tech popup on click
  if (!popup) return
  const popupName = popup.querySelector('.tech-popup-name')
  const popupDesc = popup.querySelector('.tech-popup-desc')
  const popupUsage = popup.querySelector('.tech-popup-usage')
  let hideTimeout = null

  items.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      clearTimeout(hideTimeout)
      const key = item.dataset.tech
      const data = TECH_DATA[key]
      if (!data) return

      popupName.textContent = data.name
      popupDesc.textContent = data.desc
      popupUsage.innerHTML = 'Used in: ' + data.projects
        .map((p) => `<span class="tech-popup-project">${p}</span>`)
        .join('')

      const rect = item.getBoundingClientRect()
      const popupW = 320
      let left = rect.left + rect.width / 2 - popupW / 2
      left = Math.max(12, Math.min(left, window.innerWidth - popupW - 12))
      popup.style.left = `${left}px`
      popup.style.bottom = `${window.innerHeight - rect.top + 12}px`
      popup.style.top = 'auto'
      popup.classList.add('visible')
    })

    item.addEventListener('mouseleave', () => {
      hideTimeout = setTimeout(() => popup.classList.remove('visible'), 200)
    })
  })

  popup.addEventListener('mouseenter', () => clearTimeout(hideTimeout))
  popup.addEventListener('mouseleave', () => {
    hideTimeout = setTimeout(() => popup.classList.remove('visible'), 200)
  })
}
