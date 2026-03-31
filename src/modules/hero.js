/**
 * hero.js — Hero reveal, char stagger, variable font weight morph, counter animation
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'
import { state } from '../core/state.js'

/* ═══ Counter utility ═══ */
function formatNumber(n, decimals) {
  if (decimals > 0) return n.toFixed(decimals)
  return Math.round(n).toLocaleString('en-US')
}

export function animateCounters(selector, useScrollTrigger = false) {
  const elements = typeof selector === 'string'
    ? document.querySelectorAll(selector)
    : selector

  elements.forEach((el) => {
    const raw = el.dataset.target
    if (raw == null) return
    const target = parseFloat(raw.replace(/,/g, ''))
    const decimals = parseInt(el.dataset.decimals || '0', 10)

    const run = () => {
      const obj = { val: 0 }
      gsap.to(obj, {
        val: target,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = formatNumber(obj.val, decimals) },
      })
    }

    if (useScrollTrigger) {
      ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: run })
    } else {
      run()
    }
  })
}

/* ─── Hero reveal ─── */
export function heroReveal() {
  // Split text into chars for stagger animation
  document.querySelectorAll('.name-line').forEach((line) => {
    new SplitType(line, { types: 'chars' })
  })

  // Hero stat counters
  animateCounters('.hero-stats .stat-value[data-target]', false)
}

/* ─── Hero char slot-machine spin reveal ─── */
export function revealHeroChars() {
  const chars = document.querySelectorAll('.name-line .char')
  if (!chars.length) return

  chars.forEach((char, i) => {
    char.style.opacity = '0'
    char.style.transform = 'rotateY(90deg) translateY(20px)'

    setTimeout(() => {
      char.classList.add('slot-spin')
    }, 40 + i * 40) // 40ms stagger — slot machine cascade
  })
}

/* ─── Variable Font Weight Morph on Scroll ─── */
export function initFontMorph() {
  if (state.get('prefersReducedMotion')) return

  // Inter already supports variable weight (300-900)
  const heroName = document.querySelector('.hero-name')
  if (!heroName) return

  // Morph hero name weight from 800 to 400 as you scroll past hero
  gsap.to(heroName, {
    fontWeight: 400,
    letterSpacing: '0.02em',
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  })

  // Per-character weight stagger on section titles as they scroll through
  document.querySelectorAll('.contact-heading').forEach(heading => {
    gsap.to(heading, {
      fontWeight: 300,
      ease: 'none',
      scrollTrigger: {
        trigger: heading,
        start: 'top 80%',
        end: 'top 20%',
        scrub: true,
      },
    })
  })
}
