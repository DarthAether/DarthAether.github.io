/**
 * mode-base.js — Base class for easter egg modes
 */
export class ModeBase {
  constructor(name) {
    this.name = name
    this._cleanups = []
    this._styleEl = null
    this.active = false
  }

  activate() {
    this.active = true
    document.body.setAttribute('data-mode', this.name)
  }

  deactivate() {
    this.active = false
    document.body.removeAttribute('data-mode')
    this._cleanups.forEach((fn) => fn())
    this._cleanups = []
    this.removeCSS()
  }

  injectCSS(css) {
    if (this._styleEl) return
    this._styleEl = document.createElement('style')
    this._styleEl.textContent = css
    document.head.appendChild(this._styleEl)
  }

  removeCSS() {
    if (this._styleEl) {
      this._styleEl.remove()
      this._styleEl = null
    }
  }

  addCleanup(fn) {
    this._cleanups.push(fn)
  }
}
