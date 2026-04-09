# Round Triggering Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add auto-loop and manual round triggering modes with a mid-session toggle, configurable pause between rounds, optional round limit, and idle auto-start safety net.

**Architecture:** Extend `RoomConfig` and `Room` with auto-loop fields, add timer management functions to `game-engine.ts`, wire new `host:set-auto-loop` message through `ws.ts`, and add a toggle + countdown to the host UI.

**Tech Stack:** Nuxt 4, TypeScript, WebSocket (Nitro), Vue 3 Composition API, Nuxt UI

---

### File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `types/game.ts` | Modify | Add config fields, Room fields, new message types |
| `server/utils/game-engine.ts` | Modify | Add auto-start timer management, roundsPlayed tracking |
| `server/api/ws.ts` | Modify | Handle `host:set-auto-loop`, integrate timers with stopGameLoop |
| `pages/host/index.vue` | Modify | Auto-loop toggle, pause config, countdown display |

---

### Task 1: Extend types

**Files:**
- Modify: `types/game.ts`

- [ ] **Step 1: Add new fields to RoomConfig**

In `types/game.ts`, add the new config fields after `symbolCount`:

```typescript
export interface RoomConfig {
  sessionDurationMs: number
  symbolIntervalMs: number
  pointsCorrect: number
  pointsPenalty: number
  symbolCount: number
  autoLoop: boolean
  pauseBetweenRoundsMs: number
  autoStartDelayMs: number
  maxRounds: number | null
}

export const DEFAULT_ROOM_CONFIG: RoomConfig = {
  sessionDurationMs: 30_000,
  symbolIntervalMs: 3_000,
  pointsCorrect: 10,
  pointsPenalty: -5,
  symbolCount: 4,
  autoLoop: false,
  pauseBetweenRoundsMs: 25_000,
  autoStartDelayMs: 120_000,
  maxRounds: null,
}
```

- [ ] **Step 2: Add roundsPlayed to Room interface**

```typescript
export interface Room {
  code: string
  status: RoomStatus
  config: RoomConfig
  hostConnected: boolean
  currentSession: GameSession | null
  players: Map<string, Player>
  roundsPlayed: number
}
```

- [ ] **Step 3: Add new message types**

Add to `ClientMessage`:

```typescript
export type ClientMessage =
  | { type: 'host:create-room'; config?: Partial<RoomConfig> }
  | { type: 'host:start-session' }
  | { type: 'host:end-room' }
  | { type: 'host:set-auto-loop'; enabled: boolean }
  | { type: 'screen:join'; roomCode: string }
  | { type: 'player:join'; roomCode: string; username: string }
  | { type: 'player:tap'; symbol: Symbol }
```

Add to `ServerMessage`:

```typescript
export type ServerMessage =
  | { type: 'room:created'; roomCode: string }
  | { type: 'room:player-joined'; player: { id: string; username: string } }
  | { type: 'room:player-left'; playerId: string }
  | { type: 'room:status'; status: RoomStatus; playerCount: number }
  | { type: 'room:auto-loop-changed'; enabled: boolean }
  | { type: 'room:next-round-at'; timestamp: number }
  | { type: 'session:started'; endsAt: number; symbolChoices: Symbol[] }
  | { type: 'session:symbol-change'; symbol: Symbol; symbolChoices: Symbol[] }
  | { type: 'session:tick'; timeRemainingMs: number }
  | { type: 'session:scores-update'; scores: SessionScore[] }
  | { type: 'session:ended'; scores: SessionScore[] }
  | { type: 'player:tap-result'; correct: boolean; score: number; delta: number }
  | { type: 'leaderboard:update'; leaderboard: LeaderboardEntry[] }
  | { type: 'error'; message: string }
```

- [ ] **Step 4: Commit**

```bash
git add types/game.ts
git commit -m "feat: add auto-loop types and message definitions"
```

---

### Task 2: Add timer management to game engine

**Files:**
- Modify: `server/utils/game-engine.ts`

- [ ] **Step 1: Add roundsPlayed to createRoom**

Update `createRoom` to initialize `roundsPlayed`:

