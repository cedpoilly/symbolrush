<script setup lang="ts">
import { SYMBOLS } from '~/types/game'
import type { Symbol, LeaderboardEntry } from '~/types/game'

const route = useRoute()
const roomCode = computed(() => (route.params.roomCode as string).toUpperCase())
const username = computed(() => (route.query.u as string) || '')

const { connected, connect, send, on } = useGameSocket()

const phase = ref<'connecting' | 'waiting' | 'playing' | 'results'>('connecting')
const playerId = ref('')
const score = ref(0)
const roundScore = ref(0)
const personalBest = ref(0)
const timeRemainingMs = ref(30_000)
const sessionDuration = ref(30_000)
const symbolChoices = ref<Symbol[]>([])
const leaderboard = ref<LeaderboardEntry[]>([])
const leaderboardRank = ref(0)
const scoreFlash = ref('')
const lastTapPos = ref<{ x: number; y: number } | null>(null)

// ── Redirect if no username ──
onMounted(() => {
  if (!username.value) {
    navigateTo(`/?room=${roomCode.value}`)
    return
  }

  connect()
  const unwatch = watch(connected, (isConnected) => {
    if (isConnected) {
      send({ type: 'player:join', roomCode: roomCode.value, username: username.value })
      unwatch()
    }
  }, { immediate: true })
})

// ── Handlers ──
on('room:status', (msg) => {
  if (msg.type !== 'room:status') return
  if (phase.value === 'connecting') phase.value = 'waiting'
})

on('room:player-joined', (msg) => {
  if (msg.type !== 'room:player-joined') return
  if (msg.player.username.toLowerCase() === username.value.toLowerCase()) {
    playerId.value = msg.player.id
  }
})

on('session:started', (msg) => {
  if (msg.type !== 'session:started') return
  phase.value = 'playing'
  score.value = 0
  sessionDuration.value = msg.endsAt - Date.now()
  timeRemainingMs.value = sessionDuration.value
  symbolChoices.value = msg.symbolChoices
})

on('session:tick', (msg) => {
  if (msg.type !== 'session:tick') return
  timeRemainingMs.value = msg.timeRemainingMs
})

on('player:tap-result', (msg) => {
  if (msg.type !== 'player:tap-result') return
  score.value = msg.score
  showFeedback(msg.correct, msg.delta)
})

on('session:ended', (msg) => {
  if (msg.type !== 'session:ended') return
  phase.value = 'results'
  roundScore.value = score.value
})

on('leaderboard:update', (msg) => {
  if (msg.type !== 'leaderboard:update') return
  leaderboard.value = msg.leaderboard
  const me = msg.leaderboard.find(e => e.playerId === playerId.value)
  if (me) {
    personalBest.value = me.bestScore
    leaderboardRank.value = msg.leaderboard.indexOf(me) + 1
  }
})

on('error', (msg) => {
  if (msg.type !== 'error') return
  console.error('[SymbolRush]', msg.message)
})

// ── Computed ──
const timerPercent = computed(() =>
  Math.max(0, (timeRemainingMs.value / sessionDuration.value) * 100),
)
const timerUrgent = computed(() => timeRemainingMs.value < 8000)
const secondsRemaining = computed(() => Math.ceil(timeRemainingMs.value / 1000))

// ── Tap handling ──
function handleTap(event: MouseEvent, symbol: Symbol) {
  lastTapPos.value = { x: event.clientX, y: event.clientY }
  send({ type: 'player:tap', symbol })
}

function showFeedback(correct: boolean, delta: number) {
  // Score flash
  scoreFlash.value = correct ? 'flash-green' : 'flash-red'
  setTimeout(() => { scoreFlash.value = '' }, 200)

  if (!lastTapPos.value) return
  const { x, y } = lastTapPos.value

  // Ripple
  const ripple = document.createElement('div')
  ripple.className = `ripple ${correct ? 'ripple-correct' : 'ripple-wrong'}`
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  document.body.appendChild(ripple)
  setTimeout(() => ripple.remove(), 400)

  // Floating score
  const float = document.createElement('div')
  float.className = `float-score ${correct ? 'float-correct' : 'float-wrong'}`
  float.textContent = delta > 0 ? `+${delta}` : String(delta)
  float.style.left = `${x}px`
  float.style.top = `${y}px`
  document.body.appendChild(float)
  setTimeout(() => float.remove(), 700)
}

