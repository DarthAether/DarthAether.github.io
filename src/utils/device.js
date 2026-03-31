/**
 * device.js — Device detection utilities.
 */
export const isMobile = () => window.innerWidth < 768
export const isLowEnd = () => navigator.hardwareConcurrency <= 4 || window.innerWidth < 1200
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
