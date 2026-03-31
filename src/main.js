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
    'pokemon': () => {
      if (window.__pokemonSpawn) window.__pokemonSpawn()
    },
    'megaevolve': () => {
      if (window.__pokemonMega) window.__pokemonMega()
    },
    'kitty': () => {
      if (window.__kittyToggle) window.__kittyToggle()
    },
    'ascii': () => {
      if (window.__asciiToggle) window.__asciiToggle()
    },
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


/* ═══ LEGENDARY FEATURES ═══ */

/* ─── 1. Scroll-Velocity Text Distortion ─── */
;(function() {
  if (prefersReducedMotion) return

  document.body.classList.add('scroll-distort')
  let smoothVel = 0

  function updateDistortion() {
    const vel = window.__scrollVelocity || 0
    smoothVel += (vel - smoothVel) * 0.12

    const absVel = Math.min(Math.abs(smoothVel), 15)

    // Distortion only kicks in at velocity > 2
    if (absVel > 2) {
      const blur = (absVel - 2) * 0.15 // max ~2px blur
      const skew = smoothVel * 0.08     // skew in scroll direction
      const scaleY = 1 + absVel * 0.003 // subtle vertical stretch

      document.body.style.setProperty('--distort-blur', blur.toFixed(2) + 'px')
      document.body.style.setProperty('--distort-skew', skew.toFixed(2) + 'deg')
      document.body.style.setProperty('--distort-scaleY', scaleY.toFixed(4))
    } else {
      document.body.style.setProperty('--distort-blur', '0px')
      document.body.style.setProperty('--distort-skew', '0deg')
      document.body.style.setProperty('--distort-scaleY', '1')
    }

    requestAnimationFrame(updateDistortion)
  }
  requestAnimationFrame(updateDistortion)
})()

/* ─── 2. Mic-Reactive Audio Visualization ─── */
;(function() {
  const btn = document.getElementById('mic-toggle')
  if (!btn || prefersReducedMotion) {
    if (btn) btn.style.display = 'none'
    return
  }

  let audioCtx = null
  let analyser = null
  let dataArray = null
  let micStream = null
  let active = false
  let rafId = null

  btn.addEventListener('click', async () => {
    if (!active) {
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        const source = audioCtx.createMediaStreamSource(micStream)
        analyser = audioCtx.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        dataArray = new Uint8Array(analyser.frequencyBinCount)

        active = true
        btn.classList.add('active')
        pumpAudio()

        console.log(
          '%c AUDIO MODE %c Particles are now reacting to your microphone.',
          'background: #818cf8; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
          'color: #818cf8;'
        )
      } catch (e) {
        console.warn('Mic access denied:', e.message)
      }
    } else {
      stopAudio()
    }
  })

  function pumpAudio() {
    if (!active || !analyser) return
    analyser.getByteFrequencyData(dataArray)

    const len = dataArray.length
    // Split into 3 bands
    let bass = 0, mid = 0, high = 0
    const bassEnd = Math.floor(len * 0.15)
    const midEnd = Math.floor(len * 0.5)

    for (let i = 0; i < bassEnd; i++) bass += dataArray[i]
    for (let i = bassEnd; i < midEnd; i++) mid += dataArray[i]
    for (let i = midEnd; i < len; i++) high += dataArray[i]

    bass = bass / bassEnd / 255
    mid = mid / (midEnd - bassEnd) / 255
    high = high / (len - midEnd) / 255

    // Expose to Three.js
    window.__audioBass = bass
    window.__audioMid = mid
    window.__audioHigh = high

    rafId = requestAnimationFrame(pumpAudio)
  }

  function stopAudio() {
    active = false
    btn.classList.remove('active')
    if (rafId) cancelAnimationFrame(rafId)
    if (micStream) micStream.getTracks().forEach(t => t.stop())
    if (audioCtx) audioCtx.close()
    window.__audioBass = 0
    window.__audioMid = 0
    window.__audioHigh = 0
    audioCtx = null
    analyser = null
    micStream = null
  }
})()