```typescript
export function createRoom(config?: Partial<RoomConfig>): Room {
  let code: string
  do {
    code = generateRoomCode()
  } while (rooms.has(code))

  const room: Room = {
    code,
    status: 'waiting',
    config: { ...DEFAULT_ROOM_CONFIG, ...config },
    hostConnected: true,
    currentSession: null,
    players: new Map(),
    roundsPlayed: 0,
  }
  rooms.set(code, room)
  return room
}
```

- [ ] **Step 2: Increment roundsPlayed in startSession**

At the end of `startSession`, before the return statement, add:

```typescript
  room.roundsPlayed++
  room.currentSession = session
  room.status = 'playing'
  return session
```

- [ ] **Step 3: Add auto-start timer management**

Add a timer map and three exported functions after the existing room management functions:

```typescript
const autoStartTimers = new Map<string, ReturnType<typeof setTimeout>>()

export function scheduleAutoStart(roomCode: string, delayMs: number, onStart: () => void): void {
  cancelAutoStart(roomCode)
  const timer = setTimeout(() => {
    autoStartTimers.delete(roomCode)
    onStart()
  }, delayMs)
  autoStartTimers.set(roomCode, timer)
}

export function cancelAutoStart(roomCode: string): void {
  const timer = autoStartTimers.get(roomCode)
  if (timer) {
    clearTimeout(timer)
    autoStartTimers.delete(roomCode)
  }
}

export function setAutoLoop(roomCode: string, enabled: boolean): boolean {
  const room = rooms.get(roomCode)
  if (!room) return false
  room.config.autoLoop = enabled
  return true
}
```

- [ ] **Step 4: Add canAutoStartNextRound helper**

```typescript
export function canAutoStartNextRound(roomCode: string): boolean {
  const room = rooms.get(roomCode)
  if (!room) return false
  if (!room.config.autoLoop) return false
  if (room.config.maxRounds !== null && room.roundsPlayed >= room.config.maxRounds) return false
  return true
}
```

- [ ] **Step 5: Update deleteRoom to clean up timers**

```typescript
export function deleteRoom(code: string): void {
  cancelAutoStart(code.toUpperCase())
  rooms.delete(code.toUpperCase())
}
```

- [ ] **Step 6: Commit**

```bash
git add server/utils/game-engine.ts
git commit -m "feat: add auto-start timer management and round tracking"
```

---

### Task 3: Wire auto-loop into WebSocket handler

**Files:**
- Modify: `server/api/ws.ts`

- [ ] **Step 1: Update imports**

```typescript
import {
  createRoom, getRoom, addPlayer, removePlayer,
  startSession, rotateSymbol, handleTap, endSession,
  getLeaderboard, getSessionTimeRemaining, getSessionScores,
  scheduleAutoStart, cancelAutoStart, setAutoLoop, canAutoStartNextRound,
} from '../utils/game-engine'
```

- [ ] **Step 2: Extract a startRoundForRoom helper**

Add this function after the `sendToDisplays` helper, before the game loop section. This encapsulates the round-start logic so both manual start and auto-start can use it:

```typescript
function startRoundForRoom(roomCode: string) {
  cancelAutoStart(roomCode)
  const session = startSession(roomCode)
  if (!session) return

  broadcast(roomCode, {
    type: 'session:started',
    endsAt: session.endsAt,
    symbolChoices: session.symbolChoices,
  })
  sendToDisplays(roomCode, {
    type: 'session:symbol-change',
    symbol: session.currentSymbol,
    symbolChoices: session.symbolChoices,
  })
  startGameLoop(roomCode)
}
```

- [ ] **Step 3: Schedule auto-start after room creation**

Update the `host:create-room` case to schedule the idle auto-start:

```typescript
      case 'host:create-room': {
        const room = createRoom(data.config)
        peerMeta.set(peer.id, { type: 'host', roomCode: room.code })
        addPeerToRoom(peer.id, room.code)
        sendTo(peer.id, { type: 'room:created', roomCode: room.code })

        // Schedule idle auto-start (safety net for all modes)
        scheduleAutoStart(room.code, room.config.autoStartDelayMs, () => {
          const r = getRoom(room.code)
          if (r && r.status === 'waiting' && r.players.size > 0) {
            startRoundForRoom(room.code)
          }
        })
        break
      }
```

- [ ] **Step 4: Simplify host:start-session to use startRoundForRoom**

