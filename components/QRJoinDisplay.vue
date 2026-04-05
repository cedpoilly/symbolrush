<script setup lang="ts">
import RoomCodeDisplay from './RoomCodeDisplay.vue'

const props = defineProps<{
  roomCode: string
}>()

const qrCanvas = ref<HTMLCanvasElement | null>(null)

async function renderQR() {
  if (!qrCanvas.value || !props.roomCode) return

  const qrModule = await import('qrcode')
  const QRCode = qrModule.default ?? qrModule
  const url = `${window.location.origin}/?room=${props.roomCode}`
  const qr = QRCode.create(url, { errorCorrectionLevel: 'M' })
  const { size, data } = qr.modules

  const canvas = qrCanvas.value
  const moduleSize = 10
  const padding = 32
  const canvasSize = size * moduleSize + padding * 2

  canvas.width = canvasSize
  canvas.height = canvasSize
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#0a0a14'
  ctx.fillRect(0, 0, canvasSize, canvasSize)

  const centerX = size / 2
  const centerY = size / 2
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY)

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!data[row * size + col]) continue

      const x = padding + col * moduleSize
      const y = padding + row * moduleSize

      const isFinder =
        (row < 7 && col < 7) ||
        (row < 7 && col >= size - 7) ||
        (row >= size - 7 && col < 7)

      if (isFinder) {
        ctx.fillStyle = '#00e8ff'
      } else {
        const dist = Math.sqrt((row - centerY) ** 2 + (col - centerX) ** 2)
        const t = (dist / maxDist) ** 2
        const r = Math.round(t * 255)
        const g = Math.round(232 + t * (45 - 232))
        const b = Math.round(255 + t * (120 - 255))
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
      }

      ctx.beginPath()
      ctx.roundRect(x, y, moduleSize - 0.5, moduleSize - 0.5, 1.5)
      ctx.fill()
    }
  }
}

onMounted(() => renderQR())
watch(() => props.roomCode, () => renderQR())
</script>

<template>
  <div class="qr-join-display">
    <div class="qr-frame">
      <div class="qr-corner tl" />
      <div class="qr-corner tr" />
      <div class="qr-corner bl" />
      <div class="qr-corner br" />
      <canvas ref="qrCanvas" class="qr-canvas" />
      <div class="scan-line" />
    </div>
    <RoomCodeDisplay :code="roomCode" size="lg" />
  </div>
</template>

<style scoped>
.qr-join-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.qr-frame {
  position: relative;
  padding: 24px;
  background: rgba(0, 232, 255, 0.04);
  border: 1px solid rgba(0, 232, 255, 0.12);
  border-radius: 12px;
}

.qr-canvas {
  display: block;
  width: clamp(300px, 50vmin, 520px);
  height: clamp(300px, 50vmin, 520px);
}

.qr-corner {
  position: absolute;
  width: 22px;
  height: 22px;
}

.qr-corner.tl { top: -1px; left: -1px; border-top: 2px solid var(--color-cyan-400); border-left: 2px solid var(--color-cyan-400); }
.qr-corner.tr { top: -1px; right: -1px; border-top: 2px solid var(--color-cyan-400); border-right: 2px solid var(--color-cyan-400); }
.qr-corner.bl { bottom: -1px; left: -1px; border-bottom: 2px solid var(--color-cyan-400); border-left: 2px solid var(--color-cyan-400); }
.qr-corner.br { bottom: -1px; right: -1px; border-bottom: 2px solid var(--color-cyan-400); border-right: 2px solid var(--color-cyan-400); }

.scan-line {
  position: absolute;
  left: 12px;
  right: 12px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-cyan-400), transparent);
  animation: scan 2.5s linear infinite;
  opacity: 0.6;
}

:root.light .qr-frame {
  background: rgba(0, 200, 219, 0.04);
  border-color: rgba(0, 200, 219, 0.15);
}
</style>
