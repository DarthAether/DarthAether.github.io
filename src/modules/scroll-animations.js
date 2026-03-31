/**
 * scroll-animations.js — All scroll-triggered reveal animations, card tilt, parallax,
 * section title dot pulse, text distortion rAF loop
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { state } from '../core/state.js'

export function scrollAnimations() {
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

  // Section titles — 3D rotateX reveal (laying down → standing up)
  document.querySelectorAll('.section-title').forEach((title) => {
    const inner = document.createElement('span')
    inner.className = 'title-reveal-inner'
    inner.innerHTML = title.innerHTML
    title.innerHTML = ''
    title.appendChild(inner)
    title.style.overflow = 'hidden'

    gsap.set(inner, {
      rotateX: 90,
      y: '50%',
      opacity: 0,
      transformOrigin: 'bottom center',
    })

    ScrollTrigger.create({
      trigger: title,
      start: 'top 88%',
      once: true,
      onEnter() {
        gsap.to(inner, {
          rotateX: 0,
          y: '0%',
          opacity: 1,
          duration: 1,
          ease: 'power4.out',
        })
      },
    })
  })

  // Project cards — 3D flip cascade (deal like playing cards)
  const projectCards = gsap.utils.toArray('.project-card')
  projectCards.forEach((card, i) => {
    gsap.set(card, {
      opacity: 0,
      rotateY: -60,
      x: -40,
      scale: 0.9,
      transformPerspective: 800,
    })

    ScrollTrigger.create({
      trigger: card,
      start: 'top 88%',
      once: true,
      onEnter() {
        gsap.to(card, {
          opacity: 1,
          rotateY: 0,
          x: 0,
          scale: 1,
          duration: 0.9,
          delay: i * 0.15,
          ease: 'power3.out',
        })
      },
    })
  })

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

  // ── Floating parallax on stat labels ──
  document.querySelectorAll('.stat-label').forEach((label, i) => {
    const speed = 10 + i * 8 // different speeds create depth
    gsap.to(label, {
      y: speed,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-stats',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
  })

  // ── Stagger section labels with accent dot pulse ──
  document.querySelectorAll('.section-title').forEach((title) => {
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

/* ─── Scroll-Velocity Text Distortion ─── */
export function initTextDistortion() {
  if (state.get('prefersReducedMotion')) return

  document.body.classList.add('scroll-distort')
  let smoothVel = 0

  function updateDistortion() {
    const vel = state.get('scrollVelocity') || 0
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
}