```typescript
      case 'host:start-session': {
        const meta = peerMeta.get(peer.id)
        if (!meta || (meta.type !== 'host' && meta.type !== 'screen')) {
          sendTo(peer.id, { type: 'error', message: 'Not authorized' })
          return
        }
        startRoundForRoom(meta.roomCode)
        break
      }
```

- [ ] **Step 5: Schedule next round after stopGameLoop**

Update `stopGameLoop` to schedule the next auto-loop round:

```typescript
async function stopGameLoop(roomCode: string) {
  const timers = gameTimers.get(roomCode)
  if (timers) {
    clearInterval(timers.symbolInterval)
    clearInterval(timers.tickInterval)
    clearInterval(timers.scoresInterval)
    clearTimeout(timers.endTimeout)
    gameTimers.delete(roomCode)
  }

  const room = getRoom(roomCode)
  const session = room?.currentSession

  const sessionScores = endSession(roomCode)
  const leaderboard = getLeaderboard(roomCode)

  broadcast(roomCode, { type: 'session:ended', scores: sessionScores })
  broadcast(roomCode, { type: 'leaderboard:update', leaderboard })

  // Schedule next round if auto-loop is active
  if (canAutoStartNextRound(roomCode) && room) {
    const nextRoundAt = Date.now() + room.config.pauseBetweenRoundsMs
    broadcast(roomCode, { type: 'room:next-round-at', timestamp: nextRoundAt })
    scheduleAutoStart(roomCode, room.config.pauseBetweenRoundsMs, () => {
      const r = getRoom(roomCode)
      if (r && r.status === 'waiting' && r.players.size > 0) {
        startRoundForRoom(roomCode)
      }
    })
  } else if (room?.config.maxRounds !== null && room && room.roundsPlayed >= room.config.maxRounds) {
    broadcast(roomCode, { type: 'room:status', status: 'finished', playerCount: room.players.size })
  }

  // Flush to DB
  if (session && sessionScores.length > 0) {
    try {
      await flushSessionToDB(session, sessionScores, roomCode)
    } catch (err) {
      console.error('[SymbolRush] Failed to flush session to DB:', err)
    }
  }
}
```

- [ ] **Step 6: Add host:set-auto-loop handler**

Add a new case in the `switch` block, after `host:end-room`:

```typescript
      case 'host:set-auto-loop': {
        const meta = peerMeta.get(peer.id)
        if (!meta || meta.type !== 'host') {
          sendTo(peer.id, { type: 'error', message: 'Not a host' })
          return
        }
        const room = getRoom(meta.roomCode)
        if (!room) return

        setAutoLoop(meta.roomCode, data.enabled)
        broadcast(meta.roomCode, { type: 'room:auto-loop-changed', enabled: data.enabled })

        if (data.enabled && room.status === 'waiting' && room.players.size > 0) {
          // Start countdown immediately if between rounds
          const nextRoundAt = Date.now() + room.config.pauseBetweenRoundsMs
          broadcast(meta.roomCode, { type: 'room:next-round-at', timestamp: nextRoundAt })
          scheduleAutoStart(meta.roomCode, room.config.pauseBetweenRoundsMs, () => {
            const r = getRoom(meta.roomCode)
            if (r && r.status === 'waiting' && r.players.size > 0) {
              startRoundForRoom(meta.roomCode)
            }
          })
        } else if (!data.enabled) {
          cancelAutoStart(meta.roomCode)
        }
        break
      }
```

- [ ] **Step 7: Clean up timers on host:end-room and peer close**

In the `host:end-room` case, add `cancelAutoStart` before `stopGameLoop`:

```typescript
      case 'host:end-room': {
        const meta = peerMeta.get(peer.id)
        if (!meta || meta.type !== 'host') return
        cancelAutoStart(meta.roomCode)
        stopGameLoop(meta.roomCode)
        broadcast(meta.roomCode, { type: 'room:status', status: 'finished', playerCount: 0 })
        break
      }
```

In the `close` handler, clean up timers when host disconnects:

```typescript
      if (meta.type === 'host') {
        const room = getRoom(meta.roomCode)
        if (room) room.hostConnected = false
        cancelAutoStart(meta.roomCode)
      }
```

- [ ] **Step 8: Commit**

```bash
git add server/api/ws.ts
git commit -m "feat: wire auto-loop into WebSocket handler"
```

---

### Task 4: Host UI — auto-loop toggle and countdown

