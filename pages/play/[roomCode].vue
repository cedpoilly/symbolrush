<script setup lang="ts">
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

const scoreFloatRef = ref<{ show: (x: number, y: number, correct: boolean, delta: number) => void } | null>(null)
const scoreDisplayRef = ref<{ flash: (correct: boolean) => void } | null>(null)
const lastTapPos = ref<{ x: number; y: number } | null>(null)

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
  scoreDisplayRef.value?.flash(msg.correct)
  if (lastTapPos.value) {
    scoreFloatRef.value?.show(lastTapPos.value.x, lastTapPos.value.y, msg.correct, msg.delta)
  }
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

const secondsRemaining = computed(() => Math.ceil(timeRemainingMs.value / 1000))

function handleTap(event: MouseEvent, symbol: Symbol) {
  lastTapPos.value = { x: event.clientX, y: event.clientY }
  send({ type: 'player:tap', symbol })
}

useHead({
  title: 'Symbol Rush — Playing',
  bodyAttrs: { class: 'no-scroll' },
})
</script>

<template>
  <div class="grid-bg grid-bg-phone min-h-dvh relative overscroll-none select-none">
    <TimerBar
      v-if="phase === 'playing'"
      :time-remaining-ms="timeRemainingMs"
      :total-duration-ms="sessionDuration"
    />
    <ScoreFloat ref="scoreFloatRef" />

    <h1 class="sr-only">Symbol Rush — Game</h1>

    <!-- Connecting -->
    <div v-if="phase === 'connecting'" class="min-h-dvh flex items-center justify-center relative z-1">
      <p class="font-mono text-neutral-300">Joining room...</p>
    </div>

    <!-- Waiting -->
    <div v-else-if="phase === 'waiting'" class="min-h-dvh flex flex-col items-center justify-center p-6 relative z-1 gap-4">
      <span class="text-5xl">👀</span>
      <h1 class="font-mono font-black text-3xl text-primary">You're in!</h1>
      <p>Room: <strong>{{ roomCode }}</strong></p>
      <p class="text-neutral-300 text-sm text-center">Watch the projector — game starts any moment</p>
      <UBadge variant="outline" color="neutral" size="sm">
        <span class="font-mono">playing as {{ username }}</span>
      </UBadge>
    </div>

    <!-- Playing -->
    <div v-else-if="phase === 'playing'" class="min-h-dvh flex flex-col items-center justify-between pt-6 pb-16 px-6 relative z-1">
      <div class="w-full flex justify-between items-center px-1">
        <span class="font-mono text-neutral-300">{{ secondsRemaining }}s</span>
        <ScoreDisplay ref="scoreDisplayRef" :score="score" />
      </div>
      <p class="font-mono text-neutral-300 text-xs uppercase tracking-widest mt-4">
        TAP THE SYMBOL ON SCREEN!
      </p>
      <SymbolGrid
        :symbols="symbolChoices"
        class="my-auto"
        @tap="handleTap"
      />
    </div>

    <!-- Results -->
    <div v-else-if="phase === 'results'" class="min-h-dvh flex flex-col items-center justify-center p-6 relative z-1 gap-4">
      <p class="font-mono text-neutral-300 text-xs uppercase tracking-widest">Round over</p>
      <h1 class="font-mono font-black text-3xl text-primary">
        {{ roundScore > 0 ? 'Nice run!' : roundScore === 0 ? 'Warm up round!' : 'Keep going!' }}
      </h1>
      <div class="flex gap-4 w-full max-w-[340px]">
        <UCard variant="subtle" :ui="{ body: 'p-4 text-center' }" class="flex-1">
          <span class="text-xs text-neutral-300 block mb-1">Round Score</span>
          <span class="font-mono font-black text-3xl text-primary">{{ roundScore }}</span>
        </UCard>
        <UCard variant="subtle" :ui="{ body: 'p-4 text-center' }" class="flex-1">
          <span class="text-xs text-neutral-300 block mb-1">Personal Best</span>
          <span class="font-mono font-black text-3xl text-warning">{{ personalBest }}</span>
        </UCard>
      </div>
      <UBadge variant="outline" color="primary" size="md">
        <span class="font-mono">#{{ leaderboardRank }} on leaderboard</span>
      </UBadge>
      <p class="text-neutral-300 text-sm">Next round starting soon...</p>
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