/* ─── 3. Section-Based Particle Color Shifting ─── */
;(function() {
  if (prefersReducedMotion) return

  const sectionColors = {
    'hero': 0x818cf8,      // indigo
    'projects': 0x6366f1,  // deeper indigo
    'other-work': 0x7c3aed,// violet
    'about': 0x818cf8,     // indigo
    'experience': 0x06b6d4,// cyan
    'research': 0xa855f7,  // purple
    'contact': 0x818cf8,   // indigo
  }

  document.querySelectorAll('section[id]').forEach((section) => {
    const color = sectionColors[section.id]
    if (!color) return

    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => { window.__particleTargetColor = color },
      onEnterBack: () => { window.__particleTargetColor = color },
    })
  })
})()

/* ─── 4. Gyroscope Parallax (mobile) ─── */
;(function() {
  if (window.innerWidth >= 768) return // desktop has cursor parallax

  // Show prompt
  const prompt = document.createElement('div')
  prompt.className = 'gyro-prompt'
  prompt.textContent = 'Tilt device to explore'
  document.body.appendChild(prompt)
  setTimeout(() => prompt.remove(), 8000)

  function initGyro() {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma === null) return
      // gamma: left/right tilt (-90 to 90)
      // beta: front/back tilt (-180 to 180)
      window.__gyroX = (e.gamma || 0) / 90  // -1 to 1
      window.__gyroY = ((e.beta || 0) - 45) / 90  // centered around 45deg (holding phone)
    }, { passive: true })
  }

  // iOS requires permission request
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    // Will be triggered by first touch
    document.addEventListener('touchstart', function onTouch() {
      DeviceOrientationEvent.requestPermission().then(state => {
        if (state === 'granted') initGyro()
      }).catch(() => {})
      document.removeEventListener('touchstart', onTouch)
    }, { once: true })
  } else {
    initGyro()
  }
})()


