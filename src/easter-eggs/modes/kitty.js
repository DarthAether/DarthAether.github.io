/**
 * kitty.js — Full kitty mode: cat puns, rain, navbar cat, cat facts, footer cat, title renaming
 */
import { state } from '../../core/state.js'

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

export function toggleKitty() {
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
    state.set('particleColor', 0xf97316)

    // Rename section titles with cat puns
    document.querySelectorAll('.section-title').forEach(title => {
      const inner = title.querySelector('.title-reveal-inner')
      const textEl = inner || title
      const originalText = textEl.textContent.trim()
      originalTitles.set(title, originalText)

      for (const [orig, pun] of Object.entries(CAT_PUNS)) {
        if (originalText.includes(orig) || originalText.replace(/[^a-zA-Z ]/g, '').trim() === orig.replace(/[^a-zA-Z ]/g, '').trim()) {
          if (inner) {
            inner.childNodes.forEach(node => {
              if (node.nodeType === 3) node.textContent = node.textContent.replace(orig, pun)
            })
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
  state.set('particleColor', 0x818cf8)

  if (rainInterval) { clearInterval(rainInterval); rainInterval = null }
  document.querySelectorAll('.cat-rain').forEach(el => el.remove())

  if (navCat) { navCat.remove(); navCat = null }

  if (factInterval) { clearInterval(factInterval); factInterval = null }
  document.querySelectorAll('.cat-fact').forEach(el => el.remove())

  if (footerCatEl) { footerCatEl.remove(); footerCatEl = null }

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
