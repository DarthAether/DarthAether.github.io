/**
 * witcher.js — "Wind's howling" notification
 */
export function triggerWitcher() {
  if (document.querySelector('.witcher-overlay')) return

  const overlay = document.createElement('div')
  overlay.className = 'witcher-overlay'
  overlay.innerHTML = `
    <div class="witcher-text">
      "Wind's howling."
      <span class="witcher-sub">&mdash; Geralt of Rivia</span>
    </div>
  `
  document.body.appendChild(overlay)
  setTimeout(() => overlay.remove(), 3200)

  console.log(
    '%c THE WITCHER %c Hmm. Looks like rain.',
    'background: #888; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
    'color: #888; font-style: italic;'
  )
}
