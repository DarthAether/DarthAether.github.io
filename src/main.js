/**
 * main.js v2.1 — Single orchestrator (all bugs fixed)
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

/* ═══ Lenis smooth scroll ═══ */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
})

lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

/* ═══ Preloader with line-burst transition ═══ */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader')
  const counter = document.getElementById('preloader-count')
  const fill = document.getElementById('preloader-fill')

  if (!preloader) { initAll(); return }

  const obj = { val: 0 }
  gsap.to(obj, {
    val: 100,
    duration: 1.2,
    ease: 'power2.inOut',
    onUpdate: () => { if (counter) counter.textContent = Math.round(obj.val) },
  })

  gsap.to(fill, {
    width: '100%',
    duration: 1.2,
    ease: 'power2.inOut',
    onComplete: () => lineBurstTransition(preloader, counter),
  })
})

function lineBurstTransition(preloader, counter) {
  // Scale up counter number
  const tl = gsap.timeline()

  tl.to(counter, {
    scale: 3,
    opacity: 0,
    duration: 0.4,
    ease: 'power2.in',
  })

  // Create burst lines from center
  const lineCount = 8
  const lines = []
  for (let i = 0; i < lineCount; i++) {
    const line = document.createElement('div')
    line.className = 'preloader-line'
    const angle = (i / lineCount) * 360
    const rad = (angle * Math.PI) / 180
    line.style.top = '50%'
    line.style.width = '0px'
    line.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`
    preloader.appendChild(line)
    lines.push({ el: line, angle, rad })
  }

  // Animate lines bursting outward
  tl.to(lines.map((l) => l.el), {
    opacity: 1,
    width: '200vw',
    duration: 0.5,
    stagger: 0.03,
    ease: 'power3.out',
  }, '-=0.1')

  // Fade preloader out as lines reach edges
  tl.to(preloader, {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.out',
    onComplete() {
      preloader.style.display = 'none'
      lines.forEach((l) => l.el.remove())
      initAll()
    },
  }, '-=0.2')
}

/* ═══ Counter utility ═══ */
function formatNumber(n, decimals) {
  if (decimals > 0) return n.toFixed(decimals)
  return Math.round(n).toLocaleString('en-US')
}

function animateCounters(selector, useScrollTrigger = false) {
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

/* ═══ Init everything after preloader ═══ */
function initAll() {
  heroReveal()
  navbarBehavior()
  mobileMenu()
  scrollAnimations()
  startClock()
  marqueeHover()

  try { initThreeBackground() } catch (e) { console.warn('Three.js skipped:', e.message) }
  initCursor()
  initGrain()
  initProjectModal()
}

/* ─── Hero reveal ─── */
function heroReveal() {
  // Split name into chars and animate
  document.querySelectorAll('.name-line').forEach((line) => {
    const split = new SplitType(line, { types: 'chars' })
    if (split.chars && split.chars.length) {
      gsap.set(split.chars, { y: 40, opacity: 0 })
      gsap.to(split.chars, {
        y: 0, opacity: 1,
        stagger: 0.02, duration: 0.5, ease: 'power3.out',
      })
    }
  })

  // Fade up supporting hero elements
  const fadeEls = gsap.utils.toArray('.hero-uni, .hero-role, .hero-bio, .hero-stats, .hero-scroll')
  if (fadeEls.length) {
    gsap.set(fadeEls, { y: 30, opacity: 0 })
    gsap.to(fadeEls, {
      y: 0, opacity: 1,
      stagger: 0.1, duration: 0.4, delay: 0.3, ease: 'power2.out',
    })
  }

  // Hero stat counters
  animateCounters('.hero-stats .stat-value[data-target]', false)
}

/* ─── Navbar ─── */
function navbarBehavior() {
  const navbar = document.getElementById('navbar')
  if (!navbar) return

  // Glass effect on scroll
  ScrollTrigger.create({
    start: 100,
    onUpdate(self) {
      navbar.classList.toggle('scrolled', self.scroll() > 100)
    },
  })

  // Active section tracking
  document.querySelectorAll('section[id]').forEach((section) => {
    const id = section.id
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

  // Smooth scroll on click
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
  // Reset link visibility for next open
  gsap.set(menu.querySelectorAll('.mobile-link'), { opacity: 0, y: 30 })
}

function mobileMenu() {
  const toggle = document.querySelector('.nav-toggle')
  const menu = document.getElementById('mobile-menu')
  if (!toggle || !menu) return

  // Set initial hidden state for links
  gsap.set(menu.querySelectorAll('.mobile-link'), { opacity: 0, y: 30 })

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.contains('open')
    if (isOpen) {
      closeMobileMenu()
    } else {
      toggle.classList.add('open')
      menu.classList.add('open')
      gsap.to(menu.querySelectorAll('.mobile-link'), {
        y: 0, opacity: 1,
        stagger: 0.05, duration: 0.3, ease: 'power2.out',
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

/* ─── Scroll animations (gsap.set + gsap.to pattern — no CSS conflicts) ─── */
function scrollAnimations() {
  function revealOnScroll(selector, opts = {}) {
    const els = gsap.utils.toArray(selector)
    if (!els.length) return

    gsap.set(els, {
      y: opts.y ?? 40,
      x: opts.x ?? 0,
      opacity: 0,
    })

    els.forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el,
        start: opts.start || 'top 88%',
        once: true,
        onEnter() {
          gsap.to(el, {
            y: 0, x: 0, opacity: 1,
            duration: opts.duration || 0.5,
            delay: (opts.stagger || 0) * i,
            ease: opts.ease || 'power2.out',
          })
        },
      })
    })
  }

  // Section titles
  revealOnScroll('.section-title')

  // Project cards
  revealOnScroll('.project-card', { stagger: 0.1 })

  // Other cards
  revealOnScroll('.other-card', { stagger: 0.1 })

  // About
  revealOnScroll('.about-name')
  revealOnScroll('.about-text p', { stagger: 0.1 })
  revealOnScroll('.edu-item', { stagger: 0.1 })

  // Skill fills (animate width, not position)
  document.querySelectorAll('.skill-fill[data-width]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter() {
        gsap.to(el, { width: `${el.dataset.width}%`, duration: 1, ease: 'power2.out' })
      },
    })
  })

  // Skill rows (fade in the labels)
  revealOnScroll('.skill-row', { y: 20, stagger: 0.08 })

  // Research card
  revealOnScroll('.research-card')

  // Contact items — slide from left
  revealOnScroll('.contact-item', { x: -20, y: 0, stagger: 0.08 })
}

/* ─── Clock (IST with seconds) ─── */
function startClock() {
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

/* ─── Tech stack data ─── */
const TECH_DATA = {
  xgboost: {
    name: 'XGBoost',
    desc: 'Gradient boosted decision trees for tabular outage prediction. Primary model in the GridShield ensemble achieving 0.967 AUC-ROC with temporal cross-validation.',
    projects: ['GridShield AI', 'Credit Risk XAI'],
  },
  lightgbm: {
    name: 'LightGBM',
    desc: 'Histogram-based gradient boosting for fast training on 138 engineered features. Second model in the stacking ensemble with leaf-wise growth strategy.',
    projects: ['GridShield AI'],
  },
  pytorch: {
    name: 'PyTorch',
    desc: 'LSTM with multi-head self-attention for sequential weather patterns. MC Dropout for uncertainty quantification in the temporal model branch.',
    projects: ['GridShield AI', 'ThreatSight'],
  },
  fastapi: {
    name: 'FastAPI',
    desc: 'Async REST API backbone for all 3 enterprise systems. JWT/RBAC auth, WebSocket streaming, Pydantic schemas, dependency injection, and OpenAPI docs.',
    projects: ['GridShield AI', 'ThreatSight', 'IoTGuard'],
  },
  threejs: {
    name: 'Three.js',
    desc: 'WebGL particle constellation in the portfolio hero. 1000 particles with proximity-based connections and mouse-reactive rotation.',
    projects: ['This Portfolio'],
  },
  gsap: {
    name: 'GSAP',
    desc: 'ScrollTrigger-driven animations throughout this portfolio. Text reveals, section fades, counter animations, and smooth scroll integration with Lenis.',
    projects: ['This Portfolio'],
  },
  docker: {
    name: 'Docker',
    desc: 'Multi-stage builds with non-root users and healthchecks. Docker Compose orchestrating API + PostgreSQL + Redis + Prometheus + Grafana stacks.',
    projects: ['GridShield AI', 'ThreatSight', 'IoTGuard'],
  },
  postgresql: {
    name: 'PostgreSQL',
    desc: 'Primary database for all systems. TimescaleDB hypertables for time-series in GridShield. Async SQLAlchemy with Alembic migrations across all projects.',
    projects: ['GridShield AI', 'ThreatSight', 'IoTGuard'],
  },
  redis: {
    name: 'Redis',
    desc: 'Caching layer for API responses, pub/sub for real-time WebSocket broadcasting, rate limiting, and alert deduplication across all 3 platforms.',
    projects: ['GridShield AI', 'ThreatSight', 'IoTGuard'],
  },
  prometheus: {
    name: 'Prometheus',
    desc: '11 custom metrics in ThreatSight: detection latency, FPS, alerts fired, active cameras. Pre-built Grafana dashboards for all 3 systems.',
    projects: ['GridShield AI', 'ThreatSight', 'IoTGuard'],
  },
  shap: {
    name: 'SHAP',
    desc: 'SHapley Additive exPlanations for model interpretability. Feature importance analysis on 138 features in GridShield and credit risk predictions.',
    projects: ['GridShield AI', 'Credit Risk XAI'],
  },
  onnx: {
    name: 'ONNX Runtime',
    desc: 'YOLOv5 model export to ONNX for 2-5x faster CPU inference in ThreatSight. Runtime-selectable backend: native PyTorch vs ONNX via configuration.',
    projects: ['ThreatSight'],
  },
}

/* ─── Marquee: dock magnification + tech popups ─── */
function marqueeHover() {
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

/* ═══ Resize ═══ */
let resizeTimeout = null
window.addEventListener('resize', () => {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => ScrollTrigger.refresh(), 250)
})