/* ═══ POKEMON EASTER EGG ═══ */
;(function() {
  // Pokemon data: emoji + name + mega form emoji
  const SPRITE_BASE = 'https://play.pokemonshowdown.com/sprites/ani/'
  const POKEMON = [
    { name: 'Pikachu', sprite: 'pikachu', mega: 'pikachu-gmax' },
    { name: 'Charizard', sprite: 'charizard', mega: 'charizard-megax' },
    { name: 'Blastoise', sprite: 'blastoise', mega: 'blastoise-mega' },
    { name: 'Venusaur', sprite: 'venusaur', mega: 'venusaur-mega' },
    { name: 'Gengar', sprite: 'gengar', mega: 'gengar-mega' },
    { name: 'Mewtwo', sprite: 'mewtwo', mega: 'mewtwo-megay' },
    { name: 'Lucario', sprite: 'lucario', mega: 'lucario-mega' },
    { name: 'Gardevoir', sprite: 'gardevoir', mega: 'gardevoir-mega' },
    { name: 'Rayquaza', sprite: 'rayquaza', mega: 'rayquaza-mega' },
    { name: 'Garchomp', sprite: 'garchomp', mega: 'garchomp-mega' },
    { name: 'Gyarados', sprite: 'gyarados', mega: 'gyarados-mega' },
    { name: 'Absol', sprite: 'absol', mega: 'absol-mega' },
  ]

  let pokemonActive = false
  let megaEvolved = false
  let sprites = []

  // Register triggers — integrated into existing SECRETS buffer
  // (added 'pokemon' and 'megaevolve' to the main secret word system below)

  function getRandomSpawnPosition() {
    // Spawn within the visible viewport — edges with padding
    const pad = 100
    return {
      x: pad + Math.random() * (window.innerWidth - pad * 2 - 80),
      y: pad + Math.random() * (window.innerHeight - pad * 2 - 80),
    }
  }

  window.__pokemonSpawn = spawnPokemon
  window.__pokemonMega = megaEvolve

  function spawnPokemon() {
    pokemonActive = true
    document.body.classList.add('pokemon-mode')

    // Spawn particles go yellow
    window.__particleTargetColor = 0xfbbf24

    // Spawn 6 random Pokemon with stagger
    const selected = []
    // Always include Pikachu first
    selected.push(POKEMON[0])
    const others = POKEMON.slice(1).sort(() => Math.random() - 0.5).slice(0, 5)
    selected.push(...others)

    selected.forEach((poke, i) => {
      setTimeout(() => {
        const pos = getRandomSpawnPosition()
        const container = document.createElement('div')
        container.className = 'pokemon-container'
        container.style.left = pos.x + 'px'
        container.style.top = pos.y + 'px'

        const img = document.createElement('img')
        img.className = 'pokemon-sprite bounce'
        img.src = SPRITE_BASE + poke.sprite + '.gif'
        img.alt = poke.name
        img.draggable = false
        img.dataset.name = poke.name
        img.dataset.megaSrc = SPRITE_BASE + poke.mega + '.gif'

        const label = document.createElement('span')
        label.className = 'pokemon-label'
        label.textContent = poke.name

        container.appendChild(img)
        container.appendChild(label)
        document.body.appendChild(container)
        sprites.push({ container, img, label, poke })

        // After bounce, start floating
        setTimeout(() => {
          img.classList.remove('bounce')
          img.classList.add('idle')
        }, 600)

        // Start wandering
        wanderPokemon(container, img)
      }, i * 300)
    })

    // Preload sprites
    selected.forEach(p => {
      const preload = new Image()
      preload.src = SPRITE_BASE + p.sprite + '.gif'
    })

    console.log(
      '%c POKEMON %c Wild Pokemon appeared! Type "megaevolve" to trigger Mega Evolution!',
      'background: #fbbf24; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
      'color: #fbbf24;'
    )
  }

  // Interactive elements Pokemon can target
  const TARGETS_SELECTOR = '.btn, .contact-cv, .nav-brand, .nav-link, .project-card, .other-card, .research-card, .experience-card, .contact-item, .stat, .card-tags span, .exp-tags span, .back-to-top, .hero-availability, .research-badge'

  function getVisibleTargets() {
    const els = document.querySelectorAll(TARGETS_SELECTOR)
    const visible = []
    els.forEach(el => {
      const rect = el.getBoundingClientRect()
      // Only targets currently in viewport
      if (rect.top > -50 && rect.bottom < window.innerHeight + 50 &&
          rect.left > -50 && rect.right < window.innerWidth + 50 &&
          rect.width > 10 && rect.height > 10) {
        visible.push({ el, rect })
      }
    })
    return visible
  }

  function wanderPokemon(container, img) {
    if (!pokemonActive) return

    const behaviors = ['findTarget', 'randomWalk', 'findTarget', 'findTarget', 'jump']
    let behaviorIdx = 0

    function nextBehavior() {
      if (!document.body.contains(container) || !pokemonActive) return

      const behavior = behaviors[behaviorIdx % behaviors.length]
      behaviorIdx++

      switch (behavior) {
        case 'findTarget': goToTarget(); break
        case 'randomWalk': randomWalk(); break
        case 'jump': doJump(); break
      }
    }

    // ── Walk to a random interactive element ──
    function goToTarget() {
      const targets = getVisibleTargets()
      if (targets.length === 0) { randomWalk(); return }

      const target = targets[Math.floor(Math.random() * targets.length)]
      const rect = target.rect
      // Position on top of the element (sit on it)
      const destX = rect.left + rect.width / 2 - 40
      const destY = rect.top - 20 // walk to just above the element edge

      // Show "!" notice
      showNotice(container)

      // Brief pause, then walk
      setTimeout(() => {
        walkTo(container, img, destX, destY, () => {
          // Arrived at target — interact with it
          interactWithTarget(container, img, target.el, () => {
            // After interaction, wait then do next thing
            setTimeout(nextBehavior, 1500 + Math.random() * 2000)
          })
        })
      }, 600)
    }

    // ── Random walk to a viewport position ──
    function randomWalk() {
      const pos = getRandomSpawnPosition()
      walkTo(container, img, pos.x, pos.y, () => {
        img.classList.remove('walking')
        img.classList.add('sitting')
        setTimeout(() => {
          img.classList.remove('sitting')
          img.classList.add('idle')
          setTimeout(nextBehavior, 1000 + Math.random() * 2000)
        }, 2000 + Math.random() * 3000)
      })
    }

    // ── Jump in place ──
    function doJump() {
      img.classList.remove('idle', 'sitting', 'walking')
      img.classList.add('jumping')
      setTimeout(() => {
        img.classList.remove('jumping')
        img.classList.add('idle')
        setTimeout(nextBehavior, 800 + Math.random() * 1500)
      }, 500)
    }

    // Start after a delay
    setTimeout(nextBehavior, 1500 + Math.random() * 2000)
  }

  // ── Walk animation: move from current pos to destination ──
  function walkTo(container, img, destX, destY, onArrive) {
    const startX = parseFloat(container.style.left) || 0
    const startY = parseFloat(container.style.top) || 0
    const dx = destX - startX
    const dy = destY - startY
    const dist = Math.sqrt(dx * dx + dy * dy)

    // Face direction
    if (dx < 0) {
      img.style.transform = 'scaleX(-1)'
    } else {
      img.style.transform = 'scaleX(1)'
    }

    img.classList.remove('idle', 'sitting', 'jumping')
    img.classList.add('walking')

    // Speed: ~120px/sec
    const duration = Math.max(800, dist / 0.12)

    container.style.transition = 'left ' + duration + 'ms ease-in-out, top ' + duration + 'ms ease-in-out'
    container.style.left = destX + 'px'
    container.style.top = destY + 'px'

    setTimeout(() => {
      if (!document.body.contains(container)) return
      img.classList.remove('walking')
      img.style.transform = ''
      container.style.transition = ''
      if (onArrive) onArrive()
    }, duration)
  }

  // ── Interact with a target element ──
  function interactWithTarget(container, img, targetEl, onDone) {
    const rect = targetEl.getBoundingClientRect()

    // Jump and LAND on the element
    img.classList.remove('idle', 'walking', 'sitting')
    img.classList.add('landing')

    // Position ON TOP of the element (on its surface)
    container.style.transition = 'left 0.2s ease-out, top 0.2s ease-out'
    container.style.left = (rect.left + rect.width / 2 - 40) + 'px'
    container.style.top = (rect.top - 40) + 'px'

    // Element squishes on impact
    setTimeout(() => {
      targetEl.classList.add('pokemon-squish')
      targetEl.classList.add('pokemon-target-glow')
      targetEl.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    }, 200)

    // After landing, start trampolining on the element
    setTimeout(() => {
      img.classList.remove('landing')
      targetEl.classList.remove('pokemon-squish')

      // Trampoline bounce 2-4 times
      const bounceCount = 2 + Math.floor(Math.random() * 3)
      img.classList.add('trampolining')

      // Each bounce squishes the element
      let bouncesDone = 0
      const bounceInterval = setInterval(() => {
        targetEl.classList.remove('pokemon-squish')
        void targetEl.offsetWidth // force reflow
        targetEl.classList.add('pokemon-squish')
        bouncesDone++
        if (bouncesDone >= bounceCount) {
          clearInterval(bounceInterval)
        }
      }, 600)

      // After bouncing, hop off
      setTimeout(() => {
        img.classList.remove('trampolining')
        img.classList.add('jumping')
        targetEl.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))

        // Jump to a nearby position
        const jumpX = rect.left + rect.width + 20 + Math.random() * 60
        const jumpY = rect.top - 20 - Math.random() * 40
        container.style.transition = 'left 0.4s var(--ease-out), top 0.4s var(--ease-out)'
        container.style.left = jumpX + 'px'
        container.style.top = jumpY + 'px'

        setTimeout(() => {
          targetEl.classList.remove('pokemon-target-glow', 'pokemon-squish')
          img.classList.remove('jumping')
          img.classList.add('idle')
          container.style.transition = ''
          if (onDone) onDone()
        }, 500)
      }, bounceCount * 600 + 400)
    }, 400)
  }

  // ── Show "!" notice above Pokemon ──
  function showNotice(container) {
    const existing = container.querySelector('.pokemon-notice')
    if (existing) existing.remove()

    const notice = document.createElement('span')
    notice.className = 'pokemon-notice'
    notice.textContent = '!'
    container.appendChild(notice)
    setTimeout(() => notice.remove(), 900)
  }

  function megaEvolve() {
    megaEvolved = true

    // Flash overlay
    const flash = document.createElement('div')
    flash.className = 'mega-flash'
    flash.innerHTML = '<div class="mega-flash-inner"></div>'
    document.body.appendChild(flash)

    // Text
    const text = document.createElement('div')
    text.className = 'mega-text'
    text.innerHTML = '<span class="mega-line1">Mega Evolution!</span><span class="mega-line2">Beyond Evolution</span>'
    document.body.appendChild(text)

    // Particles go purple/gold
    window.__particleTargetColor = 0xa855f7

    // Transform all sprites after the flash peak
    setTimeout(() => {
      sprites.forEach((s, i) => {
        setTimeout(() => {
          // Swap to mega form sprite
          s.img.src = s.img.dataset.megaSrc
          s.img.classList.remove('idle', 'walking')
          s.img.classList.add('bounce', 'mega')
          s.label.textContent = 'Mega ' + s.poke.name

          setTimeout(() => {
            s.img.classList.remove('bounce')
            s.img.classList.add('idle')
          }, 600)
        }, i * 200)
      })
    }, 800)

    // Cleanup overlays
    setTimeout(() => flash.remove(), 2200)
    setTimeout(() => text.remove(), 2800)

    console.log(
      '%c MEGA EVOLUTION %c The power of Mega Evolution surges through the battlefield!',
      'background: linear-gradient(90deg, #fbbf24, #a855f7); color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
      'color: #a855f7;'
    )
  }
})()


