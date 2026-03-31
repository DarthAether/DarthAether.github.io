/**
 * emitter.js — Typed pub/sub event bus for transient events.
 *
 * Events:
 *   raf:tick         { time, delta }
 *   resize           { width, height }
 *   scroll:update    { progress, velocity }
 *   mode:activate    { mode }
 *   mode:deactivate  { mode }
 *   preloader:complete
 */
const events = new Map()

export const emitter = {
  on(event, handler) {
    if (!events.has(event)) events.set(event, new Set())
    events.get(event).add(handler)
    return () => events.get(event).delete(handler)
  },

  off(event, handler) {
    events.get(event)?.delete(handler)
  },

  emit(event, data) {
    events.get(event)?.forEach((fn) => fn(data))
  },
}
