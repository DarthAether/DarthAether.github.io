/**
 * marquee.js — Tech marquee control
 * Hover to slow, individual item scale + glow on hover
 */
import { gsap } from 'gsap'

const DEFAULT_DURATION = 30 // seconds — matches CSS animation
const SLOW_DURATION = 150  // 20% speed = 5x duration

/**
 * Initialize marquee hover interactions
 */
export function initMarquee() {
  const section = document.querySelector('.section-marquee')
  if (!section) return

  const track = section.querySelector('.marquee-track')
  if (!track) return

  // Section hover — slow down the entire marquee
  section.addEventListener('mouseenter', () => {
    gsap.to(track, {
      animationDuration: `${SLOW_DURATION}s`,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: function () {
        // GSAP can't tween animationDuration directly,
        // so we use a proxy approach
      },
    })
    // Direct style manipulation for CSS animation-duration
    slowMarquee(track, true)
  })

  section.addEventListener('mouseleave', () => {
    slowMarquee(track, false)
    // Remove glow from all items
    const items = track.querySelectorAll('.marquee-item')
    items.forEach((item) => {
      item.classList.remove('marquee-glow')
      gsap.to(item, { scale: 1, duration: 0.3, ease: 'power2.out' })
    })
  })

  // Individual item hover — scale + glow
  const items = track.querySelectorAll('.marquee-item')
  items.forEach((item) => {
    item.style.display = 'inline-block'
    item.style.cursor = 'default'
    item.style.transition = 'color 0.3s, text-shadow 0.3s'

    item.addEventListener('mouseenter', () => {
      gsap.to(item, {
        scale: 1.2,
        duration: 0.3,
        ease: 'power2.out',
      })
      item.classList.add('marquee-glow')
    })

    item.addEventListener('mouseleave', () => {
      gsap.to(item, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
      item.classList.remove('marquee-glow')
    })
  })

  // Inject glow styles if not already present
  injectGlowStyles()
}

/**
 * Smoothly transition marquee speed
 */
function slowMarquee(track, slow) {
  const target = slow ? SLOW_DURATION : DEFAULT_DURATION

  // We need to smoothly transition the animation-duration
  // Get current computed duration
  const current = parseFloat(getComputedStyle(track).animationDuration) || DEFAULT_DURATION

  const proxy = { duration: current }

  gsap.to(proxy, {
    duration: slow ? 0.8 : 0.5,
    ease: 'power2.out',
    onUpdate: () => {
      track.style.animationDuration = `${proxy.duration}s`
    },
  })

  // Set the final value
  gsap.set(proxy, { duration: target })
  gsap.to(proxy, {
    duration: target,
    ease: 'power2.out',
    onUpdate: () => {
      track.style.animationDuration = `${proxy.duration}s`
    },
  })
}

/**
 * Inject CSS for marquee glow effect
 */
function injectGlowStyles() {
  if (document.getElementById('marquee-glow-styles')) return

  const style = document.createElement('style')
  style.id = 'marquee-glow-styles'
  style.textContent = `
    .marquee-glow {
      color: var(--accent-color, #6366f1) !important;
      text-shadow: 0 0 20px rgba(99, 102, 241, 0.4),
                   0 0 40px rgba(99, 102, 241, 0.2);
    }
  `
  document.head.appendChild(style)
}
