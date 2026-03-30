/**
 * main.js v2 — Single orchestrator
 * Preloader, Lenis, hero reveal, navbar, mobile menu, scroll anims, clock, marquee
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import SplitType from 'split-type'

import { initThreeBackground } from './three-bg.js'
import { initCursor } from './cursor.js'
import { initGrain } from './grain.js'
import { initProjectModal } from './projects.js'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════
   Lenis smooth scroll
   ═══════════════════════════════════════════ */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
})

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

/* ═══════════════════════════════════════════
   Preloader
   ═══════════════════════════════════════════ */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader')
  const counter = document.getElementById('preloader-count')
  const fill = document.getElementById('preloader-fill')

  if (!preloader) {
    initAnimations()
    return
  }

  const obj = { val: 0 }

  gsap.to(obj, {
    val: 100,
    duration: 1.2,
    ease: 'power2.inOut',
    onUpdate() {
      if (counter) counter.textContent = Math.round(obj.val)
    },
  })

  gsap.to(fill, {
    width: '100%',
    duration: 1.2,
    ease: 'power2.inOut',
    onComplete() {
      gsap.to(preloader, {
        opacity: 0,
        duration: 0.4,
        onComplete() {
          preloader.style.display = 'none'
          initAnimations()
        },
      })
    },
  })
})

/* ═══════════════════════════════════════════
   Counter animation utility
   ═══════════════════════════════════════════ */
function formatNumber(n, decimals) {
  if (decimals > 0) return n.toFixed(decimals)
  const rounded = Math.round(n)
  return rounded.toLocaleString('en-US')
}

function animateCounters(elements, useScrollTrigger = false) {
  elements.forEach((el) => {
    const rawTarget = el.dataset.target
    if (rawTarget == null) return

    const cleanTarget = rawTarget.replace(/,/g, '')
    const target = parseFloat(cleanTarget)
    const decimals = parseInt(el.dataset.decimals || '0', 10)

    const doAnimate = () => {
      const obj = { val: 0 }
      gsap.to(obj, {
        val: target,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate() {
          el.textContent = formatNumber(obj.val, decimals)
        },
      })
    }

    if (useScrollTrigger) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: doAnimate,
      })
    } else {
      doAnimate()
    }
  })
}

/* ═══════════════════════════════════════════
   initAnimations — called after preloader
   ═══════════════════════════════════════════ */
function initAnimations() {
  heroReveal()
  navbarBehavior()
  mobileMenu()
  scrollAnimations()
  startClock()
  marqueeHover()

  initThreeBackground()
  initCursor()
  initGrain()
  initProjectModal()
}

/* ─── Hero reveal ─── */
function heroReveal() {
  const nameLines = document.querySelectorAll('.name-line')
  nameLines.forEach((line) => {
    const split = new SplitType(line, { types: 'chars' })
    gsap.from(split.chars, {
      y: 40,
      opacity: 0,
      stagger: 0.02,
      duration: 0.5,
      ease: 'power3.out',
    })
  })

  const fadeEls = document.querySelectorAll(
    '.hero-uni, .hero-role, .hero-bio, .hero-stats, .hero-scroll'
  )
  gsap.from(fadeEls, {
    y: 30,
    opacity: 0,
    stagger: 0.1,
    duration: 0.4,
    delay: 0.3,
    ease: 'power2.out',
  })

  // Hero stat counters (immediate, no scroll trigger)
  const heroCounters = document.querySelectorAll('.hero-stats .stat-value[data-target]')
  animateCounters(heroCounters, false)
}

/* ─── Navbar scroll behavior ─── */
function navbarBehavior() {
  const navbar = document.getElementById('navbar')
  if (!navbar) return

  // Scrolled class
  ScrollTrigger.create({
    start: 100,
    onUpdate(self) {
      if (self.scroll() > 100) {
        navbar.classList.add('scrolled')
      } else {
        navbar.classList.remove('scrolled')
      }
    },
  })

  // Active section tracking
  const sections = document.querySelectorAll('section[id]')
  sections.forEach((section) => {
    const id = section.getAttribute('id')
    const link = document.querySelector(`.nav-link[href="#${id}"]`)
    if (!link) return

    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => setActiveLink(link),
      onEnterBack: () => setActiveLink(link),
    })
  })

  function setActiveLink(activeLink) {
    document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'))
    activeLink.classList.add('active')
  }

  // Nav link click → smooth scroll
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const target = link.getAttribute('href')
      if (target) lenis.scrollTo(target, { offset: 0 })
      closeMobileMenu()
    })
  })
}

