/**
 * projects.js v2 — Project data + modal logic
 */

export const PROJECTS = {
  gridshield: {
    name: 'GridShield AI',
    tagline: 'Power Outage Prediction System',
    description:
      'Compound weather event modeling for state-agnostic power outage prediction. Three-model ensemble combining XGBoost, LightGBM, and LSTM with attention mechanism. Features calibrated uncertainty quantification and cross-state generalization.',
    architecture: `Data Sources          ML Pipeline              Serving
─────────────     ──────────────────     ──────────
NOAA Storms  ─┐   ┌─ XGBoost ──────┐   FastAPI
EAGLE-I      ─┤   │  LightGBM ─────┼─→ WebSocket
ERCOT Grid   ─┼─→ │  LSTM+Attention┘   Next.js
Census ACS   ─┤   │                     Dashboard
NWS Alerts   ─┘   └─ Meta-Learner ──→ Calibrated
                     (Stacking)        Uncertainty`,
    metrics: [
      { value: '0.967', label: 'AUC-ROC' },
      { value: '0.947', label: 'F1 Score' },
      { value: '138', label: 'Features' },
      { value: '57', label: 'Tests' },
    ],
    tags: [
      'XGBoost', 'LightGBM', 'LSTM', 'FastAPI',
      'H3 Spatial', 'SHAP', 'TimescaleDB', 'Docker', 'Prometheus',
    ],
    demoUrl: 'https://darthaether.github.io/outage-prediction-system/',
    githubUrl: 'https://github.com/DarthAether/outage-prediction-system',
    color: '#f59e0b',
  },
  threatsight: {
    name: 'ThreatSight',
    tagline: 'AI Security Surveillance Platform',
    description:
      'Enterprise AI-powered security surveillance with real-time weapon detection using YOLOv5/ONNX Runtime, face recognition via DeepFace, and multi-channel alerting (email, WebSocket, webhook, sound). Features JWT/RBAC auth, circuit breaker pattern, and full observability stack.',
    architecture: `Camera Sources        Detection Pipeline       Alert System
──────────────     ──────────────────     ────────────
USB Camera  ─┐     ┌─ YOLOv5 ───────┐   Email
RTSP Stream ─┼──→  │  ONNX Runtime  │─→ WebSocket
             │     └────────────────┘   Webhook
             │     ┌─ DeepFace ─────┐   Sound
             └──→  │  Face Store DB │
                   └────────────────┘
                          ↓
                   Event Bus → Audit Log → PostgreSQL`,
    metrics: [
      { value: '12,383', label: 'Lines of Code' },
      { value: '213', label: 'Tests' },
      { value: '121', label: 'Files' },
      { value: '11', label: 'Prometheus Metrics' },
    ],
    tags: [
      'YOLOv5', 'ONNX Runtime', 'DeepFace', 'FastAPI',
      'PostgreSQL', 'Redis', 'Prometheus', 'Grafana', 'Docker',
    ],
    demoUrl: 'https://darthaether.github.io/threat-identification-system/',
    githubUrl: 'https://github.com/DarthAether/threat-identification-system',
    color: '#f43f5e',
  },
  iotguard: {
    name: 'IoTGuard',
    tagline: 'IoT Command Security Platform',
    description:
      'Enterprise IoT command security with dual-engine analysis: regex-based security rules engine and Google Gemini LLM for risk assessment. Features MQTT device bridge, per-command audit logging, and Redis-cached analysis results. JWT/RBAC auth with role-based device permissions.',
    architecture: `IoT Command           Analysis Pipeline        Execution
───────────        ──────────────────     ──────────
User Input ──→ Security Rules Engine     Execute
               (Regex Pattern Match)     ──or──
                      ↓                  Block
               Gemini AI Analysis ──→    ↓
               (Risk Assessment)      MQTT Bridge
                      ↓                  ↓
               Risk: NONE/LOW/MED/    IoT Device
                     HIGH/CRITICAL
                      ↓
               Audit Log → PostgreSQL`,
    metrics: [
      { value: '10,255', label: 'Lines of Code' },
      { value: '92', label: 'Files' },
      { value: '6', label: 'ORM Models' },
      { value: '5', label: 'Device Types' },
    ],
    tags: [
      'Gemini AI', 'MQTT', 'FastAPI', 'PostgreSQL',
      'Redis', 'Prometheus', 'Grafana', 'Docker', 'Pydantic',
    ],
    demoUrl: 'https://darthaether.github.io/IoTGuard/',
    githubUrl: 'https://github.com/DarthAether/IoTGuard',
    color: '#06b6d4',
  },
}

/* ═══════════════════════════════════════════
   Modal logic
   ═══════════════════════════════════════════ */
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
