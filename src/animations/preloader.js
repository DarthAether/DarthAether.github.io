/**
 * preloader.js — Preloader sequence
 * Counter 0-100, progress bar, then reveal with clip-path circle shrink
 */
import { gsap } from 'gsap'

/**
 * Initialize and run the preloader sequence
 * @returns {Promise<void>} Resolves when preloader is fully hidden
 */
export function initPreloader() {
  return new Promise((resolve) => {
    const loader = document.querySelector('.preloader')

    if (!loader) {
      resolve()
      return
    }

    const loaderText = loader.querySelector('.preloader-counter')
    const loaderLine = loader.querySelector('.preloader-bar-inner')

    // Create counter element if loader text exists
    let counterEl = null
    if (loaderText) {
      // Use the existing text element to show counter
      counterEl = loaderText
    }

    // Animate counter from 0 to 100
    const counter = { value: 0 }

    const tl = gsap.timeline({
      onComplete: () => {
        // After counter completes, hide the preloader
        setTimeout(() => {
          loader.classList.add('done')

          // Wait for CSS transition to finish, then resolve
          const onTransitionEnd = () => {
            loader.removeEventListener('transitionend', onTransitionEnd)
            resolve()
          }

          loader.addEventListener('transitionend', onTransitionEnd)

          // Fallback: resolve after 800ms even if transitionend doesn't fire
          setTimeout(resolve, 800)
        }, 200) // small pause after counter hits 100
      },
    })

    tl.to(counter, {
      value: 100,
      duration: 2,
      ease: 'power2.inOut',
      onUpdate: () => {
        const val = Math.round(counter.value)
        if (counterEl) {
          counterEl.textContent = String(val).padStart(3, '0')
        }
      },
    })

    // Sync progress bar (the ::after pseudo element is animated via CSS,
    // but we can also drive it via the loader-line element width if needed)
    if (loaderLine) {
      // Override the CSS animation by setting the pseudo-element width via a custom property
      loaderLine.style.setProperty('--progress', '0%')
      gsap.to(loaderLine, {
        '--progress': '100%',
        duration: 2,
        ease: 'power2.inOut',
      })
    }
  })
}