/* ─── Mobile menu ─── */
function closeMobileMenu() {
  const toggle = document.querySelector('.nav-toggle')
  const menu = document.getElementById('mobile-menu')
  if (!toggle || !menu) return
  toggle.classList.remove('open')
  menu.classList.remove('open')
  gsap.to(menu.querySelectorAll('.mobile-link'), {
    opacity: 0,
    duration: 0.2,
  })
}

function mobileMenu() {
  const toggle = document.querySelector('.nav-toggle')
  const menu = document.getElementById('mobile-menu')
  if (!toggle || !menu) return

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.contains('open')
    if (isOpen) {
      closeMobileMenu()
    } else {
      toggle.classList.add('open')
      menu.classList.add('open')
      gsap.from(menu.querySelectorAll('.mobile-link'), {
        y: 30,
        opacity: 0,
        stagger: 0.05,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  })

  document.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const target = link.getAttribute('href')
      if (target) lenis.scrollTo(target, { offset: 0 })
      closeMobileMenu()
    })
  })
}

/* ─── Scroll animations ─── */
function scrollAnimations() {
  // Reusable fadeUp
  function fadeUp(selector, opts = {}) {
    const els = document.querySelectorAll(selector)
    if (!els.length) return
    gsap.from(els, {
      y: 40,
      opacity: 0,
      duration: opts.duration || 0.5,
      stagger: opts.stagger || 0,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: opts.trigger || els[0],
        start: opts.start || 'top 85%',
        once: true,
      },
    })
  }

  // Section titles
  document.querySelectorAll('.section-title').forEach((el) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    })
  })

  // Project cards
  const projectCards = document.querySelectorAll('.project-card')
  if (projectCards.length) {
    gsap.from(projectCards, {
      y: 40,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: projectCards[0], start: 'top 85%', once: true },
    })
  }

  // Other cards
  const otherCards = document.querySelectorAll('.other-card')
  if (otherCards.length) {
    gsap.from(otherCards, {
      y: 40,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: otherCards[0], start: 'top 85%', once: true },
    })
  }

  // About section
  fadeUp('.about-name')
  const aboutTexts = document.querySelectorAll('.about-text p')
  if (aboutTexts.length) {
    gsap.from(aboutTexts, {
      y: 40,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: aboutTexts[0], start: 'top 85%', once: true },
    })
  }

  // Skill fills
  document.querySelectorAll('.skill-fill[data-width]').forEach((el) => {
    gsap.to(el, {
      width: `${el.dataset.width}%`,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
  })

  // Research cards
  const researchCards = document.querySelectorAll('.research-card')
  if (researchCards.length) {
    gsap.from(researchCards, {
      y: 40,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: researchCards[0], start: 'top 85%', once: true },
    })
  }

  // Contact items — slide from left
  const contactItems = document.querySelectorAll('.contact-item')
  if (contactItems.length) {
    gsap.from(contactItems, {
      x: -20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: contactItems[0], start: 'top 85%', once: true },
    })
  }

  // Edu items
  const eduItems = document.querySelectorAll('.edu-item')
  if (eduItems.length) {
    gsap.from(eduItems, {
      y: 40,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: eduItems[0], start: 'top 85%', once: true },
    })
  }
}

/* ─── Clock (IST) ─── */
function startClock() {
  const clockEl = document.getElementById('clock')
  if (!clockEl) return

  function update() {
    const now = new Date()
    // IST = UTC + 5:30
    const utc = now.getTime() + now.getTimezoneOffset() * 60000
    const ist = new Date(utc + 5.5 * 3600000)

    const day = String(ist.getDate()).padStart(2, '0')
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    const month = months[ist.getMonth()]
    const year = String(ist.getFullYear()).slice(-2)
    const hours = String(ist.getHours()).padStart(2, '0')
    const mins = String(ist.getMinutes()).padStart(2, '0')

    clockEl.textContent = `IST ${day} ${month} ${year} \u00B7 ${hours}:${mins}`
  }

  update()
  setInterval(update, 1000)
}

/* ─── Marquee hover ─── */
function marqueeHover() {
  document.querySelectorAll('.marquee-strip').forEach((strip) => {
    strip.addEventListener('mouseenter', () => {
      strip.style.animationDuration = '60s'
    })
    strip.addEventListener('mouseleave', () => {
      strip.style.animationDuration = '20s'
    })
  })
}
