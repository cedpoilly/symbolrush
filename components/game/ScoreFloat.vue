<script setup lang="ts">
function show(x: number, y: number, correct: boolean, delta: number) {
  // Ripple
  const ripple = document.createElement('div')
  ripple.style.cssText = `
    position: fixed; width: 40px; height: 40px; border-radius: 50%;
    pointer-events: none; z-index: 150;
    left: ${x}px; top: ${y}px;
    background: ${correct ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 51, 85, 0.15)'};
    animation: ripple-expand 0.4s ease forwards;
  `
  document.body.appendChild(ripple)
  setTimeout(() => ripple.remove(), 400)

  // Floating score
  const float = document.createElement('div')
  float.style.cssText = `
    position: fixed; pointer-events: none; z-index: 200;
    font-family: 'Azeret Mono', monospace; font-weight: 900; font-size: 1.5rem;
    left: ${x}px; top: ${y}px;
    color: ${correct ? 'var(--color-green-400)' : 'var(--color-red-400)'};
    -webkit-text-stroke: 2px #0a0a1a;
    paint-order: stroke fill;
    text-shadow: 0 0 8px ${correct ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 51, 85, 0.5)'},
                 0 1px 3px rgba(0, 0, 0, 0.8);
    animation: float-up 0.7s ease forwards;
  `
  float.textContent = delta > 0 ? `+${delta}` : String(delta)
  document.body.appendChild(float)
  setTimeout(() => float.remove(), 700)
}

defineExpose({ show })
</script>

<template>
  <span />
</template>