/* ═══ MEW — CURSOR COMPANION ═══ */
;(function() {
  let mew = null
  let mewX = 0, mewY = 0
  let mouseX = 0, mouseY = 0
  let angle = 0
  let sparkleTimer = 0
  let active = false

  // Listen for Pokemon mode activation
  const origSpawn = window.__pokemonSpawn
  window.__pokemonSpawn = function() {
    if (origSpawn) origSpawn()
    if (!active) spawnMew()
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
  }, { passive: true })

  function spawnMew() {
    if (window.innerWidth < 768) return
    active = true

    mew = document.createElement('img')
    mew.className = 'mew-companion'
    mew.src = 'https://play.pokemonshowdown.com/sprites/ani/mew.gif'
    mew.alt = 'Mew'
    mew.draggable = false
    document.body.appendChild(mew)

    mewX = mouseX + 60
    mewY = mouseY - 30
    mew.style.left = mewX + 'px'
    mew.style.top = mewY + 'px'

    orbitLoop()

    console.log(
      '%c MEW %c A wild Mew appeared near your cursor! It seems curious...',
      'background: #a855f7; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
      'color: #a855f7; font-style: italic;'
    )
  }

  function orbitLoop() {
    if (!active || !mew) return

    angle += 0.02
    sparkleTimer++

    // Orbit around cursor with a trailing, figure-8-ish path
    const orbitRadius = 50 + Math.sin(angle * 0.7) * 20
    const targetX = mouseX + Math.cos(angle) * orbitRadius
    const targetY = mouseY + Math.sin(angle * 1.3) * (orbitRadius * 0.6) - 20

    // Smooth follow with lag (creates trailing effect)
    mewX += (targetX - mewX) * 0.06
    mewY += (targetY - mewY) * 0.06

    mew.style.left = mewX + 'px'
    mew.style.top = mewY + 'px'

    // Flip based on movement direction
    const movingLeft = targetX < mewX
    mew.style.transform = movingLeft
      ? 'translate(-50%, -50%) scaleX(-1)'
      : 'translate(-50%, -50%) scaleX(1)'

    // Sparkle trail every 8 frames
    if (sparkleTimer % 8 === 0) {
      spawnSparkle(mewX, mewY)
    }

    requestAnimationFrame(orbitLoop)
  }

  function spawnSparkle(x, y) {
    const s = document.createElement('div')
    s.className = 'mew-sparkle'
    s.style.left = (x + (Math.random() - 0.5) * 20) + 'px'
    s.style.top = (y + (Math.random() - 0.5) * 20) + 'px'
    // Random sparkle color
    const colors = ['#c4b5fd', '#a5b4fc', '#e0e7ff', '#ddd6fe', '#818cf8']
    s.style.background = colors[Math.floor(Math.random() * colors.length)]
    s.style.width = (2 + Math.random() * 4) + 'px'
    s.style.height = s.style.width
    document.body.appendChild(s)
    setTimeout(() => s.remove(), 800)
  }
})()


