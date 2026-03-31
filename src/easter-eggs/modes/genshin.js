/**
 * genshin.js — Wish gacha pull overlay
 */
export function triggerGenshinWish() {
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