**Files:**
- Modify: `pages/host/index.vue`

- [ ] **Step 1: Add reactive state for auto-loop**

Add these refs after the existing state declarations (after `roundCount`):

```typescript
const autoLoop = ref(false)
const nextRoundAt = ref<number | null>(null)
const nextRoundCountdown = ref(0)
let countdownInterval: ReturnType<typeof setInterval> | null = null
```

- [ ] **Step 2: Add WebSocket handlers for new messages**

After the existing `on('leaderboard:update', ...)` handler:

```typescript
on('room:auto-loop-changed', (msg) => {
  if (msg.type !== 'room:auto-loop-changed') return
  autoLoop.value = msg.enabled
})

on('room:next-round-at', (msg) => {
  if (msg.type !== 'room:next-round-at') return
  nextRoundAt.value = msg.timestamp
  startCountdown()
})

on('session:started', (msg) => {
  if (msg.type !== 'session:started') return
  phase.value = 'playing'
  roundCount.value++
  sessionDuration.value = msg.endsAt - Date.now()
  timeRemainingMs.value = sessionDuration.value
  nextRoundAt.value = null
  stopCountdown()
})
```

Note: replace the existing `on('session:started', ...)` handler with the updated one above (it now clears countdown state).

- [ ] **Step 3: Add countdown timer functions**

```typescript
function startCountdown() {
  stopCountdown()
  countdownInterval = setInterval(() => {
    if (nextRoundAt.value) {
      nextRoundCountdown.value = Math.max(0, Math.ceil((nextRoundAt.value - Date.now()) / 1000))
      if (nextRoundCountdown.value <= 0) stopCountdown()
    }
  }, 200)
}

function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  nextRoundCountdown.value = 0
}
```

- [ ] **Step 4: Add toggle and startRound functions**

Replace the existing `startRound` function:

```typescript
function toggleAutoLoop() {
  autoLoop.value = !autoLoop.value
  send({ type: 'host:set-auto-loop', enabled: autoLoop.value })
}

function startRound() {
  send({ type: 'host:start-session' })
}
```

- [ ] **Step 5: Add auto-loop controls to template**

Add this card after the Players card and before the Playing state card:

```vue
        <!-- Auto-loop controls -->
        <UCard v-if="phase !== 'connecting'" variant="subtle" :ui="{ body: 'p-4' }" class="mb-3">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xs font-semibold text-neutral-300 uppercase tracking-widest">Auto-loop</h2>
              <p class="text-xs text-neutral-500 mt-1">Rounds run automatically</p>
            </div>
            <USwitch v-model="autoLoop" @update:model-value="toggleAutoLoop" />
          </div>
        </UCard>
```

- [ ] **Step 6: Add countdown display in results phase**

Update the Controls section at the bottom of the template:

```vue
        <!-- Controls -->
        <div class="pt-2">
          <!-- Next round countdown (auto-loop) -->
          <div v-if="phase === 'results' && autoLoop && nextRoundCountdown > 0" class="mb-3">
            <p class="font-mono text-sm text-neutral-300 text-center">
              Next round in {{ nextRoundCountdown }}s
            </p>
            <div class="h-[3px] bg-neutral-800 rounded-full mt-2 overflow-hidden">
              <div
                class="h-full bg-primary transition-[width] duration-200"
                :style="{ width: (nextRoundCountdown / 25 * 100) + '%' }"
              />
            </div>
          </div>

          <UButton
            v-if="phase === 'lobby' || phase === 'results'"
            block
            size="lg"
            :disabled="players.length === 0"
            @click="startRound"
          >
            {{ phase === 'results' ? 'Next Round' : 'Start Round' }}
          </UButton>
          <p v-if="phase === 'lobby' && !autoLoop" class="text-sm text-neutral-300 mt-3">
            Share the QR code on a projector. Players join on their phones.
          </p>
          <p v-if="phase === 'lobby' && autoLoop" class="text-sm text-neutral-300 mt-3">
            Auto-loop is on. First round starts automatically when players join.
          </p>
          <p v-if="phase === 'playing'" class="font-mono text-neutral-300 text-sm">
            Round in progress...
          </p>
        </div>
```

- [ ] **Step 7: Clean up countdown on unmount**

Add cleanup in the existing `onUnmounted` or add one:

```typescript
onUnmounted(() => {
  stopCountdown()
})
```