/* ═══════════════════════════════════════════════════
   KITTY MODE — FULL SITE CAT OVERHAUL
   ═══════════════════════════════════════════════════ */
;(function() {
  let active = false
  let rainInterval = null
  let factInterval = null
  let navCat = null
  let originalTitles = new Map()
  let footerCatEl = null

  const CAT_EMOJIS = ['\u{1F431}', '\u{1F408}', '\u{1F63B}', '\u{1F63A}', '\u{1F639}', '\u{1F638}', '\u{1F640}', '\u{1F408}\u200D\u2B1B', '\u{1F43E}', '\u{1F3E0}']

  const CAT_PUNS = {
    'Featured Projects': 'Fur-tured Paw-jects',
    'Other Work': 'Other Purr-k',
    'About': 'A-meow-t',
    'Experience': 'Ex-purr-ience',
    'Research & Publications': 'Re-scratch & Paw-blications',
  }

  const CAT_FACTS = [
    'Cats sleep for 70% of their lives.',
    'A group of cats is called a "clowder."',
    'Cats have over 20 vocalizations, including the purr.',
    'A cat can rotate its ears 180 degrees.',
    'Cats can jump up to 6 times their length.',
    'A cat has 230 bones — more than a human.',
    'Cats spend 30-50% of their day grooming.',
    'The oldest known cat lived to be 38 years old.',
    'Cats can run at speeds up to 30 mph.',
    'A cat cannot taste sweetness.',
    'Nikola Tesla was inspired to study electricity by his cat.',
    'Ancient Egyptians would shave their eyebrows in mourning when their cats died.',
    'Cats have a specialized collarbone that allows them to always land on their feet.',
    'A house cat shares 95.6% of its genome with tigers.',
  ]

  window.__kittyToggle = function() {
    if (active) deactivate()
    else activate()
  }

  function activate() {
    active = true

    // Flash overlay
    const flash = document.createElement('div')
    flash.className = 'kitty-flash'
    flash.innerHTML = '<span class="kitty-flash-emoji">\u{1F431}</span><span class="kitty-flash-text">Kitty Mode Activated</span>'
    document.body.appendChild(flash)
    setTimeout(() => flash.remove(), 2700)

    // Apply theme
    setTimeout(() => {
      document.body.classList.add('kitty-mode')

      // Particles go orange
      window.__particleTargetColor = 0xf97316

      // Rename section titles with cat puns
      document.querySelectorAll('.section-title').forEach(title => {
        const inner = title.querySelector('.title-reveal-inner')
        const textEl = inner || title
        const originalText = textEl.textContent.trim()
        originalTitles.set(title, originalText)

        for (const [orig, pun] of Object.entries(CAT_PUNS)) {
          if (originalText.includes(orig) || originalText.replace(/[^a-zA-Z ]/g, '').trim() === orig.replace(/[^a-zA-Z ]/g, '').trim()) {
            // Keep the dot pseudo-element, just change text
            if (inner) {
              // Preserve the ::before dot by wrapping text
              inner.childNodes.forEach(node => {
                if (node.nodeType === 3) node.textContent = node.textContent.replace(orig, pun)
              })
              // If it didn't work (no text node), try innerHTML
              if (!inner.textContent.includes(pun)) {
                inner.textContent = pun
              }
            } else {
              title.textContent = pun
            }
            break
          }
        }
      })

      // Start cat emoji rain
      rainInterval = setInterval(spawnCatRain, 800)

      // Walking cat on navbar
      navCat = document.createElement('div')
      navCat.className = 'navbar-cat'
      navCat.textContent = '\u{1F408}'
      document.body.appendChild(navCat)

      // Cat facts every 8 seconds
      showCatFact()
      factInterval = setInterval(showCatFact, 8000)

      // Sleeping cat in footer
      const footer = document.getElementById('footer')
      if (footer) {
        const firstSpan = footer.querySelector('span')
        if (firstSpan) {
          footerCatEl = document.createElement('span')
          footerCatEl.className = 'footer-cat'
          footerCatEl.textContent = '\u{1F63A}'
          firstSpan.prepend(footerCatEl)
        }
      }

      // Contact heading pun
      const contactH = document.querySelector('.contact-heading')
      if (contactH) {
        originalTitles.set(contactH, contactH.textContent)
        contactH.textContent = "Let's paw-nnect."
      }

      // Hero bio cat version
      const heroBio = document.querySelector('.hero-bio')
      if (heroBio) {
        originalTitles.set(heroBio, heroBio.textContent)
        heroBio.textContent = 'Building ML systems for power grid resilience, IoT security, and financial risk. Also building blanket forts for cats. Compound weather event modeling. Calibrated purr-tainty.'
      }

    }, 900)

    console.log(
      '%c \u{1F431} KITTY MODE %c Meow! The entire site has been cat-ified. Type "kitty" again to restore.',
      'background: #f97316; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
      'color: #f97316;'
    )
  }

  function deactivate() {
    active = false
    document.body.classList.remove('kitty-mode')

    // Restore particles
    window.__particleTargetColor = 0x818cf8

    // Stop rain
    if (rainInterval) { clearInterval(rainInterval); rainInterval = null }
    document.querySelectorAll('.cat-rain').forEach(el => el.remove())

    // Remove navbar cat
    if (navCat) { navCat.remove(); navCat = null }

    // Stop facts
    if (factInterval) { clearInterval(factInterval); factInterval = null }
    document.querySelectorAll('.cat-fact').forEach(el => el.remove())

    // Remove footer cat
    if (footerCatEl) { footerCatEl.remove(); footerCatEl = null }

    // Restore original titles
    originalTitles.forEach((text, el) => {
      const inner = el.querySelector('.title-reveal-inner')
      if (inner) inner.textContent = text
      else el.textContent = text
    })
    originalTitles.clear()

    console.log(
      '%c NORMAL MODE %c The cats have been put away. For now.',
      'background: #818cf8; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
      'color: #818cf8;'
    )
  }

  function spawnCatRain() {
    if (!active) return
    const emoji = CAT_EMOJIS[Math.floor(Math.random() * CAT_EMOJIS.length)]
    const el = document.createElement('div')
    el.className = 'cat-rain'
    el.textContent = emoji
    el.style.left = Math.random() * window.innerWidth + 'px'
    el.style.animationDuration = (3 + Math.random() * 4) + 's'
    el.style.fontSize = (14 + Math.random() * 16) + 'px'
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 7500)
  }

  let lastFactIdx = -1
  function showCatFact() {
    if (!active) return
    document.querySelectorAll('.cat-fact').forEach(el => el.remove())

    let idx
    do { idx = Math.floor(Math.random() * CAT_FACTS.length) } while (idx === lastFactIdx)
    lastFactIdx = idx

    const el = document.createElement('div')
    el.className = 'cat-fact'
    el.innerHTML = '<span class="cat-fact-prefix">\u{1F43E} Cat Fact</span>' + CAT_FACTS[idx]
    document.body.appendChild(el)
    setTimeout(() => { if (el.parentNode) el.remove() }, 7000)
  }
})()


