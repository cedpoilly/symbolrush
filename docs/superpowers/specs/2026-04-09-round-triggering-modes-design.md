# Round Triggering Modes

## Context

SymbolRush is used in three play situations:

1. **Meetups** — game runs unattended for ~30 minutes, rounds auto-loop
2. **Twitch live** — host actively manages rounds, talks between them
3. **Twitch BRB** — host is away, game auto-loops on a BRB overlay (separate room, throwaway)

BRB is not a special mode — it's just another auto-looping room on a different URL. The app only needs to support two round-triggering modes with a toggle.

## Design

### Two modes

**Manual** (`autoLoop: false`, default):
- Host triggers each round via `host:start-session` — current behavior, unchanged
- Safety net: if 2 minutes pass with players connected and no round started, auto-start fires once

**Auto-loop** (`autoLoop: true`):
- After a round ends, results display for a configurable pause, then the next round starts automatically
- First round also auto-starts after the idle timeout if the host doesn't trigger it manually
- Host can still manually start a round during the pause (skips remaining wait)

### Toggle mid-session

- New WebSocket message: `host:set-auto-loop` with `{ enabled: boolean }`
- Switching to auto-loop immediately begins the pause countdown if between rounds
- Switching to manual cancels any pending auto-start timer

### RoomConfig additions

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `autoLoop` | `boolean` | `false` | Rounds run back-to-back automatically |
| `pauseBetweenRoundsMs` | `number` | `25000` | Gap between rounds in auto-loop (shows scores + QR) |
| `autoStartDelayMs` | `number` | `120000` | Idle timeout before first round auto-starts |

### Server implementation

- Timer managed in `game-engine.ts` — a `setTimeout` per room
- After `endSession()`, if `autoLoop` is true, schedule next `startSession()` after `pauseBetweenRoundsMs`
- On room creation with `autoLoop: true`, schedule first round after `autoStartDelayMs`
- On room creation with `autoLoop: false`, schedule safety-net auto-start after `autoStartDelayMs` (fires once, does not enable auto-loop)
- Timer cleared when: room is deleted, mode is toggled off, or host manually starts a round
- New exports: `scheduleAutoStart(roomCode)`, `cancelAutoStart(roomCode)`, `setAutoLoop(roomCode, enabled)`

### WebSocket changes

New client message:
```typescript
| { type: 'host:set-auto-loop'; enabled: boolean }
```

New server message:
```typescript
| { type: 'room:auto-loop-changed'; enabled: boolean }
| { type: 'room:next-round-at'; timestamp: number }  // tells clients when next round starts
```

### Player experience

No changes. Players see rounds, scores, and pauses. They don't know which mode is active. The pause between rounds shows the leaderboard and QR code for new players to join.

### Host UI

- Toggle switch on the host panel: "Auto-loop rounds"
- When auto-loop is on, show a countdown to the next round during the pause
- Pause duration configurable via a slider or input (default 25 seconds)

### What this does NOT include

- No "BRB mode" — BRB is just a separate auto-loop room on the OBS BRB scene
- No automatic difficulty progression between rounds
- No round count limit (auto-loop runs indefinitely until host stops or room is deleted)
