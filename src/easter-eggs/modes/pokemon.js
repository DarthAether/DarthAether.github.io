/**
 * pokemon.js — Full Pokemon system: spawn, AI wandering, Mew cursor companion, mega evolution
 */
import { state } from '../../core/state.js'

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

// Mew state
let mew = null
let mewX = 0, mewY = 0
let mewMouseX = 0, mewMouseY = 0
let mewAngle = 0
let mewSparkleTimer = 0
let mewActive = false

const TARGETS_SELECTOR = '.btn, .contact-cv, .nav-brand, .nav-link, .project-card, .other-card, .research-card, .experience-card, .contact-item, .stat, .card-tags span, .exp-tags span, .back-to-top, .hero-availability, .research-badge'

function getRandomSpawnPosition() {
  const pad = 100
  return {
    x: pad + Math.random() * (window.innerWidth - pad * 2 - 80),
    y: pad + Math.random() * (window.innerHeight - pad * 2 - 80),
  }
}

function getVisibleTargets() {
  const els = document.querySelectorAll(TARGETS_SELECTOR)
  const visible = []
  els.forEach(el => {
    const rect = el.getBoundingClientRect()
    if (rect.top > -50 && rect.bottom < window.innerHeight + 50 &&
        rect.left > -50 && rect.right < window.innerWidth + 50 &&
        rect.width > 10 && rect.height > 10) {
      visible.push({ el, rect })
    }
  })
  return visible
}

export function spawnPokemon() {
  pokemonActive = true
  document.body.classList.add('pokemon-mode')
  state.set('particleColor', 0xfbbf24)

  const selected = []
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

      setTimeout(() => {
        img.classList.remove('bounce')
        img.classList.add('idle')
      }, 600)

      wanderPokemon(container, img)
    }, i * 300)
  })

  selected.forEach(p => {
    const preload = new Image()
    preload.src = SPRITE_BASE + p.sprite + '.gif'
  })

  console.log(
    '%c POKEMON %c Wild Pokemon appeared! Type "megaevolve" to trigger Mega Evolution!',
    'background: #fbbf24; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
    'color: #fbbf24;'
  )

  // Also spawn Mew
  if (!mewActive) spawnMew()
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

  function goToTarget() {
    const targets = getVisibleTargets()
    if (targets.length === 0) { randomWalk(); return }

    const target = targets[Math.floor(Math.random() * targets.length)]
    const rect = target.rect
    const destX = rect.left + rect.width / 2 - 40
    const destY = rect.top - 20

    showNotice(container)

    setTimeout(() => {
      walkTo(container, img, destX, destY, () => {
        interactWithTarget(container, img, target.el, () => {
          setTimeout(nextBehavior, 1500 + Math.random() * 2000)
        })
      })
    }, 600)
  }

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

  function doJump() {
    img.classList.remove('idle', 'sitting', 'walking')
    img.classList.add('jumping')
    setTimeout(() => {
      img.classList.remove('jumping')
      img.classList.add('idle')
      setTimeout(nextBehavior, 800 + Math.random() * 1500)
    }, 500)
  }

  setTimeout(nextBehavior, 1500 + Math.random() * 2000)
}

function walkTo(container, img, destX, destY, onArrive) {
  const startX = parseFloat(container.style.left) || 0
  const startY = parseFloat(container.style.top) || 0
  const dx = destX - startX
  const dy = destY - startY
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dx < 0) {
    img.style.transform = 'scaleX(-1)'
  } else {
    img.style.transform = 'scaleX(1)'
  }

  img.classList.remove('idle', 'sitting', 'jumping')
  img.classList.add('walking')

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

