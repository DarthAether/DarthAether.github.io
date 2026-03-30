/**
 * timeline.js — Timeline SVG line draw + entry reveals
 * Uses manual strokeDasharray/strokeDashoffset technique (no premium drawSVG)
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const triggers = []

/**
 * Initialize timeline animations
 * - SVG line draws on scroll (scrubbed)
 * - Timeline entries fade in from alternating sides
 * - Timeline dots scale up when entry enters
 */
export function initTimeline() {
  drawTimelineLine()
  revealTimelineEntries()
}

/**
 * Animate the timeline SVG path drawing on scroll
 * Uses strokeDasharray + strokeDashoffset technique
 */
function drawTimelineLine() {
  const path = document.querySelector('.timeline-svg path, .timeline-line path, .timeline-line line, .timeline-line')

  if (!path) return

  // Handle SVG path element
  if (path.tagName === 'path' || path.tagName === 'line') {
    animateSVGPath(path)
    return
  }

  // Handle a plain div.timeline-line — animate scaleY
  if (path.tagName === 'DIV') {
    gsap.set(path, {
      scaleY: 0,
      transformOrigin: 'top center',
    })

    const trigger = gsap.to(path, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: path.closest('.timeline, section') || path,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1,
      },
    })

    return
  }

  // If the element contains SVG paths, find and animate them
  const svgPaths = path.querySelectorAll('path')
  svgPaths.forEach(animateSVGPath)
}

/**
 * Animate a single SVG path element with the drawSVG technique
 * @param {SVGPathElement} path
 */
function animateSVGPath(path) {
  const totalLength = path.getTotalLength ? path.getTotalLength() : 0
  if (!totalLength) return

  // Set initial state: full dash = invisible path
  path.style.strokeDasharray = totalLength
  path.style.strokeDashoffset = totalLength

  const trigger = gsap.to(path, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: path.closest('.timeline, section') || path,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1,
    },
  })

  triggers.push(trigger)
}

/**
 * Reveal timeline entries with alternating left/right slide-ins
 */
function revealTimelineEntries() {
  const entries = document.querySelectorAll('.timeline-entry, .timeline-item')
  if (!entries.length) return

  entries.forEach((entry, i) => {
    // Alternate: even from left, odd from right
    const fromLeft = i % 2 === 0
    const xOffset = fromLeft ? -40 : 40

    gsap.set(entry, {
      x: xOffset,
      opacity: 0,
    })

    const trigger = ScrollTrigger.create({
      trigger: entry,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(entry, {
          x: 0,
          opacity: 1,
          duration: 0.7,
          delay: i * 0.1,
          ease: 'power3.out',
        })
      },
    })

    triggers.push(trigger)

    // Animate the dot (if present)
    const dot = entry.querySelector('.timeline-dot')
    if (dot) {
      gsap.set(dot, { scale: 0 })

      const dotTrigger = ScrollTrigger.create({
        trigger: entry,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(dot, {
            scale: 1,
            duration: 0.5,
            delay: i * 0.1 + 0.2,
            ease: 'back.out(2)',
          })
        },
      })

      triggers.push(dotTrigger)
    }
  })
}

/**
 * Clean up all timeline triggers
 */
export function destroyTimeline() {
  triggers.forEach((t) => {
    if (t.scrollTrigger) t.scrollTrigger.kill()
    else if (t.kill) t.kill()
  })
  triggers.length = 0
}
