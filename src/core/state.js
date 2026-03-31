/**
 * state.js — Reactive store replacing all window.__ globals.
 * Map-backed with subscription support.
 */
const store = new Map()
const listeners = new Map()

export const state = {
  get(key) {
    return store.get(key)
  },

  set(key, value) {
    const prev = store.get(key)
    if (prev === value) return
    store.set(key, value)
    const subs = listeners.get(key)
    if (subs) subs.forEach((fn) => fn(value, prev, key))
  },

  subscribe(key, callback) {
    if (!listeners.has(key)) listeners.set(key, new Set())
    listeners.get(key).add(callback)
    // Return unsubscribe function
    return () => listeners.get(key).delete(callback)
  },

  batch(entries) {
    const changed = []
    for (const [key, value] of Object.entries(entries)) {
      const prev = store.get(key)
      if (prev !== value) {
        store.set(key, value)
        changed.push([key, value, prev])
      }
    }
    for (const [key, value, prev] of changed) {
      const subs = listeners.get(key)
      if (subs) subs.forEach((fn) => fn(value, prev, key))
    }
  },
}

// Default state
state.batch({
  scrollVelocity: 0,
  particleColor: 0x818cf8,
  activeMode: null,
  sithMode: false,
  audioBass: 0,
  audioMid: 0,
  audioHigh: 0,
  gyroX: 0,
  gyroY: 0,
  currentSection: 'hero',
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  isMobile: window.innerWidth < 768,
})
