import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ━━━ Smooth Scroll ━━━
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// Sync Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

// ━━━ Loader ━━━
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('done')
    animateHero()
  }, 1800)
})

// ━━━ Custom Cursor ━━━
const cursor = document.getElementById('cursor')
const cursorDot = document.getElementById('cursorDot')

if (cursor && window.innerWidth > 768) {
  let mx = 0, my = 0, cx = 0, cy = 0

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX
    my = e.clientY
    gsap.to(cursorDot, { x: mx, y: my, duration: 0.1 })
  })

  gsap.ticker.add(() => {
    cx += (mx - cx) * 0.12
    cy += (my - cy) * 0.12
    gsap.set(cursor, { x: cx, y: cy })
  })

  // Hover effect on links and buttons
  document.querySelectorAll('a, button, .project-row').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'))
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'))
  })
}

// ━━━ Clock ━━━
function updateClock() {
  const now = new Date()
  const opts = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
  const date = now.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase()
  const time = now.toLocaleTimeString('en-GB', opts)
  const el = document.getElementById('clock')
  if (el) el.textContent = `IST ${date}  ${time}`
}
updateClock()
setInterval(updateClock, 1000)

// ━━━ Hero Animation ━━━
function animateHero() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

  // Wrap each line's text in a .line-inner span for reveal
  document.querySelectorAll('.hero-title .line').forEach((line) => {
    const text = line.innerHTML
    line.innerHTML = `<span class="line-inner">${text}</span>`
  })

  tl.to('.hero-title .line-inner', {
    y: 0,
    duration: 1.2,
    stagger: 0.12,
  })
  .to('.hero-tag', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
  .to('.hero-desc', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
  .to('.hero-stats', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
  .to('.scroll-indicator', { opacity: 1, duration: 0.6 }, '-=0.3')

  // Counter animation
  document.querySelectorAll('.hero-stat-val').forEach((el) => {
    const target = parseFloat(el.dataset.count)
    const isDecimal = target < 10
    const obj = { val: 0 }
    gsap.to(obj, {
      val: target,
      duration: 2,
      delay: 1,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = isDecimal ? obj.val.toFixed(3) : Math.round(obj.val)
      },
    })
  })
}

// ━━━ Scroll Animations ━━━
// Fade up elements on scroll
gsap.utils.toArray('[data-animate="fade-up"]').forEach((el) => {
  // Skip hero elements (animated separately)
  if (el.closest('.hero')) return

  gsap.from(el, {
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
  })
})

// Project rows stagger
gsap.utils.toArray('.project-row').forEach((row, i) => {
  gsap.from(row, {
    scrollTrigger: {
      trigger: row,
      start: 'top 88%',
    },
    y: 30,
    opacity: 0,
    duration: 0.7,
    delay: i * 0.08,
    ease: 'power3.out',
  })
})

// About items
gsap.utils.toArray('.about-item').forEach((item, i) => {
  gsap.from(item, {
    scrollTrigger: {
      trigger: item,
      start: 'top 90%',
    },
    x: -20,
    opacity: 0,
    duration: 0.5,
    delay: i * 0.05,
    ease: 'power2.out',
  })
})

// Contact rows
gsap.utils.toArray('.contact-row').forEach((row, i) => {
  gsap.from(row, {
    scrollTrigger: {
      trigger: row,
      start: 'top 90%',
    },
    y: 20,
    opacity: 0,
    duration: 0.5,
    delay: i * 0.08,
    ease: 'power2.out',
  })
})

// Parallax on hero stats
gsap.to('.hero-stats', {
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
  },
  y: -30,
  opacity: 0.3,
})
