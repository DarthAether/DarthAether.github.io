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

/* ═══ Reduced motion detection ═══ */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ═══ Lenis smooth scroll ═══ */
let lenis = null
window.__scrollVelocity = 0
if (!prefersReducedMotion) {
  lenis = new Lenis({
    lerp: 0.12,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  })
  lenis.on('scroll', (e) => {
    ScrollTrigger.update()
    window.__scrollVelocity = e.velocity || 0
  })
  gsap.ticker.add((time) => lenis.raf(time * 1000))
}
gsap.ticker.lagSmoothing(500, 33)

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
    '.hero-uni, .hero-name, .hero-role, .hero-availability, .hero-bio, .hero-stats, .hero-scroll'
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
  const DPR = Math.min(window.devicePixelRatio, 2)

  // Fullscreen canvas
  const canvas = document.createElement('canvas')
  canvas.width = W * DPR
  canvas.height = H * DPR
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:10002;pointer-events:none;'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  ctx.scale(DPR, DPR)

  // Explosion origin
  const counterRect = counter.getBoundingClientRect()
  const originX = counterRect.left + counterRect.width / 2
  const originY = counterRect.top + counterRect.height / 2

  // Build convergence targets from hero elements
  const targets = []
  heroEls.forEach((el) => {
    const r = el.getBoundingClientRect()
    const density = Math.max(4, Math.floor(r.width / 25))
    for (let i = 0; i < density; i++) {
      for (let j = 0; j < 2; j++) {
        targets.push({
          x: r.left + (r.width * (i + 0.5)) / density,
          y: r.top + (r.height * (j + 0.5)) / 2,
          el,
        })
      }
    }
  })
  if (navbar) {
    const nr = navbar.getBoundingClientRect()
    for (let i = 0; i < 8; i++) {
      targets.push({ x: nr.left + (nr.width * (i + 0.5)) / 8, y: nr.top + nr.height / 2, el: navbar })
    }
  }

  // ── Particle creation ──
  const COUNT = 400
  const particles = []
  const COLORS = [
    '#818cf8', '#a5b4fc', '#6366f1', '#c4b5fd', '#e0e7ff',
    '#7c3aed', '#ddd6fe', '#4f46e5', '#93c5fd', '#f0abfc',
  ]

  for (let i = 0; i < COUNT; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 10
    const target = targets[i % targets.length]
    const isSpark = Math.random() < 0.15 // 15% are bright sparkle particles

    particles.push({
      x: originX + (Math.random() - 0.5) * 50,
      y: originY + (Math.random() - 0.5) * 25,
      // Previous position for trails
      px: originX,
      py: originY,
      // Velocity
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      // Target
      tx: target.x + (Math.random() - 0.5) * 20,
      ty: target.y + (Math.random() - 0.5) * 15,
      targetEl: target.el,
      // Visual
      size: isSpark ? (0.8 + Math.random() * 1.5) : (1.5 + Math.random() * 4),
      baseSize: 0,
      alpha: 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      isSpark,
      shimmerPhase: Math.random() * Math.PI * 2,
      shimmerSpeed: 0.05 + Math.random() * 0.1,
      // Trail
      trail: [],
      trailMax: isSpark ? 3 : (5 + Math.floor(Math.random() * 8)),
      // Timing
      phase: 'explode',
      explodeFrames: 15 + Math.floor(Math.random() * 20),
      swirlFrames: 0,
      convergeSpeed: 0.02 + Math.random() * 0.035,
      // Swirl
      swirlRadius: 30 + Math.random() * 60,
      swirlSpeed: (Math.random() - 0.5) * 0.12,
      swirlAngle: Math.random() * Math.PI * 2,
      // Bloom
      bloomSize: isSpark ? 0 : (8 + Math.random() * 16),
    })
    particles[i].baseSize = particles[i].size
  }

  // Hide counter with a flash
  gsap.to(counter, { opacity: 0, scale: 2.5, duration: 0.15 })

  const fadedIn = new Set()
  let frame = 0
  const TOTAL_FRAMES = 180 // ~3s at 60fps

  // Preloader bg fade
  gsap.to(preloader, { opacity: 0, duration: 1.2, delay: 0.4, ease: 'power1.out' })

  function animate() {
    // Semi-transparent clear for motion trail effect
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = 'rgba(5, 5, 5, 0.1)'
    ctx.fillRect(0, 0, W, H)

    frame++
    const progress = Math.min(frame / TOTAL_FRAMES, 1)

    // Draw particles with additive blending for bloom
    ctx.globalCompositeOperation = 'lighter'

    for (const p of particles) {
      if (p.alpha <= 0.01) continue

      // Store trail
      p.trail.push({ x: p.x, y: p.y, a: p.alpha })
      if (p.trail.length > p.trailMax) p.trail.shift()

      p.px = p.x
      p.py = p.y

      // ── Phase: Explode ──
      if (p.phase === 'explode') {
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.95
        p.vy *= 0.95
        p.explodeFrames--
        if (p.explodeFrames <= 0) p.phase = 'swirl'
      }
      // ── Phase: Swirl + Converge ──
      else if (p.phase === 'swirl') {
        p.swirlAngle += p.swirlSpeed
        p.swirlFrames++

        const dx = p.tx - p.x
        const dy = p.ty - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        // Ease-in convergence (accelerates as it gets closer to timeline)
        const convergeEase = Math.min(1, p.swirlFrames / 60)
        const spd = p.convergeSpeed * (0.5 + convergeEase * 1.5)

        // Swirl fades out over time
        const swirlFade = Math.max(0, 1 - p.swirlFrames / 50)
        const swirlX = Math.cos(p.swirlAngle) * p.swirlRadius * swirlFade * 0.08
        const swirlY = Math.sin(p.swirlAngle) * p.swirlRadius * swirlFade * 0.08

        p.x += dx * spd + swirlX
        p.y += dy * spd + swirlY

        // Reveal DOM element EARLY while particles are still dense around it
        if (dist < 120 && p.targetEl && !fadedIn.has(p.targetEl)) {
          fadedIn.add(p.targetEl)
          // Start fading in the DOM while particles are still swarming
          gsap.to(p.targetEl, { opacity: 1, duration: 0.8, ease: 'power1.out' })
          // Trigger char stagger when hero-name becomes visible
          if (p.targetEl.classList.contains('hero-name')) revealHeroChars()
        }

        // Particles linger and fade SLOWLY — they glow around the text
        if (dist < 60) {
          const closeness = 1 - dist / 60
          // Very slow fade so particles overlap with visible text
          p.alpha -= 0.008 * (1 + closeness)
          // Shrink gently
          p.size = p.baseSize * (0.5 + 0.5 * (dist / 60))
          // Particles settle and orbit the target briefly
          p.swirlRadius = 10 * (dist / 60)
        }
      }

      // ── Shimmer ──
      p.shimmerPhase += p.shimmerSpeed
      const shimmer = 0.7 + 0.3 * Math.sin(p.shimmerPhase)
      const drawAlpha = Math.min(1, p.alpha * shimmer)

      // ── Draw trail ──
      if (p.trail.length > 1 && !p.isSpark) {
        for (let t = 0; t < p.trail.length - 1; t++) {
          const tp = p.trail[t]
          const trailAlpha = (t / p.trail.length) * drawAlpha * 0.3
          ctx.globalAlpha = trailAlpha
          ctx.fillStyle = p.color
          const trailSize = p.size * (t / p.trail.length) * 0.6
          ctx.beginPath()
          ctx.arc(tp.x, tp.y, Math.max(0.3, trailSize), 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // ── Draw bloom/glow ──
      if (p.bloomSize > 0 && drawAlpha > 0.1) {
        ctx.globalAlpha = drawAlpha * 0.06
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.bloomSize, 0, Math.PI * 2)
        ctx.fill()

        // Inner glow
        ctx.globalAlpha = drawAlpha * 0.12
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.bloomSize * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }

      // ── Draw core particle ──
      ctx.globalAlpha = drawAlpha
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, Math.max(0.3, p.size), 0, Math.PI * 2)
      ctx.fill()

      // Sparkle: bright white center
      if (p.isSpark && drawAlpha > 0.3) {
        ctx.globalAlpha = drawAlpha * 0.9
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Reset composite
    ctx.globalCompositeOperation = 'source-over'

    // Force-reveal remaining elements at 75%
    if (progress > 0.75) {
      heroEls.forEach((el) => {
        if (!fadedIn.has(el)) {
          fadedIn.add(el)
          gsap.to(el, { opacity: 1, duration: 0.5 })
          if (el.classList.contains('hero-name')) revealHeroChars()
        }
      })
      if (navbar && !fadedIn.has(navbar)) {
        fadedIn.add(navbar)
        gsap.to(navbar, { opacity: 1, duration: 0.5 })
      }
    }

    const alive = particles.some((p) => p.alpha > 0.01)
    if (alive && frame < TOTAL_FRAMES) {
      requestAnimationFrame(animate)
    } else {
      // Final cleanup — clear trail residue
      ctx.clearRect(0, 0, W, H)
      heroEls.forEach((el) => { el.style.opacity = '1' })
      if (navbar) navbar.style.opacity = '1'
      // Fade canvas out smoothly
      gsap.to(canvas, {
        opacity: 0,
        duration: 0.4,
        onComplete() {
          canvas.remove()
          preloader.style.display = 'none'
        },
      })
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

  if (!prefersReducedMotion) {
    try { initThreeBackground() } catch (e) { console.warn('Three.js skipped:', e.message) }
  }
  initCursor()
  if (!prefersReducedMotion) initGrain()
  initProjectModal()
  initMagneticButtons()
  initBackToTop()
}

/* ─── Hero reveal ─── */
function heroReveal() {
  // Split text into chars for stagger animation
  document.querySelectorAll('.name-line').forEach((line) => {
    new SplitType(line, { types: 'chars' })
  })

  // Hero stat counters
  animateCounters('.hero-stats .stat-value[data-target]', false)
}

/* ─── Hero char stagger (called after preloader) ─── */
function revealHeroChars() {
  const chars = document.querySelectorAll('.name-line .char')
  if (!chars.length) return

  chars.forEach((char, i) => {
    setTimeout(() => {
      char.style.transition = `opacity 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)`
      char.classList.add('revealed')
    }, 50 + i * 30) // 30ms stagger between each letter
  })
}

/* ─── Navbar ─── */
function navbarBehavior() {
  const navbar = document.getElementById('navbar')
  if (!navbar) return

  // Glass effect + auto-hide navbar
  let lastScrollY = 0
  let navHidden = false

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate(self) {
      const scrollY = self.scroll()

      // Glass effect
      navbar.classList.toggle('scrolled', scrollY > 100)

      // Auto-hide: hide on scroll down, show on scroll up
      if (scrollY > 200) {
        const delta = scrollY - lastScrollY
        if (delta > 5 && !navHidden) {
          navbar.classList.add('nav-hidden')
          navHidden = true
        } else if (delta < -5 && navHidden) {
          navbar.classList.remove('nav-hidden')
          navHidden = false
        }
      } else {
        navbar.classList.remove('nav-hidden')
        navHidden = false
      }

      lastScrollY = scrollY
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
      if (target && lenis) lenis.scrollTo(target, { offset: 0 })
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
      if (target && lenis) lenis.scrollTo(target, { offset: 0 })
      closeMobileMenu()
    })
  })
}

/* ─── Scroll animations (gsap.set + gsap.to pattern — no CSS conflicts) ─── */
function scrollAnimations() {
  // Signature easing — matches CSS --ease-out: cubic-bezier(0.165, 0.84, 0.44, 1)
  const EASE = 'power3.out'

  function revealOnScroll(selector, opts = {}) {
    const els = gsap.utils.toArray(selector)
    if (!els.length) return

    // Line-mask style: use clipPath for text elements, scale+opacity for cards
    const useClip = opts.clip !== false && !opts.x

    els.forEach((el, i) => {
      if (useClip) {
        // Clip-mask reveal: content slides up from behind a clip boundary
        gsap.set(el, {
          y: opts.y ?? 30,
          scale: opts.scale ?? 0.97,
          opacity: 0,
        })
      } else {
        gsap.set(el, {
          y: opts.y ?? 30,
          x: opts.x ?? 0,
          opacity: 0,
        })
      }

      ScrollTrigger.create({
        trigger: el,
        start: opts.start || 'top 88%',
        once: true,
        onEnter() {
          gsap.to(el, {
            y: 0, x: 0, scale: 1, opacity: 1,
            duration: opts.duration || 0.9,
            delay: (opts.stagger || 0) * i,
            ease: opts.ease || EASE,
          })
        },
      })
    })
  }

  // Section titles — overflow-clip reveal (Dennis Snellenberg style)
  document.querySelectorAll('.section-title').forEach((title) => {
    // Wrap inner content in a clip container
    const inner = document.createElement('span')
    inner.className = 'title-reveal-inner'
    inner.innerHTML = title.innerHTML
    title.innerHTML = ''
    title.appendChild(inner)
    title.style.overflow = 'hidden'

    gsap.set(inner, { y: '110%' })

    ScrollTrigger.create({
      trigger: title,
      start: 'top 88%',
      once: true,
      onEnter() {
        gsap.to(inner, {
          y: '0%',
          duration: 0.9,
          ease: 'power4.out',
        })
      },
    })
  })

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

  // Experience card
  revealOnScroll('.experience-card')
  // Research card
  revealOnScroll('.research-card', { stagger: 0.12 })

  // Contact items — slide from left
  revealOnScroll('.contact-item', { x: -20, y: 0, stagger: 0.08 })

  // Contact heading — dramatic scale reveal
  const contactHeading = document.querySelector('.contact-heading')
  if (contactHeading) {
    gsap.set(contactHeading, { opacity: 0, scale: 0.8 })
    ScrollTrigger.create({
      trigger: contactHeading,
      start: 'top 85%',
      once: true,
      onEnter() {
        gsap.to(contactHeading, {
          opacity: 1, scale: 1,
          duration: 0.8, ease: 'power3.out',
        })
      },
    })
  }

  // ── Project card 3D tilt on hover (GPU-composited, rAF-throttled) ──
  document.querySelectorAll('.project-card, .other-card').forEach((card) => {
    let tiltRaf = null
    card.style.willChange = 'transform'
    card.addEventListener('mousemove', (e) => {
      if (tiltRaf) return
      tiltRaf = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        const tiltX = y * -8
        const tiltY = x * 8
        card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(0, -4px, 0)`
        tiltRaf = null
      })
    }, { passive: true })
    card.addEventListener('mouseleave', () => {
      if (tiltRaf) { cancelAnimationFrame(tiltRaf); tiltRaf = null }
      card.style.transition = 'transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)'
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translate3d(0, 0, 0)'
    })
  })

  // ── Parallax on hero background ──
  const heroBg = document.querySelector('.hero-bg')
  if (heroBg) {
    gsap.to(heroBg, {
      y: 100,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
  }

  // ── Stagger section labels with accent dot pulse ──
  document.querySelectorAll('.section-title').forEach((title) => {
    const dot = title.querySelector('::before') // can't select pseudo, but we can animate the title
    ScrollTrigger.create({
      trigger: title,
      start: 'top 85%',
      once: true,
      onEnter() {
        // The dot is a pseudo-element, so animate a scale pulse on the title
        gsap.fromTo(title, { '--dot-scale': 0 }, { '--dot-scale': 1, duration: 0.4, ease: 'back.out(3)' })
      },
    })
  })
}


/* ─── Magnetic hover on buttons ─── */
function initMagneticButtons() {
  if (window.innerWidth < 768 || prefersReducedMotion) return

  document.querySelectorAll('.btn, .contact-cv, .nav-brand').forEach((btn) => {
    const strength = parseFloat(btn.dataset.strength) || 25

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect()
      const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width
      const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height

      gsap.to(btn, {
        x: dx * strength,
        y: dy * strength,
        duration: 0.4,
        ease: 'power3.out',
      })
    }, { passive: true })

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0, y: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)',
      })
    })
  })
}


/* ─── Back to top ─── */
function initBackToTop() {
  const btt = document.querySelector('.back-to-top')
  if (!btt) return
  btt.addEventListener('click', (e) => {
    e.preventDefault()
    if (lenis) lenis.scrollTo('#hero', { offset: 0 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  })
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
  typescript: {
    name: 'TypeScript',
    desc: 'Strongly-typed JavaScript for production applications. Used across the full stack at VTAG Software with Next.js, React, NestJS, and Playwright test suites.',
    projects: ['VTAG Software'],
  },
  react: {
    name: 'React',
    desc: 'Component-based UI library for building interactive dashboards. Broker portal, property management, and lead attribution interfaces at VTAG Software.',
    projects: ['VTAG Software'],
  },
  nextjs: {
    name: 'Next.js',
    desc: 'React meta-framework with SSR and file-based routing. Production frontend for broker dashboards and property management at VTAG Software.',
    projects: ['VTAG Software', 'GridShield AI'],
  },
  nestjs: {
    name: 'NestJS',
    desc: 'Enterprise Node.js framework with dependency injection, decorators, and module system. Backend services for the Senior Living platform at VTAG Software.',
    projects: ['VTAG Software'],
  },
  graphql: {
    name: 'GraphQL',
    desc: 'Query language for APIs with typed schemas. Used with NestJS and Prisma for efficient data fetching across VTAG Software platforms.',
    projects: ['VTAG Software'],
  },
  playwright: {
    name: 'Playwright',
    desc: 'Cross-browser end-to-end testing framework. 695+ tests across 9 projects at VTAG Software covering critical user flows and regression detection.',
    projects: ['VTAG Software'],
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

/* ═══ Scroll progress bar ═══ */
const progressBar = document.getElementById('scroll-progress')
if (progressBar) {
  progressBar.style.transformOrigin = 'left'
  progressBar.style.width = '100%'
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate(self) {
      progressBar.style.transform = `scaleX(${self.progress})`
    },
  })
}

/* ═══ Resize ═══ */
let resizeTimeout = null
window.addEventListener('resize', () => {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => ScrollTrigger.refresh(), 250)
})


/* ═══ EASTER EGGS ═══ */

/* ─── Konami Code: Order 66 ─── */
;(function() {
  const KONAMI = [38,38,40,40,37,39,37,39,66,65] // up up down down left right left right B A
  let konamiIdx = 0
  let sithActive = false

  document.addEventListener('keydown', (e) => {
    if (e.keyCode === KONAMI[konamiIdx]) {
      konamiIdx++
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0
        toggleOrder66()
      }
    } else {
      konamiIdx = 0
    }
  })

  function toggleOrder66() {
    sithActive = !sithActive

    if (sithActive) {
      // Flash "EXECUTE ORDER 66"
      const flash = document.createElement('div')
      flash.className = 'order66-flash'
      flash.innerHTML = '<span>Execute Order 66</span>'
      document.body.appendChild(flash)
      setTimeout(() => flash.remove(), 2600)

      // Activate Sith mode
      setTimeout(() => {
        document.body.classList.add('sith-mode')
        // Tell Three.js to go red
        window.__sithMode = true
      }, 800)

      console.log(
        '%c THE DARK SIDE %c Order 66 executed. The Jedi are no more.',
        'background: #ef4444; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
        'color: #ef4444; font-style: italic;'
      )
    } else {
      document.body.classList.remove('sith-mode')
      window.__sithMode = false
      console.log(
        '%c LIGHT SIDE %c Balance restored to the Force.',
        'background: #818cf8; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
        'color: #818cf8; font-style: italic;'
      )
    }
  }
})()

/* ─── Console ASCII Lightsaber + Yoda Message ─── */
;(function() {
  const saber = [
    '                          ',
    '    ||=================>  ',
    '    ||                    ',
    '  ======                  ',
    '  | __ |                  ',
    '  | || |                  ',
    '  | || |                  ',
    '  |____|                  ',
    '                          ',
  ].join('\n')

  console.log(
    '%c' + saber,
    'color: #818cf8; font-family: monospace; font-size: 14px; line-height: 1.2;'
  )

  console.log(
    '%c A curious developer, you are. %c\n' +
    'The source, strong with you it is.\n' +
    'Seeking allies, I am.\n\n' +
    '%c github.com/DarthAether %c\n' +
    '%c vjkommuri@gmail.com',
    'color: #10b981; font-size: 14px; font-weight: bold;',
    'color: #888; font-size: 12px;',
    'color: #818cf8; font-size: 12px; font-weight: bold; text-decoration: underline;',
    '',
    'color: #818cf8; font-size: 11px;'
  )

  console.log(
    '%c May the Force be with you. Always.',
    'color: #555; font-style: italic; font-size: 11px;'
  )
})()


/* ═══ MORE EASTER EGGS ═══ */

/* ─── Secret word detector ─── */
;(function() {
  let buffer = ''
  const SECRETS = {
    'wish': triggerGenshinWish,
    'hmm': triggerWitcher,
    'creeper': triggerCreeper,
    'hesoyam': triggerGTA,
  }

  document.addEventListener('keydown', (e) => {
    // Ignore if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

    buffer += e.key.toLowerCase()
    // Keep buffer short
    if (buffer.length > 20) buffer = buffer.slice(-20)

    for (const [word, fn] of Object.entries(SECRETS)) {
      if (buffer.endsWith(word)) {
        fn()
        buffer = ''
        break
      }
    }
  })

  // ── Genshin: type "wish" → 5-star gacha pull ──
  function triggerGenshinWish() {
    if (document.querySelector('.genshin-wish')) return

    const overlay = document.createElement('div')
    overlay.className = 'genshin-wish'
    overlay.innerHTML = `
      <div class="star-burst"></div>
      <div class="wish-text">Vijaya Sivanjan Kommuri</div>
      <div class="wish-stars">&#9733; &#9733; &#9733; &#9733; &#9733;</div>
      <div class="wish-subtitle">SSR &middot; AI/ML Researcher &amp; Engineer</div>
    `
    document.body.appendChild(overlay)
    setTimeout(() => overlay.remove(), 4200)

    console.log(
      '%c GENSHIN IMPACT %c Congratulations! You pulled a 5-star character!',
      'background: #fbbf24; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
      'color: #fbbf24;'
    )
  }

  // ── Witcher: type "hmm" → Wind's howling ──
  function triggerWitcher() {
    if (document.querySelector('.witcher-overlay')) return

    const overlay = document.createElement('div')
    overlay.className = 'witcher-overlay'
    overlay.innerHTML = `
      <div class="witcher-text">
        "Wind's howling."
        <span class="witcher-sub">&mdash; Geralt of Rivia</span>
      </div>
    `
    document.body.appendChild(overlay)
    setTimeout(() => overlay.remove(), 3200)

    console.log(
      '%c THE WITCHER %c Hmm. Looks like rain.',
      'background: #888; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
      'color: #888; font-style: italic;'
    )
  }

  // ── Minecraft: type "creeper" → Aww man + screen shake ──
  function triggerCreeper() {
    if (document.querySelector('.creeper-overlay')) return

    const overlay = document.createElement('div')
    overlay.className = 'creeper-overlay'
    overlay.innerHTML = '<span>Aww man...</span>'
    document.body.appendChild(overlay)
    document.body.classList.add('screen-shake')

    setTimeout(() => document.body.classList.remove('screen-shake'), 500)
    setTimeout(() => overlay.remove(), 2200)

    console.log(
      '%c MINECRAFT %c Creeper? Aww man... So we back in the mine.',
      'background: #22c55e; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
      'color: #22c55e;'
    )
  }

  // ── GTA: type "hesoyam" → health bar fills, golden accents ──
  function triggerGTA() {
    if (document.querySelector('.gta-overlay')) return

    const overlay = document.createElement('div')
    overlay.className = 'gta-overlay'
    overlay.innerHTML = `
      <div class="gta-hud">
        <span>CHEAT ACTIVATED</span>
        <div class="gta-bar"><div class="gta-bar-fill"></div></div>
      </div>
    `
    document.body.appendChild(overlay)
    document.body.classList.add('gta-mode')

    setTimeout(() => overlay.remove(), 3500)
    setTimeout(() => document.body.classList.remove('gta-mode'), 10000)

    console.log(
      '%c GTA SAN ANDREAS %c HESOYAM activated. Health, armor, and $250,000.',
      'background: #f59e0b; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
      'color: #f59e0b;'
    )
  }
})()

/* ─── Elden Ring: 10 rapid clicks → YOU DIED ─── */
;(function() {
  let clickTimes = []

  document.addEventListener('click', () => {
    const now = Date.now()
    clickTimes.push(now)
    // Keep only last 10
    if (clickTimes.length > 10) clickTimes.shift()

    // Check if 10 clicks within 2 seconds
    if (clickTimes.length === 10) {
      const span = clickTimes[9] - clickTimes[0]
      if (span < 2000) {
        triggerYouDied()
        clickTimes = []
      }
    }
  })

  function triggerYouDied() {
    if (document.querySelector('.you-died')) return

    const overlay = document.createElement('div')
    overlay.className = 'you-died'
    overlay.innerHTML = '<span>YOU DIED</span>'
    document.body.appendChild(overlay)
    setTimeout(() => overlay.remove(), 4500)

    console.log(
      '%c ELDEN RING %c YOU DIED. But the Tarnished rises again.',
      'background: #dc2626; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
      'color: #dc2626; font-style: italic;'
    )
  }
})()
