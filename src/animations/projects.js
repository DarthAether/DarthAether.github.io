/**
 * projects.js — Featured project animations
 * ScrollTrigger-driven reveals for project showcases and rows
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'
import { animateCounters } from './counters.js'

gsap.registerPlugin(ScrollTrigger)

const triggers = []

/**
 * Initialize project section animations
 */
export function initProjectAnimations() {
  projectShowcases()
  projectRows()
}

/**
 * Full-screen project showcases with pinning (for .project-showcase elements)
 * Each showcase pins and reveals its content sequentially
 */
function projectShowcases() {
  const showcases = document.querySelectorAll('.project-showcase')
  if (!showcases.length) return

  showcases.forEach((showcase) => {
    const num = showcase.querySelector('.project-number')
    const name = showcase.querySelector('.project-name')
    const desc = showcase.querySelector('.project-desc')
    const metrics = showcase.querySelectorAll('.project-metric-value')
    const tags = showcase.querySelectorAll('.project-tag')
    const arch = showcase.querySelector('.architecture-text, .project-arch')
    const color = showcase.getAttribute('data-color')

    // Create pin trigger
    const pinTrigger = ScrollTrigger.create({
      trigger: showcase,
      start: 'top top',
      end: '+=150%',
      pin: true,
      pinSpacing: true,
    })
    triggers.push(pinTrigger)

    // Content reveal timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: showcase,
        start: 'top 60%',
        toggleActions: 'play none none none',
      },
    })

    // 1. Project number slides in from left
    if (num) {
      gsap.set(num, { x: -60, opacity: 0 })
      tl.to(num, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
    }

    // 2. Name reveals char by char
    if (name) {
      const split = new SplitType(name, { types: 'chars', tagName: 'span' })
      gsap.set(split.chars, { y: '100%', opacity: 0 })
      tl.to(split.chars, {
        y: '0%',
        opacity: 1,
        duration: 0.8,
        stagger: 0.03,
        ease: 'power4.out',
      }, '-=0.3')
    }

    // 3. Description fades up
    if (desc) {
      gsap.set(desc, { y: 20, opacity: 0 })
      tl.to(desc, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.4')
    }

    // 4. Metrics counter animate
    if (metrics.length) {
      metrics.forEach((m) => gsap.set(m, { opacity: 0 }))
      tl.to(metrics, { opacity: 1, duration: 0.3 }, '-=0.2')
      tl.call(() => {
        animateCounters('.project-showcase [data-count]', { duration: 1.5 })
      })
    }

    // 5. Tags stagger in
    if (tags.length) {
      gsap.set(tags, { y: 10, opacity: 0 })
      tl.to(tags, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
      }, '-=0.3')
    }

    // 6. Architecture text typewriter effect
    if (arch) {
      typewriterEffect(arch, tl)
    }

    // 7. Color shift when project enters viewport
    if (color) {
      ScrollTrigger.create({
        trigger: showcase,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => {
          document.body.style.setProperty('--accent-color', color)
        },
        onLeaveBack: () => {
          document.body.style.setProperty('--accent-color', '#6366f1')
        },
      })
    }
  })
}

/**
 * Project rows — slide up reveal on scroll
 * These are the list-style project entries in the current HTML
 */
function projectRows() {
  const rows = document.querySelectorAll('.project-row')
  if (!rows.length) return

  rows.forEach((row, i) => {
    const num = row.querySelector('.project-number')
    const name = row.querySelector('.project-name')
    const desc = row.querySelector('.project-desc')
    const tags = row.querySelectorAll('.project-tag')
    const arrow = row.querySelector('.project-arrow')
    const color = row.getAttribute('data-color')

    gsap.set(row, { y: 30, opacity: 0 })

    const trigger = ScrollTrigger.create({
      trigger: row,
      start: 'top 88%',
      onEnter: () => {
        // Main row reveal
        gsap.to(row, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: i * 0.08,
          ease: 'power3.out',
        })

        // Stagger tags within this row
        if (tags.length) {
          gsap.fromTo(tags, {
            y: 8,
            opacity: 0,
          }, {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            delay: i * 0.08 + 0.3,
            ease: 'power2.out',
          })
        }
      },
    })

    triggers.push(trigger)

    // Color shift on hover for project rows
    if (color) {
      row.addEventListener('mouseenter', () => {
        document.body.style.setProperty('--accent-color', color)
      })
      row.addEventListener('mouseleave', () => {
        document.body.style.setProperty('--accent-color', '#6366f1')
      })
    }
  })
}

/**
 * Typewriter effect for architecture text
 * @param {HTMLElement} el - Element containing text to typewrite
 * @param {gsap.core.Timeline} tl - Parent timeline to add to
 */
function typewriterEffect(el, tl) {
  const fullText = el.textContent
  el.textContent = ''
  el.style.visibility = 'visible'

  const proxy = { length: 0 }

  tl.to(proxy, {
    length: fullText.length,
    duration: fullText.length * 0.03,
    ease: 'none',
    onUpdate: () => {
      el.textContent = fullText.slice(0, Math.round(proxy.length))
    },
  }, '-=0.2')
}

/**
 * Clean up all project-related triggers
 */
export function destroyProjectAnimations() {
  triggers.forEach((t) => t.kill())
  triggers.length = 0
}
