/**
 * preloader.js — Seamless particle-to-page transition preloader system
 *
 * 3 phases, one continuous flow:
 * Phase 1 (0-1.2s): Counter 0→100 with progress bar
 * Phase 2 (1.2-1.5s): "100" explodes into 200 purple particles that scatter
 * Phase 3 (1.5-3.0s): Particles swirl, converge toward hero text positions,
 *   and as they arrive, the actual DOM elements fade in — particles dissolve
 *   INTO the page. Seamless. No cut.
 */
import { gsap } from 'gsap'
import { emitter } from '../core/emitter.js'
import { revealHeroChars } from './hero.js'

export function initPreloader(initAllFn) {
  window.addEventListener('load', () => {
    // Render homepage immediately but keep it invisible
    initAllFn()

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
      emitter.emit('preloader:complete')
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
}

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
          emitter.emit('preloader:complete')
        },
      })
    }
  }

  requestAnimationFrame(animate)
}