useHead({
  title: `Symbol Rush — Playing`,
  bodyAttrs: { class: 'no-scroll' },
})
</script>

<template>
  <div class="player grid-bg grid-bg-phone">
    <!-- Timer bar -->
    <div v-if="phase === 'playing'" class="timer-bar-container">
      <div class="timer-bar" :class="{ urgent: timerUrgent }" :style="{ width: timerPercent + '%' }" />
    </div>

    <!-- Connecting -->
    <div v-if="phase === 'connecting'" class="center-screen">
      <p class="mono muted">Joining room...</p>
    </div>

    <!-- Waiting -->
    <div v-else-if="phase === 'waiting'" class="phase-screen waiting">
      <span class="eye">👀</span>
      <h1 class="phase-heading cyan">You're in!</h1>
      <p class="room-label">Room: <strong>{{ roomCode }}</strong></p>
      <p class="muted wait-text">Watch the projector — game starts any moment</p>
      <span class="username-pill mono">playing as {{ username }}</span>
    </div>

    <!-- Playing -->
    <div v-else-if="phase === 'playing'" class="phase-screen game-screen">
      <div class="hud">
        <span class="hud-timer mono muted">{{ secondsRemaining }}s</span>
        <span class="hud-score mono" :class="scoreFlash">{{ score }}</span>
      </div>
      <p class="instruction mono muted">TAP THE SYMBOL ON SCREEN!</p>
      <div class="symbol-grid">
        <button
          v-for="s in symbolChoices"
          :key="s"
          class="symbol-btn"
          @click="handleTap($event, s)"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <!-- Results -->
    <div v-else-if="phase === 'results'" class="phase-screen results-screen">
      <p class="label-text mono muted">Round over</p>
      <h1 class="phase-heading cyan">Nice run!</h1>
      <div class="score-cards">
        <div class="score-card">
          <span class="score-card-label">Round Score</span>
          <span class="score-card-value mono">{{ roundScore }}</span>
        </div>
        <div class="score-card">
          <span class="score-card-label">Personal Best</span>
          <span class="score-card-value mono gold">{{ personalBest }}</span>
        </div>
      </div>
      <span class="rank-pill mono cyan">#{{ leaderboardRank }} on leaderboard</span>
      <p class="muted">Next round starting soon...</p>
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
.player {
  min-height: 100dvh;
  position: relative;
  overscroll-behavior: none;
  -webkit-user-select: none;
  user-select: none;
}

.phase-screen {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  z-index: 1;
}

/* ── Waiting ── */
.eye {
  font-size: 3rem;
  margin-bottom: 16px;
}

.phase-heading {
  font-family: 'Azeret Mono', monospace;
  font-weight: 900;
  font-size: 1.8rem;
  margin-bottom: 12px;
}

.room-label {
  font-size: 1rem;
  margin-bottom: 4px;
}

.wait-text {
  font-size: 0.9rem;
  margin-bottom: 24px;
  text-align: center;
}

.username-pill {
  font-size: 0.75rem;
  color: var(--muted);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 20px;
}

/* ── Playing ── */
.game-screen {
  justify-content: flex-start;
  padding-top: 24px;
  gap: 16px;
}

.hud {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.hud-timer {
  font-size: 1rem;
}

.hud-score {
  font-weight: 900;
  font-size: 1.5rem;
  color: var(--cyan);
  transition: color 0.1s;
}

.instruction {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.symbol-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  max-width: 340px;
  margin-top: auto;
  margin-bottom: auto;
}

.symbol-btn {
  aspect-ratio: 1;
  font-size: 40px;
  background: var(--surface2);
  border: 2px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: transform 0.1s;
}

.symbol-btn:active {
  transform: scale(0.93);
}

/* ── Results ── */
.results-screen {
  gap: 16px;
}

.label-text {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.score-cards {
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 340px;
}

.score-card {
  flex: 1;
  background: var(--surface);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.score-card-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  color: var(--muted);
}

.score-card-value {
  font-weight: 900;
  font-size: 2rem;
  color: var(--cyan);
}

.rank-pill {
  font-size: 0.85rem;
  padding: 8px 18px;
  border: 1px solid rgba(0, 232, 255, 0.25);
  border-radius: 20px;
  margin: 8px 0;
}
</style>
