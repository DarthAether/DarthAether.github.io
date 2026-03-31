/**
 * modal.js — Project modal with focus trap, keyboard nav, aria management
 */
import { PROJECTS } from '../data/projects.js'

export function initProjectModal() {
  const modal = document.getElementById('project-modal')
  if (!modal) return

  const modalBody = modal.querySelector('.modal-body')
  const closeBtn = modal.querySelector('.modal-close')

  let previousFocus = null

  function openModal(key) {
    const project = PROJECTS[key]
    if (!project || !modalBody) return

    previousFocus = document.activeElement
    modal.setAttribute('aria-hidden', 'false')

    modalBody.innerHTML = `
      <h2 style="color:${project.color}">${project.name}</h2>
      <p class="modal-desc" style="font-size:0.85rem;color:var(--accent);margin-bottom:8px;">${project.tagline}</p>
      <p class="modal-desc">${project.description}</p>
      <p class="modal-section-title">Architecture</p>
      <pre class="modal-arch">${project.architecture}</pre>
      <p class="modal-section-title">Metrics</p>
      <div class="modal-metrics">
        ${project.metrics
          .map(
            (m) => `<div class="modal-metric-item">
              <span class="m-value">${m.value}</span>
              <span class="m-label">${m.label}</span>
            </div>`
          )
          .join('')}
      </div>
      <p class="modal-section-title">Tech Stack</p>
      <div class="modal-tags">
        ${project.tags.map((t) => `<span>${t}</span>`).join('')}
      </div>
      <div class="modal-actions">
        <a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-demo">Live Demo</a>
        <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-gh">GitHub</a>
      </div>
    `

    modal.classList.add('open')
    // Focus close button for keyboard users
    if (closeBtn) setTimeout(() => closeBtn.focus(), 100)
    document.body.style.overflow = 'hidden'
  }

  function closeModal() {
    modal.classList.remove('open')
    modal.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
    // Restore focus to the card that opened the modal
    if (previousFocus) previousFocus.focus()
  }

  // Card click + keyboard — but not on demo/gh buttons
  document.querySelectorAll('.project-card[data-project]').forEach((card) => {
    // Make cards keyboard-focusable
    card.setAttribute('tabindex', '0')
    card.setAttribute('role', 'button')
    card.setAttribute('aria-label', `View details for ${card.querySelector('.card-name')?.textContent || 'project'}`)

    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-demo') || e.target.closest('.btn-gh')) return
      const key = card.dataset.project
      openModal(key)
    })

    // Enter/Space to open
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openModal(card.dataset.project)
      }
    })
  })

  // Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal)
  }

  // Keyboard: Escape to close, Tab to trap focus
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return

    if (e.key === 'Escape') {
      closeModal()
      return
    }

    // Focus trap
    if (e.key === 'Tab') {
      const focusable = modal.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])')
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  })

  // Backdrop click — close if clicking outside modal-body
  modal.addEventListener('click', (e) => {
    if (!e.target.closest('.modal-body') && !e.target.closest('.modal-close')) {
      closeModal()
    }
  })
}
