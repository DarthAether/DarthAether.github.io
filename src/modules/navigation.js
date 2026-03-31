/**
 * navigation.js — Navbar auto-hide, active section tracking, mobile menu
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollTo } from './scroll.js'

export function navbarBehavior() {
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
      if (target) scrollTo(target, { offset: 0 })
      closeMobileMenu()
    })
  })
}

export function closeMobileMenu() {
  const toggle = document.querySelector('.nav-toggle')
  const menu = document.getElementById('mobile-menu')
  if (!toggle || !menu) return
  toggle.classList.remove('open')
  menu.classList.remove('open')
  // Reset link visibility for next open
  gsap.set(menu.querySelectorAll('.mobile-link'), { opacity: 0, y: 30 })
}

export function mobileMenu() {
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
      if (target) scrollTo(target, { offset: 0 })
      closeMobileMenu()
    })
  })
}