- [ ] **Step 8: Commit**

```bash
git add pages/host/index.vue
git commit -m "feat: add auto-loop toggle and countdown to host panel"
```

---

### Task 5: Handle auto-loop config on room creation

**Files:**
- Modify: `pages/host/index.vue`
- Modify: `server/api/ws.ts`

- [ ] **Step 1: Pass auto-loop config when creating room**

In `pages/host/index.vue`, update the room creation to pass the `autoLoop` state:

```typescript
onMounted(() => {
  connect()
  const unwatch = watch(connected, (isConnected) => {
    if (isConnected) {
      send({ type: 'host:create-room', config: { autoLoop: autoLoop.value } })
      unwatch()
    }
  }, { immediate: true })
})
```

- [ ] **Step 2: Sync autoLoop ref from URL query param**

Add this before `onMounted` so meetup/BRB setups can use `?autoloop=true`:

```typescript
const route = useRoute()
if (route.query.autoloop === 'true') {
  autoLoop.value = true
}
```

- [ ] **Step 3: Commit**

```bash
git add pages/host/index.vue
git commit -m "feat: support autoloop query param for meetup/BRB setup"
```

---

### Task 6: Update the public screen to show countdown

**Files:**
- Modify: `pages/ps/[roomCode].vue`

- [ ] **Step 1: Read the current public screen file**

Read `pages/ps/[roomCode].vue` to understand the current structure.

- [ ] **Step 2: Add next-round-at handler and countdown**

Add the same countdown refs and handlers as the host panel:

```typescript
const nextRoundAt = ref<number | null>(null)
const nextRoundCountdown = ref(0)
let countdownInterval: ReturnType<typeof setInterval> | null = null

on('room:next-round-at', (msg) => {
  if (msg.type !== 'room:next-round-at') return
  nextRoundAt.value = msg.timestamp
  startCountdown()
})

function startCountdown() {
  stopCountdown()
  countdownInterval = setInterval(() => {
    if (nextRoundAt.value) {
      nextRoundCountdown.value = Math.max(0, Math.ceil((nextRoundAt.value - Date.now()) / 1000))
      if (nextRoundCountdown.value <= 0) stopCountdown()
    }
  }, 200)
}

function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  nextRoundCountdown.value = 0
}
```

- [ ] **Step 3: Clear countdown on session:started**

In the existing `session:started` handler, add:

```typescript
  nextRoundAt.value = null
  stopCountdown()
```

- [ ] **Step 4: Add countdown display to template**

In the results/waiting section of the public screen template, add:

```vue
<p v-if="nextRoundCountdown > 0" class="font-mono text-2xl text-primary">
  Next round in {{ nextRoundCountdown }}s
</p>
```

- [ ] **Step 5: Commit**

```bash
git add pages/ps/[roomCode].vue
git commit -m "feat: show next round countdown on public screen"
```

---

### Task 7: End-to-end verification

- [ ] **Step 1: Start the dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Test manual mode (default)**

1. Open `/host` — create room
2. Open `/play/<code>` in another tab — join as player
3. Start round manually — verify it works as before
4. After round ends, verify no auto-start happens
5. Wait 2 minutes with a player connected — verify safety-net auto-start fires once

- [ ] **Step 3: Test auto-loop mode**

1. Open `/host?autoloop=true` — create room with auto-loop
2. Join as player
3. Wait for auto-start (2 min idle timeout for first round)
4. Or start manually — verify round runs
5. After round ends, verify 25-second countdown appears
6. Verify next round auto-starts after countdown
7. Verify host can manually start during countdown (skips wait)

- [ ] **Step 4: Test toggle mid-session**

1. Start in manual mode
2. Play a round, let it end
3. Toggle auto-loop on — verify countdown starts immediately
4. Toggle auto-loop off — verify countdown stops
5. Toggle auto-loop on again — verify it resumes

- [ ] **Step 5: Test maxRounds**

1. Open `/host?autoloop=true` with `config: { maxRounds: 2 }`
2. Play 2 rounds — verify auto-loop stops after the second round

- [ ] **Step 6: Test public screen countdown**

1. Open `/ps/<code>` alongside the host
2. Verify countdown appears on the public screen between auto-loop rounds

- [ ] **Step 7: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found during end-to-end testing"
```
