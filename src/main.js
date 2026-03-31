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

/* ═══ Preloader: seamless particle-to-page transition ═══
 *
 * 3 phases, one continuous flow:
 * Phase 1 (0-1.2s): Counter 0→100 with progress bar
 * Phase 2 (1.2-1.5s): "100" explodes into 200 purple particles that scatter
 * Phase 3 (1.5-3.0s): Particles swirl, converge toward hero text positions,
 *   and as they arrive, the actual DOM elements fade in — particles dissolve
 *   INTO the page. Seamless. No cut.
 */

window.addEventListener('load', () => {
  // Render homepage immediately but keep it invisible
  initAll()

  // Hide all hero content — particles will "become" them
  const heroEls = document.querySelectorAll(
    '.hero-uni, .hero-name, .hero-role, .hero-bio, .hero-stats, .hero-scroll'
  )
  heroEls.forEach((el) => { el.style.opacity = '0' })

  // Also hide navbar initially
  const navbar = document.getElementById('navbar')
  if (navbar) navbar.style.opacity = '0'

  const preloader = document.getElementById('preloader')
  const counter = document.getElementById('preloader-count')
  const fill = document.getElementById('preloader-fill')
  const bar = document.getElementById('preloader-bar')

  if (!preloader) {
    heroEls.forEach((el) => { el.style.opacity = '1' })
    if (navbar) navbar.style.opacity = '1'
    return
  }

  // Phase 1: Count to 100
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
    onComplete: () => seamlessParticleTransition(preloader, counter, bar, heroEls, navbar),
  })
})

function seamlessParticleTransition(preloader, counter, bar, heroEls, navbar) {
  if (bar) gsap.to(bar, { opacity: 0, duration: 0.15 })

  const W = window.innerWidth
  const H = window.innerHeight

  // Create fullscreen canvas
  const canvas = document.createElement('canvas')
  canvas.width = W * window.devicePixelRatio
  canvas.height = H * window.devicePixelRatio
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:10002;pointer-events:none;'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  // Counter position (explosion origin)
  const counterRect = counter.getBoundingClientRect()
  const originX = counterRect.left + counterRect.width / 2
  const originY = counterRect.top + counterRect.height / 2

  // Target positions: where hero elements are on the page
  const targets = []
  heroEls.forEach((el) => {
    const r = el.getBoundingClientRect()
    // Create multiple target points spread across each element
    const pts = Math.max(3, Math.floor(r.width / 40))
    for (let i = 0; i < pts; i++) {
      targets.push({
        x: r.left + (r.width * (i + 0.5)) / pts,
        y: r.top + r.height / 2,
        el,
      })
    }
  })

  // Also add targets for navbar
  if (navbar) {
    const nr = navbar.getBoundingClientRect()
    for (let i = 0; i < 5; i++) {
      targets.push({
        x: nr.left + (nr.width * (i + 0.5)) / 5,
        y: nr.top + nr.height / 2,
        el: navbar,
      })
    }
  }

  // Create particles
  const COUNT = 200
  const particles = []
  const COLORS = ['#818cf8', '#a5b4fc', '#6366f1', '#c4b5fd', '#e0e7ff', '#7c3aed']

  for (let i = 0; i < COUNT; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 3 + Math.random() * 8
    const target = targets[i % targets.length]

    particles.push({
      // Current position (starts at counter)
      x: originX + (Math.random() - 0.5) * 60,
      y: originY + (Math.random() - 0.5) * 30,
      // Velocity (explosion outward)
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      // Target position (where on the page to converge)
      tx: target.x + (Math.random() - 0.5) * 30,
      ty: target.y + (Math.random() - 0.5) * 20,
      targetEl: target.el,
      // Visual
      size: 1.5 + Math.random() * 3.5,
      alpha: 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      // Timing
      phase: 'explode', // explode → swirl → converge → done
      explodeFrames: 20 + Math.floor(Math.random() * 15), // how long to fly outward
      swirlFrames: 0,
      convergeSpeed: 0.03 + Math.random() * 0.04,
      // Swirl params
      swirlRadius: 20 + Math.random() * 40,
      swirlSpeed: (Math.random() - 0.5) * 0.15,
      swirlAngle: Math.random() * Math.PI * 2,
    })
  }

  // Hide counter
  gsap.to(counter, { opacity: 0, scale: 2, duration: 0.2 })

  // Track which elements have been faded in
  const fadedIn = new Set()
  let frame = 0
  const TOTAL_FRAMES = 150 // ~2.5s at 60fps

  // Fade preloader bg during phase 2-3
  gsap.to(preloader, {
    opacity: 0,
    duration: 1.0,
    delay: 0.3,
    ease: 'power1.out',
  })

  function animate() {
    ctx.clearRect(0, 0, W, H)
    frame++

    const progress = Math.min(frame / TOTAL_FRAMES, 1) // 0→1 over animation

    for (const p of particles) {
      if (p.alpha <= 0) continue

      if (p.phase === 'explode') {
        // Phase 2: fly outward
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.96
        p.vy *= 0.96
        p.explodeFrames--
        if (p.explodeFrames <= 0) p.phase = 'swirl'

      } else if (p.phase === 'swirl') {
        // Brief swirl before converging
        p.swirlAngle += p.swirlSpeed
        p.swirlFrames++

        // Start converging toward target
        const dx = p.tx - p.x
        const dy = p.ty - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        // Add circular swirl motion
        const swirlFade = Math.max(0, 1 - p.swirlFrames / 40)
        p.x += dx * p.convergeSpeed + Math.cos(p.swirlAngle) * p.swirlRadius * swirlFade * 0.1
        p.y += dy * p.convergeSpeed + Math.sin(p.swirlAngle) * p.swirlRadius * swirlFade * 0.1

        // When close to target, start fading and reveal the element
        if (dist < 30) {
          p.alpha -= 0.04
          p.size *= 0.97

          // Fade in the target DOM element
          if (p.targetEl && !fadedIn.has(p.targetEl)) {
            fadedIn.add(p.targetEl)
            gsap.to(p.targetEl, {
              opacity: 1,
              duration: 0.5,
              ease: 'power2.out',
            })
          }
        }
      }

      // Draw particle
      if (p.alpha > 0) {
        ctx.globalAlpha = Math.min(p.alpha, 1)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2)
        ctx.fill()

        // Glow effect for larger particles
        if (p.size > 2.5) {
          ctx.globalAlpha = p.alpha * 0.15
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // Force-reveal any remaining elements after 80% progress
    if (progress > 0.8) {
      heroEls.forEach((el) => {
        if (!fadedIn.has(el)) {
          fadedIn.add(el)
          gsap.to(el, { opacity: 1, duration: 0.4 })
        }
      })
      if (navbar && !fadedIn.has(navbar)) {
        fadedIn.add(navbar)
        gsap.to(navbar, { opacity: 1, duration: 0.4 })
      }
    }

    // Continue or cleanup
    const alive = particles.some((p) => p.alpha > 0)
    if (alive && frame < TOTAL_FRAMES) {
      requestAnimationFrame(animate)
    } else {
      // Ensure everything is visible
      heroEls.forEach((el) => { el.style.opacity = '1' })
      if (navbar) navbar.style.opacity = '1'
      canvas.remove()
      preloader.style.display = 'none'
    }
  }

  requestAnimationFrame(animate)
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
  // Don't animate hero elements here — the particle transition handles
  // fading them in seamlessly. Just split text for styling and start counters.
  document.querySelectorAll('.name-line').forEach((line) => {
    new SplitType(line, { types: 'chars' })
  })

  // Hero stat counters (start immediately — they'll be visible when particles converge)
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