/* ═══ CUTTING EDGE FEATURES ═══ */

/* ─── Variable Font Weight Morph on Scroll ─── */
;(function() {
  if (prefersReducedMotion) return

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
})()

/* ─── Cursor X-Ray Mode (hold Shift) ─── */
;(function() {
  if (window.innerWidth < 768 || prefersReducedMotion) return

  const ring = document.querySelector('.cursor-ring')
  if (!ring) return

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift' && !e.repeat) {
      ring.classList.add('xray-mode')
    }
  })

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
      ring.classList.remove('xray-mode')
    }
  })
})()

/* ─── ASCII Mode Easter Egg ─── */
;(function() {
  let active = false
  let scanlines = null

  window.__asciiToggle = function() {
    active = !active

    if (active) {
      document.body.classList.add('ascii-mode')
      // Particles go green (terminal style)
      window.__particleTargetColor = 0x00ff41

      // Add scanlines
      scanlines = document.createElement('div')
      scanlines.className = 'ascii-scanlines'
      document.body.appendChild(scanlines)

      console.log(
        '%c ASCII MODE %c > TERMINAL INTERFACE ACTIVATED\n> ALL SYSTEMS NOMINAL\n> RENDERING IN TEXT MODE',
        'background: #00ff41; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
        'color: #00ff41; font-family: monospace;'
      )
    } else {
      document.body.classList.remove('ascii-mode')
      window.__particleTargetColor = 0x818cf8
      if (scanlines) { scanlines.remove(); scanlines = null }
    }
  }
})()
