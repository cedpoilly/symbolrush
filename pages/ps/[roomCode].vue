<script setup lang="ts">
import type { SessionScore, LeaderboardEntry, Symbol } from '~/types/game'

const route = useRoute()
const roomCode = computed(() => (route.params.roomCode as string).toUpperCase())

const { connected, connect, send, on } = useGameSocket()

const phase = ref<'connecting' | 'lobby' | 'playing' | 'results'>('connecting')
const players = ref<Array<{ id: string; username: string }>>([])
const currentSymbol = ref<Symbol | null>(null)
const timeRemainingMs = ref(30_000)
const sessionDuration = ref(30_000)
const sessionScores = ref<SessionScore[]>([])
const leaderboard = ref<LeaderboardEntry[]>([])
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const recentJoins = ref<Array<{ id: string; username: string; ts: number }>>([])

// ── Connect as screen ──
onMounted(() => {
  connect()
  const unwatch = watch(connected, (isConnected) => {
    if (isConnected) {
      send({ type: 'screen:join', roomCode: roomCode.value })
      unwatch()
    }
  }, { immediate: true })
})

// ── Message handlers ──
on('room:status', (msg) => {
  if (msg.type !== 'room:status') return
  if (phase.value === 'connecting') {
    phase.value = 'lobby'
    nextTick(() => renderQR())
  }
})

on('room:player-joined', (msg) => {
  if (msg.type !== 'room:player-joined') return
  // Avoid duplicates (screen:join sends existing players)
  if (!players.value.find(p => p.id === msg.player.id)) {
    players.value.push(msg.player)
  }
  recentJoins.value.unshift({ ...msg.player, ts: Date.now() })
  if (recentJoins.value.length > 5) recentJoins.value.pop()
})

on('room:player-left', (msg) => {
  if (msg.type !== 'room:player-left') return
  players.value = players.value.filter(p => p.id !== msg.playerId)
})

on('session:started', (msg) => {
  if (msg.type !== 'session:started') return
  phase.value = 'playing'
  sessionDuration.value = msg.endsAt - Date.now()
  timeRemainingMs.value = sessionDuration.value
})

on('session:symbol-change', (msg) => {
  if (msg.type !== 'session:symbol-change') return
  currentSymbol.value = msg.symbol
})

on('session:tick', (msg) => {
  if (msg.type !== 'session:tick') return
  timeRemainingMs.value = msg.timeRemainingMs
})

on('session:ended', (msg) => {
  if (msg.type !== 'session:ended') return
  sessionScores.value = msg.scores
  phase.value = 'results'
})

on('leaderboard:update', (msg) => {
  if (msg.type !== 'leaderboard:update') return
  leaderboard.value = msg.leaderboard
})

on('error', (msg) => {
  if (msg.type !== 'error') return
  console.error('[PS]', msg.message)
})

// ── Computed ──
const timerPercent = computed(() =>
  Math.max(0, (timeRemainingMs.value / sessionDuration.value) * 100),
)
const timerUrgent = computed(() => timeRemainingMs.value < 8000)
const secondsRemaining = computed(() => Math.ceil(timeRemainingMs.value / 1000))

function isNewBest(entry: LeaderboardEntry): boolean {
  const roundResult = sessionScores.value.find(s => s.playerId === entry.playerId)
  return !!roundResult && roundResult.score === entry.bestScore && roundResult.score > 0
}

