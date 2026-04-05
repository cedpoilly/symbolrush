<script setup lang="ts">
import type { SessionScore, LeaderboardEntry, Symbol } from '~/types/game'

const route = useRoute()
const roomCode = computed(() => (route.params.roomCode as string).toUpperCase())

const { connected, connect, send, on } = useGameSocket()

const LOBBY_COUNTDOWN_S = 60
const RESULTS_COUNTDOWN_S = 15

const phase = ref<'connecting' | 'lobby' | 'playing' | 'results'>('connecting')
const players = ref<Array<{ id: string; username: string }>>([])
const currentSymbol = ref<Symbol | null>(null)
const timeRemainingMs = ref(30_000)
const sessionDuration = ref(30_000)
const sessionScores = ref<SessionScore[]>([])
const roundScores = ref<SessionScore[]>([])
const leaderboard = ref<LeaderboardEntry[]>([])
const recentJoins = ref<Array<{ id: string; username: string; ts: number }>>([])

const lobbyCountdown = ref(LOBBY_COUNTDOWN_S)
let countdownInterval: ReturnType<typeof setInterval> | null = null

function startCountdown(seconds: number) {
  stopCountdown()
  lobbyCountdown.value = seconds
  countdownInterval = setInterval(() => {
    lobbyCountdown.value--
    if (lobbyCountdown.value <= 0) {
      stopCountdown()
      send({ type: 'host:start-session' })
    }
  }, 1000)
}

function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

onUnmounted(() => stopCountdown())

onMounted(() => {
  connect()
  const unwatch = watch(connected, (isConnected) => {
    if (isConnected) {
      send({ type: 'screen:join', roomCode: roomCode.value })
      unwatch()
    }
  }, { immediate: true })
})

on('room:status', (msg) => {
  if (msg.type !== 'room:status') return
  if (phase.value === 'connecting') {
    phase.value = 'lobby'
    startCountdown(LOBBY_COUNTDOWN_S)
  }
})

on('room:player-joined', (msg) => {
  if (msg.type !== 'room:player-joined') return
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
  stopCountdown()
  roundScores.value = []
  phase.value = 'playing'
  sessionDuration.value = msg.endsAt - Date.now()
  timeRemainingMs.value = sessionDuration.value
})

on('session:scores-update', (msg) => {
  if (msg.type !== 'session:scores-update') return
  roundScores.value = msg.scores
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
  startCountdown(RESULTS_COUNTDOWN_S)
})

on('leaderboard:update', (msg) => {
  if (msg.type !== 'leaderboard:update') return
  leaderboard.value = msg.leaderboard
})

on('error', (msg) => {
  if (msg.type !== 'error') return
  console.error('[PS]', msg.message)
})

const secondsRemaining = computed(() => Math.ceil(timeRemainingMs.value / 1000))

useHead({
  title: 'Symbol Rush — Public Screen',
  bodyAttrs: { class: 'no-scroll' },
})
</script>

<template>
  <div class="grid-bg min-h-dvh relative">
    <TimerBar
      v-if="phase === 'playing'"
      :time-remaining-ms="timeRemainingMs"
      :total-duration-ms="sessionDuration"
    />

    <!-- Connecting -->
    <h1 class="sr-only">Symbol Rush — Public Screen</h1>

    <div v-if="phase === 'connecting'" class="min-h-dvh flex items-center justify-center relative z-1">
      <p class="font-mono text-neutral-300">Connecting to room...</p>
    </div>

    <!-- Lobby -->
    <div v-else-if="phase === 'lobby'" class="min-h-dvh grid grid-cols-[3fr_1fr] relative z-1 p-10 gap-6">
      <div class="flex flex-col items-center justify-center gap-6">
        <div class="text-center">
          <span class="block font-mono text-sm text-neutral-300 uppercase tracking-[0.15em] mb-2">SCAN TO JOIN</span>
        </div>
        <QRJoinDisplay :room-code="roomCode" />
      </div>

      <div class="flex flex-col gap-3 py-5 self-center">
        <template v-if="players.length > 0">
          <p class="font-mono text-sm text-neutral-300">
            <span class="font-bold text-neutral-100">{{ players.length }}</span> player{{ players.length !== 1 ? 's' : '' }}
          </p>
          <div class="flex flex-col gap-1.5 overflow-hidden max-h-[60vh]">
            <UBadge
              v-for="player in players"
              :key="player.id"
              color="success"
              variant="subtle"
              size="sm"
            >
              {{ player.username }}
            </UBadge>
          </div>
        </template>
        <p class="font-mono text-sm text-neutral-300 mt-auto">
          Starts in <span class="font-bold text-primary">{{ lobbyCountdown }}</span>s
        </p>
      </div>
    </div>

    <!-- Playing -->
    <div v-else-if="phase === 'playing'" class="min-h-dvh grid grid-cols-[3fr_1fr] relative z-1 p-10 gap-6">
      <!-- Symbol (3/4) -->
      <div class="flex flex-col items-center justify-center gap-5">
        <div class="flex items-center justify-center">
          <Transition name="symbol" mode="out-in">
            <span
              :key="currentSymbol"
              class="font-mono text-[clamp(80px,20vw,160px)] leading-none text-neutral-100"
              style="text-shadow: 0 0 40px rgba(255,255,255,0.1)"
            >
              {{ currentSymbol }}
            </span>
          </Transition>
        </div>
        <p class="font-mono text-2xl text-neutral-300">
          <span class="font-bold text-neutral-100">{{ secondsRemaining }}</span>s
        </p>
      </div>

      <!-- Live round scores sidebar (1/4) -->
      <div class="flex flex-col gap-2 pt-16 self-start overflow-y-auto max-h-[calc(100dvh-80px)]">
        <h3 class="font-mono text-xs text-neutral-300 uppercase tracking-widest mb-1">Round Scores</h3>
        <div
          v-for="(s, i) in roundScores"
          :key="s.playerId"
          class="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 rounded-lg text-sm"
        >
          <span class="font-mono text-xs text-neutral-400 min-w-[24px]">#{{ i + 1 }}</span>
          <span class="flex-1 truncate">{{ s.username }}</span>
          <span class="font-mono font-bold text-primary text-sm">{{ s.score }}</span>
        </div>
        <p v-if="roundScores.length === 0" class="text-sm text-neutral-400">Waiting for taps...</p>
      </div>
    </div>

    <!-- Results -->
    <div v-else-if="phase === 'results'" class="min-h-dvh flex flex-col items-center justify-center gap-6 p-10 relative z-1">
      <h2 class="font-mono text-sm text-neutral-300 uppercase tracking-[0.15em]">BEST SCORES</h2>
      <Leaderboard :entries="leaderboard" :session-scores="sessionScores" />
      <p class="font-mono text-sm text-neutral-300">
        Next round in <span class="font-bold text-primary">{{ lobbyCountdown }}</span>s
      </p>
    </div>

    <!-- Bottom bar -->
    <div class="fixed bottom-0 left-0 right-0 px-6 py-4 flex items-center justify-between z-50">
      <span class="font-mono font-bold text-xs tracking-wide">
        <span class="text-primary">SYMBOL</span><span class="text-neutral-300">RUSH</span>
      </span>
      <span
        class="w-2 h-2 rounded-full transition-colors"
        :class="connected ? 'bg-success shadow-[0_0_6px_rgba(0,255,136,0.4)]' : 'bg-error'"
      />
    </div>
  </div>
</template>
