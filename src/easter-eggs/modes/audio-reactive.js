/**
 * audio-reactive.js — Mic toggle, getUserMedia, AnalyserNode, frequency band splitting
 */
import { state } from '../../core/state.js'

export function initAudioReactive() {
  const btn = document.getElementById('mic-toggle')
  if (!btn || state.get('prefersReducedMotion')) {
    if (btn) btn.style.display = 'none'
    return
  }

  let audioCtx = null
  let analyser = null
  let dataArray = null
  let micStream = null
  let active = false
  let rafId = null

  btn.addEventListener('click', async () => {
    if (!active) {
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        const source = audioCtx.createMediaStreamSource(micStream)
        analyser = audioCtx.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        dataArray = new Uint8Array(analyser.frequencyBinCount)

        active = true
        btn.classList.add('active')
        pumpAudio()

        console.log(
          '%c AUDIO MODE %c Particles are now reacting to your microphone.',
          'background: #818cf8; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 3px;',
          'color: #818cf8;'
        )
      } catch (e) {
        console.warn('Mic access denied:', e.message)
      }
    } else {
      stopAudio()
    }
  })

  function pumpAudio() {
    if (!active || !analyser) return
    analyser.getByteFrequencyData(dataArray)

    const len = dataArray.length
    let bass = 0, mid = 0, high = 0
    const bassEnd = Math.floor(len * 0.15)
    const midEnd = Math.floor(len * 0.5)

    for (let i = 0; i < bassEnd; i++) bass += dataArray[i]
    for (let i = bassEnd; i < midEnd; i++) mid += dataArray[i]
    for (let i = midEnd; i < len; i++) high += dataArray[i]

    bass = bass / bassEnd / 255
    mid = mid / (midEnd - bassEnd) / 255
    high = high / (len - midEnd) / 255

    state.batch({
      audioBass: bass,
      audioMid: mid,
      audioHigh: high,
    })

    rafId = requestAnimationFrame(pumpAudio)
  }

  function stopAudio() {
    active = false
    btn.classList.remove('active')
    if (rafId) cancelAnimationFrame(rafId)
    if (micStream) micStream.getTracks().forEach(t => t.stop())
    if (audioCtx) audioCtx.close()
    state.batch({ audioBass: 0, audioMid: 0, audioHigh: 0 })
    audioCtx = null
    analyser = null
    micStream = null
  }
}
