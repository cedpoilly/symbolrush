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

onMounted(() => {
  connect()
  const unwatch = watch(connected, (isConnected) => {
    if (isConnected) {
      send({ type: 'host:create-room' })
      unwatch()
    }
  }, { immediate: true })
})

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

function startRound() {
  send({ type: 'host:start-session' })
}

const psFullUrl = computed(() => {
  if (!roomCode.value || import.meta.server) return ''
  return `${window.location.origin}/ps/${roomCode.value}`
})

const joinUrl = computed(() => {
  if (!roomCode.value || import.meta.server) return ''
  return `${window.location.origin}/?room=${roomCode.value}`
})

function openPublicScreen() {
  window.open(`/ps/${roomCode.value}`, '_blank')
}

const toast = useToast()
async function copyUrl(url: string, label: string) {
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    input.remove()
  }
  toast.add({ title: `${label} copied!`, color: 'success' })
}

const canShare = ref(false)
onMounted(() => {
  canShare.value = typeof navigator !== 'undefined' && !!navigator.share
})

async function shareUrl(url: string, title: string, text: string) {
  try {
    await navigator.share({ title, text, url })
  } catch { /* User cancelled */ }
}

const secondsRemaining = computed(() => Math.ceil(timeRemainingMs.value / 1000))
const timerPercent = computed(() =>
  Math.max(0, (timeRemainingMs.value / sessionDuration.value) * 100),
)
const timerUrgent = computed(() => timeRemainingMs.value < 8000)

const playerScores = computed(() => {
  const map: Record<string, number> = {}
  for (const entry of leaderboard.value) {
    map[entry.playerId] = entry.bestScore
  }
  return map
})

useHead({ title: 'Symbol Rush — Host Panel' })
</script>

<template>
  <div class="grid-bg min-h-dvh flex justify-center p-8">
    <div class="w-full max-w-[480px] flex flex-col relative z-1">
      <!-- Header -->
      <div class="flex items-center justify-between pb-6 mb-6 border-b border-neutral-800">
        <h1 class="font-mono font-black text-xl text-primary tracking-wide">
          SYMBOL<span class="text-neutral-400">RUSH</span>
        </h1>
        <span
          class="w-2 h-2 rounded-full transition-colors"
          :class="connected ? 'bg-success shadow-[0_0_6px_rgba(0,255,136,0.4)]' : 'bg-error'"
        />
      </div>

      <!-- Connecting -->
      <div v-if="phase === 'connecting'" class="py-4">
        <p class="font-mono text-neutral-400">Creating room...</p>
      </div>

      <template v-else>
        <!-- Room info -->
        <div class="py-4 border-b border-neutral-900">
          <div class="flex items-baseline gap-3 mb-2">
            <span class="text-sm text-neutral-400">Room</span>
            <RoomCodeDisplay :code="roomCode" size="sm" />
          </div>
          <GameStatusBanner :status="phase" :round-count="roundCount" />
        </div>

        <!-- Join Link -->
        <div class="py-4 border-b border-neutral-900">
          <h2 class="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Join Link</h2>
          <div class="flex gap-2">
            <UButton variant="soft" color="neutral" size="sm" icon="i-lucide-copy" @click="copyUrl(joinUrl, 'Join link')">
              Copy
            </UButton>
            <UButton v-if="canShare" variant="soft" color="neutral" size="sm" icon="i-lucide-share" @click="shareUrl(joinUrl, 'Join Symbol Rush', `Join Symbol Rush! Room: ${roomCode}`)">
              Share
            </UButton>
          </div>
          <p class="font-mono text-xs text-neutral-500 mt-2 break-all">{{ joinUrl }}</p>
        </div>

        <!-- Public Screen actions -->
        <div class="py-4 border-b border-neutral-900">
          <h2 class="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Public Screen</h2>
          <div class="flex gap-2">
            <UButton variant="soft" color="neutral" size="sm" icon="i-lucide-external-link" @click="openPublicScreen">
              Open
            </UButton>
            <UButton variant="soft" color="neutral" size="sm" icon="i-lucide-copy" @click="copyUrl(psFullUrl, 'PS link')">
              Copy URL
            </UButton>
            <UButton v-if="canShare" variant="soft" color="neutral" size="sm" icon="i-lucide-share" @click="shareUrl(psFullUrl, 'Symbol Rush — Public Screen', `Join Symbol Rush! Room: ${roomCode}`)">
              Share
            </UButton>
          </div>
          <p class="font-mono text-xs text-neutral-500 mt-2 break-all">{{ psFullUrl }}</p>
        </div>

        <!-- Players -->
        <div class="py-4 border-b border-neutral-900">
          <h2 class="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            Players
            <UBadge variant="subtle" color="neutral" size="xs">{{ players.length }}</UBadge>
          </h2>
          <PlayerList :players="players" :scores="playerScores" />
        </div>

        <!-- Playing state -->
        <div v-if="phase === 'playing'" class="py-4 border-b border-neutral-900">
          <div class="h-[3px] bg-neutral-800 rounded-full mb-3 overflow-hidden">
            <div
              class="h-full transition-[width] duration-100"
              :class="timerUrgent ? 'bg-secondary' : 'bg-primary'"
              :style="{ width: timerPercent + '%' }"
            />
          </div>
          <div class="flex items-center gap-3">
            <span class="font-mono text-sm text-neutral-400">Current symbol:</span>
            <span class="text-2xl">{{ currentSymbol }}</span>
            <span class="font-mono text-sm text-neutral-400">{{ secondsRemaining }}s left</span>
          </div>
        </div>

        <!-- Round results -->
        <div v-if="phase === 'results' && sessionScores.length > 0" class="py-4 border-b border-neutral-900">
          <h2 class="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Last Round</h2>
          <div class="flex flex-col gap-1">
            <div
              v-for="(s, i) in sessionScores.slice(0, 5)"
              :key="s.playerId"
              class="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 rounded-lg text-sm"
            >
              <span class="font-mono text-xs text-neutral-400 min-w-[28px]">#{{ i + 1 }}</span>
              <span class="flex-1">{{ s.username }}</span>
              <span class="font-mono font-bold text-primary">{{ s.score }}</span>
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="pt-5">
          <UButton
            v-if="phase === 'lobby' || phase === 'results'"
            block
            size="lg"
            :disabled="players.length === 0"
            @click="startRound"
          >
            {{ phase === 'results' ? 'Next Round' : 'Start Round' }}
          </UButton>
          <p v-if="phase === 'playing'" class="font-mono text-neutral-400 text-sm">
            Round in progress...
          </p>
        </div>
      </template>
    </div>
  </div>
</template>
