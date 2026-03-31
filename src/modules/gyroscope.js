/**
 * gyroscope.js — Gyroscope parallax for mobile devices
 */
import { state } from '../core/state.js'

export function initGyroscope() {
  if (window.innerWidth >= 768) return // desktop has cursor parallax

  // Show prompt
  const prompt = document.createElement('div')
  prompt.className = 'gyro-prompt'
  prompt.textContent = 'Tilt device to explore'
  document.body.appendChild(prompt)
  setTimeout(() => prompt.remove(), 8000)

  function initGyro() {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma === null) return
      state.set('gyroX', (e.gamma || 0) / 90)
      state.set('gyroY', ((e.beta || 0) - 45) / 90)
    }, { passive: true })
  }

  // iOS requires permission request
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    document.addEventListener('touchstart', function onTouch() {
      DeviceOrientationEvent.requestPermission().then(state => {
        if (state === 'granted') initGyro()
      }).catch(() => {})
      document.removeEventListener('touchstart', onTouch)
    }, { once: true })
  } else {
    initGyro()
  }
}