// ── QR code rendering ──
async function renderQR() {
  if (!qrCanvas.value || !roomCode.value) return

  const qrModule = await import('qrcode')
  const QRCode = qrModule.default ?? qrModule
  const url = `${window.location.origin}/?room=${roomCode.value}`
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

useHead({
  title: `Symbol Rush — Public Screen`,
  bodyAttrs: { class: 'no-scroll' },
})
</script>

<template>
  <div class="ps grid-bg">
    <!-- Timer bar -->
    <div v-if="phase === 'playing'" class="timer-bar-container">
      <div class="timer-bar" :class="{ urgent: timerUrgent }" :style="{ width: timerPercent + '%' }" />
    </div>

    <!-- Connecting -->
    <div v-if="phase === 'connecting'" class="center-screen">
      <p class="mono muted">Connecting to room...</p>
    </div>

    <!-- Lobby -->
    <div v-else-if="phase === 'lobby'" class="lobby">
      <div class="lobby-hero">
        <div class="room-code-section">
          <span class="room-code-label">SCAN TO JOIN</span>
          <span class="room-code">{{ roomCode }}</span>
        </div>

        <div class="qr-frame">
          <div class="qr-corner tl" />
          <div class="qr-corner tr" />
          <div class="qr-corner bl" />
          <div class="qr-corner br" />
          <canvas ref="qrCanvas" class="qr-canvas" />
          <div class="scan-line" />
        </div>
        <p class="qr-url mono">symbolrush.app/{{ roomCode }}</p>
      </div>

      <div class="player-sidebar">
        <p class="player-count mono">
          <span class="count-num">{{ players.length }}</span> player{{ players.length !== 1 ? 's' : '' }}
        </p>
        <TransitionGroup name="join-pill" tag="div" class="player-list">
          <span v-for="join in recentJoins" :key="join.id + join.ts" class="join-name">
            {{ join.username }}
          </span>
        </TransitionGroup>
        <p class="mono muted wait-label">Waiting for host...</p>
      </div>
    </div>

    <!-- Playing -->
    <div v-else-if="phase === 'playing'" class="playing center-screen">
      <div class="symbol-display">
        <Transition name="symbol" mode="out-in">
          <span :key="currentSymbol" class="active-symbol">{{ currentSymbol }}</span>
        </Transition>
      </div>
      <p class="countdown mono">
        <span class="seconds">{{ secondsRemaining }}</span>s
      </p>
    </div>

    <!-- Results -->
    <div v-else-if="phase === 'results'" class="results center-screen">
      <h2 class="results-title mono">BEST SCORES</h2>
      <div class="leaderboard-list">
        <div
          v-for="(entry, index) in leaderboard"
          :key="entry.playerId"
          class="lb-row"
          :class="{ 'rank-1': index === 0, 'rank-2': index === 1, 'rank-3': index === 2 }"
          :style="{ animationDelay: `${index * 0.06}s` }"
        >
          <span class="lb-rank">#{{ index + 1 }}</span>
          <span class="lb-name">{{ entry.username }}</span>
          <span v-if="isNewBest(entry)" class="new-best-badge">NEW BEST</span>
          <span class="lb-score">{{ entry.bestScore }}</span>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="bottom-bar">
      <span class="brand mono">
        <span class="brand-symbol">SYMBOL</span><span class="brand-rush">RUSH</span>
      </span>
      <span class="connection-dot" :class="{ connected }" />
    </div>
  </div>
</template>

<style scoped>
.ps {
  min-height: 100dvh;
  position: relative;
}

/* ── Lobby ── */
.lobby {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 3fr 1fr;
  position: relative;
  z-index: 1;
  padding: 40px;
  gap: 24px;
}

.lobby-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.room-code-section {
  text-align: center;
}

.room-code-label {
  display: block;
  font-family: 'Azeret Mono', monospace;
  font-size: 0.85rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 8px;
}

.room-code {
  font-family: 'Azeret Mono', monospace;
  font-weight: 900;
  font-size: clamp(3.5rem, 10vw, 6rem);
  color: var(--cyan);
  text-shadow: 0 0 40px var(--cyan-glow), 0 0 80px rgba(0, 232, 255, 0.15);
  letter-spacing: 0.08em;
}

/* ── QR Frame (hero size) ── */
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

.qr-corner.tl { top: -1px; left: -1px; border-top: 2px solid var(--cyan); border-left: 2px solid var(--cyan); }
.qr-corner.tr { top: -1px; right: -1px; border-top: 2px solid var(--cyan); border-right: 2px solid var(--cyan); }
.qr-corner.bl { bottom: -1px; left: -1px; border-bottom: 2px solid var(--cyan); border-left: 2px solid var(--cyan); }
.qr-corner.br { bottom: -1px; right: -1px; border-bottom: 2px solid var(--cyan); border-right: 2px solid var(--cyan); }

.scan-line {
  position: absolute;
  left: 12px;
  right: 12px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyan), transparent);
  animation: scan 2.5s linear infinite;
  opacity: 0.6;
}

.qr-url {
  font-size: 0.9rem;
  color: var(--muted);
  text-align: center;
}

/* ── Player sidebar (right 1/4) ── */
.player-sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 0;
  align-self: center;
}

.player-count {
  font-size: 0.85rem;
  color: var(--muted);
}

.count-num {
  font-weight: 700;
  color: var(--text);
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
  max-height: 60vh;
}

.join-name {
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  color: var(--green);
  background: var(--green-dim);
  padding: 4px 12px;
  border-radius: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wait-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 4px;
}

/* ── Playing ── */
.playing {
  gap: 20px;
}

.symbol-display {
  display: flex;
  align-items: center;
  justify-content: center;
}

.active-symbol {
  font-family: 'Azeret Mono', monospace;
  font-size: clamp(80px, 20vw, 160px);
  color: var(--text);
  text-shadow: 0 0 40px rgba(255, 255, 255, 0.1);
  line-height: 1;
}

.countdown {
  font-size: 1.5rem;
  color: var(--muted);
}

.seconds {
  font-weight: 700;
  color: var(--text);
}

/* ── Results ── */
.results {
  gap: 24px;
  padding: 40px;
}

.results-title {
  font-size: 0.85rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 500px;
}

.lb-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--surface);
  border-radius: 10px;
  animation: slide-in-left 0.3s ease both;
}

.lb-rank {
  font-family: 'Azeret Mono', monospace;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--muted);
  min-width: 36px;
}

.rank-1 .lb-rank { color: var(--gold); font-size: 1.1rem; text-shadow: 0 0 8px rgba(255, 194, 51, 0.3); }
.rank-2 .lb-rank { color: #c0c0c0; }
.rank-3 .lb-rank { color: #cd7f32; }
.rank-1 { font-size: 1.05rem; }

.lb-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  flex: 1;
}

.new-best-badge {
  font-family: 'Azeret Mono', monospace;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--gold);
  background: var(--gold-dim);
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.lb-score {
  font-family: 'Azeret Mono', monospace;
  font-weight: 700;
  color: var(--cyan);
  min-width: 50px;
  text-align: right;
}
</style>