function interactWithTarget(container, img, targetEl, onDone) {
  const rect = targetEl.getBoundingClientRect()

  img.classList.remove('idle', 'walking', 'sitting')
  img.classList.add('landing')

  container.style.transition = 'left 0.2s ease-out, top 0.2s ease-out'
  container.style.left = (rect.left + rect.width / 2 - 40) + 'px'
  container.style.top = (rect.top - 40) + 'px'

  setTimeout(() => {
    targetEl.classList.add('pokemon-squish')
    targetEl.classList.add('pokemon-target-glow')
    targetEl.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
  }, 200)

  setTimeout(() => {
    img.classList.remove('landing')
    targetEl.classList.remove('pokemon-squish')

    const bounceCount = 2 + Math.floor(Math.random() * 3)
    img.classList.add('trampolining')

    let bouncesDone = 0
    const bounceInterval = setInterval(() => {
      targetEl.classList.remove('pokemon-squish')
      void targetEl.offsetWidth
      targetEl.classList.add('pokemon-squish')
      bouncesDone++
      if (bouncesDone >= bounceCount) {
        clearInterval(bounceInterval)
      }
    }, 600)

    setTimeout(() => {
      img.classList.remove('trampolining')
      img.classList.add('jumping')
      targetEl.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))

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

function showNotice(container) {
  const existing = container.querySelector('.pokemon-notice')
  if (existing) existing.remove()

  const notice = document.createElement('span')
  notice.className = 'pokemon-notice'
  notice.textContent = '!'
  container.appendChild(notice)
  setTimeout(() => notice.remove(), 900)
}

export function megaEvolve() {
  megaEvolved = true

  const flash = document.createElement('div')
  flash.className = 'mega-flash'
  flash.innerHTML = '<div class="mega-flash-inner"></div>'
  document.body.appendChild(flash)

  const text = document.createElement('div')
  text.className = 'mega-text'
  text.innerHTML = '<span class="mega-line1">Mega Evolution!</span><span class="mega-line2">Beyond Evolution</span>'
  document.body.appendChild(text)

  state.set('particleColor', 0xa855f7)

  setTimeout(() => {
    sprites.forEach((s, i) => {
      setTimeout(() => {
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

  setTimeout(() => flash.remove(), 2200)
  setTimeout(() => text.remove(), 2800)

  console.log(
    '%c MEGA EVOLUTION %c The power of Mega Evolution surges through the battlefield!',
    'background: linear-gradient(90deg, #fbbf24, #a855f7); color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
    'color: #a855f7;'
  )
}

/* ═══ MEW — CURSOR COMPANION ═══ */
function spawnMew() {
  if (window.innerWidth < 768) return
  mewActive = true

  document.addEventListener('mousemove', (e) => {
    mewMouseX = e.clientX
    mewMouseY = e.clientY
  }, { passive: true })

  mew = document.createElement('img')
  mew.className = 'mew-companion'
  mew.src = 'https://play.pokemonshowdown.com/sprites/ani/mew.gif'
  mew.alt = 'Mew'
  mew.draggable = false
  document.body.appendChild(mew)

  mewX = mewMouseX + 60
  mewY = mewMouseY - 30
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
  if (!mewActive || !mew) return

  mewAngle += 0.02
  mewSparkleTimer++

  const orbitRadius = 50 + Math.sin(mewAngle * 0.7) * 20
  const targetX = mewMouseX + Math.cos(mewAngle) * orbitRadius
  const targetY = mewMouseY + Math.sin(mewAngle * 1.3) * (orbitRadius * 0.6) - 20

  mewX += (targetX - mewX) * 0.06
  mewY += (targetY - mewY) * 0.06

  mew.style.left = mewX + 'px'
  mew.style.top = mewY + 'px'

  const movingLeft = targetX < mewX
  mew.style.transform = movingLeft
    ? 'translate(-50%, -50%) scaleX(-1)'
    : 'translate(-50%, -50%) scaleX(1)'

  if (mewSparkleTimer % 8 === 0) {
    spawnSparkle(mewX, mewY)
  }

  requestAnimationFrame(orbitLoop)
}

function spawnSparkle(x, y) {
  const s = document.createElement('div')
  s.className = 'mew-sparkle'
  s.style.left = (x + (Math.random() - 0.5) * 20) + 'px'
  s.style.top = (y + (Math.random() - 0.5) * 20) + 'px'
  const colors = ['#c4b5fd', '#a5b4fc', '#e0e7ff', '#ddd6fe', '#818cf8']
  s.style.background = colors[Math.floor(Math.random() * colors.length)]
  s.style.width = (2 + Math.random() * 4) + 'px'
  s.style.height = s.style.width
  document.body.appendChild(s)
  setTimeout(() => s.remove(), 800)
}
