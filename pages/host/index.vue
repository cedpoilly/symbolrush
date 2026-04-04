<script setup lang="ts">
import type { SessionScore, LeaderboardEntry, Symbol } from '~/types/game'

const { connected, connect, send, on } = useGameSocket()

const roomCode = ref('')
const phase = ref<'connecting' | 'lobby' | 'playing' | 'results'>('connecting')
const players = ref<Array<{ id: string; username: string }>>([])
const currentSymbol = ref<Symbol | null>(null)
const timeRemainingMs = ref(30_000)
const sessionDuration = ref(30_000)
const sessionScores = ref<SessionScore[]>([])
const leaderboard = ref<LeaderboardEntry[]>([])
const roundCount = ref(0)

// ── Connect + create room on mount ──
onMounted(() => {
  connect()
  const unwatch = watch(connected, (isConnected) => {
    if (isConnected) {
      send({ type: 'host:create-room' })
      unwatch()
    }
  }, { immediate: true })
})

// ── Message handlers ──
on('room:created', (msg) => {
  if (msg.type !== 'room:created') return
  roomCode.value = msg.roomCode
  phase.value = 'lobby'
})

on('room:player-joined', (msg) => {
  if (msg.type !== 'room:player-joined') return
  players.value.push(msg.player)
})

on('room:player-left', (msg) => {
  if (msg.type !== 'room:player-left') return
  players.value = players.value.filter(p => p.id !== msg.playerId)
})

on('session:started', (msg) => {
  if (msg.type !== 'session:started') return
  phase.value = 'playing'
  roundCount.value++
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

// ── Actions ──
function startRound() {
  send({ type: 'host:start-session' })
}

const psFullUrl = computed(() => {
  if (!roomCode.value || import.meta.server) return ''
  return `${window.location.origin}/ps/${roomCode.value}`
})

function openPublicScreen() {
  window.open(`/ps/${roomCode.value}`, '_blank')
}

const copied = ref(false)
async function copyPublicScreenUrl() {
  try {
    await navigator.clipboard.writeText(psFullUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback: select from a temporary input
    const input = document.createElement('input')
    input.value = psFullUrl.value
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    input.remove()
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

const canShare = ref(false)
onMounted(() => {
  canShare.value = typeof navigator !== 'undefined' && !!navigator.share
})

async function sharePublicScreenUrl() {
  try {
    await navigator.share({
      title: 'Symbol Rush — Public Screen',
      text: `Join Symbol Rush! Room: ${roomCode.value}`,
      url: psFullUrl.value,
    })
  } catch {
    // User cancelled or share failed — silently ignore
  }
}

// ── Computed ──
const secondsRemaining = computed(() => Math.ceil(timeRemainingMs.value / 1000))
const timerPercent = computed(() =>
  Math.max(0, (timeRemainingMs.value / sessionDuration.value) * 100),
)
const timerUrgent = computed(() => timeRemainingMs.value < 8000)

useHead({ title: 'Symbol Rush — Host Panel' })
</script>

<template>
  <div class="host-panel grid-bg">
    <div class="panel">
      <!-- Header -->
      <div class="panel-header">
        <h1 class="panel-title">SYMBOL<span class="rush">RUSH</span></h1>
        <span class="connection-dot" :class="{ connected }" />
      </div>

      <!-- Connecting -->
      <div v-if="phase === 'connecting'" class="section">
        <p class="mono muted">Creating room...</p>
      </div>

      <template v-else>
        <!-- Room info -->
        <div class="section room-info">
          <div class="room-code-row">
            <span class="label">Room</span>
            <span class="room-code mono">{{ roomCode }}</span>
          </div>
          <div class="room-meta">
            <span class="status-pill mono" :class="phase">{{ phase }}</span>
            <span v-if="roundCount > 0" class="mono muted">Round {{ roundCount }}</span>
          </div>
        </div>

        <!-- Public Screen actions -->
        <div class="section">
          <h2 class="section-title">Public Screen</h2>
          <div class="ps-actions">
            <button class="ps-btn" @click="openPublicScreen">
              <span class="ps-btn-icon">⤴</span>
              <span>Open</span>
            </button>
            <button class="ps-btn" @click="copyPublicScreenUrl">
              <span class="ps-btn-icon">{{ copied ? '✅' : '📋' }}</span>
              <span>{{ copied ? 'Copied!' : 'Copy URL' }}</span>
            </button>
            <button v-if="canShare" class="ps-btn" @click="sharePublicScreenUrl">
              <span class="ps-btn-icon">📤</span>
              <span>Share</span>
            </button>
          </div>
          <p class="ps-url mono muted">{{ psFullUrl }}</p>
        </div>

        <!-- Players -->
        <div class="section">
          <h2 class="section-title">
            Players <span class="count-badge mono">{{ players.length }}</span>
          </h2>
          <div v-if="players.length === 0" class="empty-state muted">
            No players yet — share the room code
          </div>
          <div v-else class="player-list">
            <div
              v-for="player in players"
              :key="player.id"
              class="player-row"
            >
              <span class="player-name">{{ player.username }}</span>
              <span class="player-score mono cyan">
                {{ leaderboard.find(e => e.playerId === player.id)?.bestScore ?? 0 }}
              </span>
            </div>
          </div>
        </div>

        <!-- Playing state -->
        <div v-if="phase === 'playing'" class="section playing-section">
          <div class="mini-timer-bar">
            <div class="mini-timer-fill" :class="{ urgent: timerUrgent }" :style="{ width: timerPercent + '%' }" />
          </div>
          <div class="playing-info">
            <span class="mono muted">Current symbol:</span>
            <span class="current-symbol">{{ currentSymbol }}</span>
            <span class="mono muted">{{ secondsRemaining }}s left</span>
          </div>
        </div>

        <!-- Round results -->
        <div v-if="phase === 'results' && sessionScores.length > 0" class="section">
          <h2 class="section-title">Last Round</h2>
          <div class="round-scores">
            <div v-for="(s, i) in sessionScores.slice(0, 5)" :key="s.playerId" class="score-row">
              <span class="score-rank mono muted">#{{ i + 1 }}</span>
              <span class="score-name">{{ s.username }}</span>
              <span class="score-val mono cyan">{{ s.score }}</span>
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="section controls">
          <button
            v-if="phase === 'lobby' || phase === 'results'"
            class="btn-start"
            :disabled="players.length === 0"
            @click="startRound"
          >
            {{ phase === 'results' ? 'Next Round' : 'Start Round' }}
          </button>
          <p v-if="phase === 'playing'" class="mono muted">Round in progress...</p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.host-panel {
  min-height: 100dvh;
  display: flex;
  justify-content: center;
  padding: 32px 24px;
}

.panel {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  z-index: 1;
}

/* ── Header ── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 24px;
}

.panel-title {
  font-family: 'Azeret Mono', monospace;
  font-weight: 900;
  font-size: 1.2rem;
  color: var(--cyan);
  letter-spacing: 0.04em;
}

.rush {
  color: var(--muted);
}

/* ── Sections ── */
.section {
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.section:last-child {
  border-bottom: none;
}

.section-title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-badge {
  font-size: 0.75rem;
  background: var(--surface2);
  padding: 2px 8px;
  border-radius: 10px;
  color: var(--text);
}

/* ── Room info ── */
.room-code-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.label {
  font-size: 0.85rem;
  color: var(--muted);
}

.room-code {
  font-weight: 900;
  font-size: 2rem;
  color: var(--cyan);
  letter-spacing: 0.08em;
  text-shadow: 0 0 20px var(--cyan-glow);
}

.room-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-pill {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 10px;
  border-radius: 8px;
}

.status-pill.lobby {
  color: var(--cyan);
  background: var(--cyan-dim);
}

.status-pill.playing {
  color: var(--green);
  background: var(--green-dim);
}

.status-pill.results {
  color: var(--gold);
  background: var(--gold-dim);
}

/* ── Public Screen actions ── */
.ps-actions {
  display: flex;
  gap: 8px;
}

.ps-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: var(--surface2);
  border: 1.5px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: var(--text);
  cursor: pointer;
  font-family: 'Azeret Mono', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  transition: all 0.15s ease;
}

.ps-btn:hover {
  border-color: var(--cyan);
  background: var(--cyan-dim);
  color: var(--cyan);
}

.ps-btn:active {
  transform: scale(0.95);
}

.ps-btn-icon {
  font-size: 1.2rem;
}

.ps-url {
  font-size: 0.7rem;
  margin-top: 8px;
  word-break: break-all;
}

/* ── Players ── */
.empty-state {
  font-size: 0.85rem;
  padding: 12px 0;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.player-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--surface);
  border-radius: 8px;
}

.player-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 0.9rem;
}

.player-score {
  font-weight: 700;
  font-size: 0.85rem;
}

/* ── Playing info ── */
.playing-section {
  padding-top: 12px;
}

.mini-timer-bar {
  height: 3px;
  background: var(--surface);
  border-radius: 2px;
  margin-bottom: 12px;
  overflow: hidden;
}

.mini-timer-fill {
  height: 100%;
  background: var(--cyan);
  transition: width 0.1s linear;
}

.mini-timer-fill.urgent {
  background: var(--magenta);
}

.playing-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-symbol {
  font-size: 1.5rem;
}

/* ── Round scores ── */
.round-scores {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--surface);
  border-radius: 8px;
  font-size: 0.85rem;
}

.score-rank {
  min-width: 28px;
  font-size: 0.75rem;
}

.score-name {
  flex: 1;
  font-family: 'Outfit', sans-serif;
}

.score-val {
  font-weight: 700;
}

/* ── Controls ── */
.controls {
  padding-top: 20px;
}

.btn-start {
  font-family: 'Azeret Mono', monospace;
  font-weight: 700;
  font-size: 1rem;
  width: 100%;
  padding: 14px;
  background: var(--cyan);
  color: var(--bg);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  transition: all 0.15s ease;
}

.btn-start:hover {
  box-shadow: 0 0 24px var(--cyan-glow);
}

.btn-start:active {
  transform: scale(0.97);
}

.btn-start:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
