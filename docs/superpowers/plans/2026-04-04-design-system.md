# Symbol Rush Design System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full design system for Symbol Rush using Nuxt UI v4, custom game components, and Storybook documentation — supporting dark (default) + light color modes and mobile/touch inputs.

**Architecture:** Theme-first approach. Define design tokens via Tailwind CSS v4 `@theme` + Nuxt UI's `app.config.ts` semantic mapping. Extract 11 custom game components from inline page code. Replace raw HTML with Nuxt UI primitives. Document everything in Storybook with `@nuxtjs/storybook`.

**Tech Stack:** Nuxt 4, Nuxt UI v4, Tailwind CSS v4, Reka UI (via Nuxt UI), @nuxtjs/storybook v9, TypeScript

**Spec:** `docs/superpowers/specs/2026-04-04-design-system-design.md`

---

## File Structure

### New Files

```
.npmrc                              # pnpm config for Nuxt UI
app.config.ts                       # Nuxt UI semantic color mapping
components/game/SymbolTile.vue      # Single tappable symbol with ripple + float
components/game/SymbolGrid.vue      # 2x2 grid of SymbolTiles
components/game/TimerBar.vue        # Countdown bar with color transition
components/game/ScoreFloat.vue      # Animated +10/-5 floating score
components/game/ScoreDisplay.vue    # Current score with flash feedback
components/game/LeaderboardRow.vue  # Single player row: rank, name, score
components/game/Leaderboard.vue     # Full leaderboard list
components/game/RoomCodeDisplay.vue # Monospace room code with copy action
components/game/QRJoinDisplay.vue   # QR code canvas + room code
components/game/PlayerList.vue      # Player names with status badges
components/game/GameStatusBanner.vue# Game phase indicator
stories/1-Tokens/Colors.stories.ts
stories/1-Tokens/Typography.stories.ts
stories/1-Tokens/Spacing.stories.ts
stories/1-Tokens/Animations.stories.ts
stories/2-NuxtUI/Button.stories.ts
stories/2-NuxtUI/Input.stories.ts
stories/2-NuxtUI/Badge.stories.ts
stories/2-NuxtUI/Modal.stories.ts
stories/2-NuxtUI/Toast.stories.ts
stories/2-NuxtUI/Progress.stories.ts
stories/2-NuxtUI/Alert.stories.ts
stories/2-NuxtUI/Avatar.stories.ts
stories/2-NuxtUI/Switch.stories.ts
stories/2-NuxtUI/ColorMode.stories.ts
stories/3-Game/SymbolTile.stories.ts
stories/3-Game/SymbolGrid.stories.ts
stories/3-Game/TimerBar.stories.ts
stories/3-Game/ScoreFloat.stories.ts
stories/3-Game/ScoreDisplay.stories.ts
stories/3-Game/LeaderboardRow.stories.ts
stories/3-Game/Leaderboard.stories.ts
stories/3-Game/RoomCodeDisplay.stories.ts
stories/3-Game/QRJoinDisplay.stories.ts
stories/3-Game/PlayerList.stories.ts
stories/3-Game/GameStatusBanner.stories.ts
stories/4-Compositions/LobbyScreen.stories.ts
stories/4-Compositions/GameplayScreen.stories.ts
stories/4-Compositions/HostPanel.stories.ts
```

### Modified Files

```
nuxt.config.ts       # Add @nuxt/ui, @nuxtjs/storybook modules
package.json         # Add dependencies
assets/css/main.css  # Rewrite with Tailwind + @theme tokens
app.vue              # Wrap with UApp
pages/index.vue      # Swap raw HTML → Nuxt UI components
pages/play/[roomCode].vue  # Extract game components, use Nuxt UI
pages/host/index.vue       # Extract components, use Nuxt UI
pages/ps/[roomCode].vue    # Extract components, use Nuxt UI
.gitignore           # Add .storybook-static/
```

---

## Phase 1: Foundation

### Task 1: Install dependencies and configure project

**Files:**
- Modify: `package.json`
- Create: `.npmrc`
- Modify: `nuxt.config.ts`

- [ ] **Step 1: Create .npmrc for pnpm compatibility**

```
# .npmrc
shamefully-hoist=true
```

- [ ] **Step 2: Install Nuxt UI, Tailwind CSS, and Storybook**

Run:
```bash
pnpm add @nuxt/ui tailwindcss
pnpm add -D @nuxtjs/storybook
```

- [ ] **Step 3: Update nuxt.config.ts**

Replace the entire file with:

```ts
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/google-fonts',
    '@nuxtjs/storybook',
  ],

  ui: {
    theme: {
      colors: ['primary', 'secondary', 'success', 'error', 'warning', 'neutral'],
    },
  },

  storybook: {
    url: 'http://localhost:6006',
    port: 6006,
  },

  nitro: {
    experimental: { websocket: true },
  },

  googleFonts: {
    families: {
      'Azeret Mono': [400, 700, 900],
      'Outfit': [400, 500, 600, 700],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
    public: {
      wsUrl: process.env.WS_URL || '',
    },
  },
})
```

- [ ] **Step 4: Add .storybook-static/ to .gitignore**

Append to `.gitignore`:
```
.storybook-static/
```

- [ ] **Step 5: Commit**

```bash
git add .npmrc package.json pnpm-lock.yaml nuxt.config.ts .gitignore
git commit -m "feat: add Nuxt UI, Tailwind CSS v4, and Storybook dependencies"
```

---

### Task 2: Define theme tokens and color scales

**Files:**
- Modify: `assets/css/main.css`
- Create: `app.config.ts`

- [ ] **Step 1: Rewrite assets/css/main.css with Tailwind + @theme tokens**

Replace the entire file with:

```css
@import "tailwindcss";
@import "@nuxt/ui";

/* ══════════════════════════════════════════════
   Symbol Rush — Design Tokens
   ══════════════════════════════════════════════ */

@theme {
  /* ── Typography ── */
  --font-sans: 'Outfit', system-ui, sans-serif;
  --font-mono: 'Azeret Mono', monospace;

  /* ── Cyan (primary) ── base: #00e8ff ── */
  --color-cyan-50: #ecfeff;
  --color-cyan-100: #cffbfe;
  --color-cyan-200: #a5f5fc;
  --color-cyan-300: #5eebf7;
  --color-cyan-400: #00e8ff;
  --color-cyan-500: #00c8db;
  --color-cyan-600: #00a1b6;
  --color-cyan-700: #008193;
  --color-cyan-800: #006878;
  --color-cyan-900: #005664;
  --color-cyan-950: #003844;

  /* ── Magenta (secondary) ── base: #ff2d78 ── */
  --color-magenta-50: #fff0f3;
  --color-magenta-100: #ffe2ea;
  --color-magenta-200: #ffc9d9;
  --color-magenta-300: #ff9bb8;
  --color-magenta-400: #ff2d78;
  --color-magenta-500: #ed1164;
  --color-magenta-600: #cc004f;
  --color-magenta-700: #a5003f;
  --color-magenta-800: #880037;
  --color-magenta-900: #730033;
  --color-magenta-950: #430017;

  /* ── Green (success) ── base: #00ff88 ── */
  --color-green-50: #edfff5;
  --color-green-100: #d5ffea;
  --color-green-200: #adffd5;
  --color-green-300: #70ffb5;
  --color-green-400: #00ff88;
  --color-green-500: #00dd72;
  --color-green-600: #00b85d;
  --color-green-700: #009049;
  --color-green-800: #00713c;
  --color-green-900: #005d33;
  --color-green-950: #00341c;

  /* ── Red (error) ── base: #ff3355 ── */
  --color-red-50: #fff0f1;
  --color-red-100: #ffe1e4;
  --color-red-200: #ffc8cf;
  --color-red-300: #ffa1ad;
  --color-red-400: #ff3355;
  --color-red-500: #ed113a;
  --color-red-600: #cc002e;
  --color-red-700: #a50025;
  --color-red-800: #880022;
  --color-red-900: #730021;
  --color-red-950: #430010;

  /* ── Gold (warning) ── base: #ffc233 ── */
  --color-gold-50: #fffbeb;
  --color-gold-100: #fff3c6;
  --color-gold-200: #ffe88a;
  --color-gold-300: #ffd84d;
  --color-gold-400: #ffc233;
  --color-gold-500: #f0a30e;
  --color-gold-600: #d47d09;
  --color-gold-700: #a95a08;
  --color-gold-800: #8a460d;
  --color-gold-900: #723a10;
  --color-gold-950: #431d05;

  /* ── Rush (neutral) ── base: #06060e ── */
  --color-rush-50: #f6f6f8;
  --color-rush-100: #e8e8f2;
  --color-rush-200: #d4d4de;
  --color-rush-300: #ababbd;
  --color-rush-400: #7c7c96;
  --color-rush-500: #60607a;
  --color-rush-600: #4a4a65;
  --color-rush-700: #35354e;
  --color-rush-800: #222238;
  --color-rush-900: #141424;
  --color-rush-950: #06060e;
}

/* ══════════════════════════════════════════════
   Game-specific global styles
   ══════════════════════════════════════════════ */

body.no-scroll {
  overflow: hidden;
  overscroll-behavior: none;
}

/* ── Grid background ── */
.grid-bg {
  position: relative;
}

.grid-bg::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

.dark .grid-bg::before {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
}

.light .grid-bg::before {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
}

.grid-bg-phone::before {
  background-size: 36px 36px;
}

/* ── Radial glow (projector, dark mode only) ── */
.dark .radial-glow::after {
  content: '';
  position: fixed;
  top: -20%;
  left: 20%;
  right: 20%;
  height: 60%;
  background: radial-gradient(closest-side, rgba(0, 232, 255, 0.12), transparent);
  pointer-events: none;
  z-index: 0;
}

/* ── Keyframes ── */
@keyframes symbol-enter {
  from { transform: scale(0.7) rotate(-8deg); opacity: 0; }
  to { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes float-up {
  0% { transform: translateX(-50%) translateY(0); opacity: 1; }
  100% { transform: translateX(-50%) translateY(-60px); opacity: 0; }
}

@keyframes ripple-expand {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
}

@keyframes slide-down {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slide-in-left {
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes scan {
  0% { top: 0; }
  100% { top: calc(100% - 2px); }
}

@keyframes flash-green-kf {
  0% { color: var(--color-green-400); }
  100% { color: var(--color-cyan-400); }
}

@keyframes flash-red-kf {
  0% { color: var(--color-red-400); }
  100% { color: var(--color-cyan-400); }
}

/* ── Vue transitions ── */
.symbol-enter-active {
  animation: symbol-enter 0.2s ease;
}

.symbol-leave-active {
  animation: symbol-enter 0.15s ease reverse;
}

.join-pill-enter-active {
  animation: slide-down 0.3s ease;
}

.join-pill-leave-active {
  transition: opacity 0.2s;
  opacity: 0;
}
```

- [ ] **Step 2: Create app.config.ts**

```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'cyan',
      secondary: 'magenta',
      success: 'green',
      error: 'red',
      warning: 'gold',
      neutral: 'rush',
    },
  },
})
```

- [ ] **Step 3: Commit**

```bash
git add assets/css/main.css app.config.ts
git commit -m "feat: define design tokens and semantic color mapping"
```

---

### Task 3: Update app root and verify foundation

**Files:**
- Modify: `app.vue`

- [ ] **Step 1: Update app.vue with UApp wrapper**

Replace the entire file with:

```vue
<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
```

- [ ] **Step 2: Run dev server to verify**

Run:
```bash
pnpm dev
```

Expected: The app starts without errors. The landing page at `http://localhost:3000` renders. Styles will look different because we removed the old CSS custom properties — this is expected. The Nuxt UI defaults + our theme tokens are now active.

- [ ] **Step 3: Verify color mode works**

Open browser dev tools, toggle `<html class="dark">` to `<html class="light">`. The background and text colors should invert. Switch back to dark.

- [ ] **Step 4: Commit**

```bash
git add app.vue
git commit -m "feat: wrap app with UApp for Nuxt UI integration"
```

---

## Phase 2: Extract Custom Game Components

### Task 4: Create SymbolTile and SymbolGrid components

**Files:**
- Create: `components/game/SymbolTile.vue`
- Create: `components/game/SymbolGrid.vue`

- [ ] **Step 1: Create SymbolTile.vue**

```vue
<script setup lang="ts">
import type { Symbol } from '~/types/game'

const props = defineProps<{
  symbol: Symbol
}>()

const emit = defineEmits<{
  tap: [event: MouseEvent, symbol: Symbol]
}>()

function handleTap(event: MouseEvent) {
  emit('tap', event, props.symbol)
}
</script>

<template>
  <button
    class="symbol-tile"
    @click="handleTap"
  >
    {{ symbol }}
  </button>
</template>

<style scoped>
.symbol-tile {
  aspect-ratio: 1;
  font-size: 40px;
  background: var(--color-rush-800);
  border: 2px solid var(--color-rush-700);
  border-radius: 14px;
  color: var(--color-rush-100);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: transform 0.1s, border-color 0.15s;
  min-height: 44px;
  min-width: 44px;
}

.symbol-tile:active {
  transform: scale(0.93);
}

.symbol-tile:hover {
  border-color: var(--color-cyan-600);
}

:root.light .symbol-tile {
  background: var(--color-rush-100);
  border-color: var(--color-rush-200);
  color: var(--color-rush-900);
}
</style>
```

- [ ] **Step 2: Create SymbolGrid.vue**

```vue
<script setup lang="ts">
import type { Symbol } from '~/types/game'

defineProps<{
  symbols: Symbol[]
  columns?: number
}>()

const emit = defineEmits<{
  tap: [event: MouseEvent, symbol: Symbol]
}>()
</script>

<template>
  <div
    class="symbol-grid"
    :style="{ gridTemplateColumns: `repeat(${columns ?? 2}, 1fr)` }"
  >
    <SymbolTile
      v-for="s in symbols"
      :key="s"
      :symbol="s"
      @tap="(event, symbol) => emit('tap', event, symbol)"
    />
  </div>
</template>

<style scoped>
.symbol-grid {
  display: grid;
  gap: 12px;
  width: 100%;
  max-width: 340px;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add components/game/SymbolTile.vue components/game/SymbolGrid.vue
git commit -m "feat: extract SymbolTile and SymbolGrid game components"
```

---

### Task 5: Create TimerBar component

**Files:**
- Create: `components/game/TimerBar.vue`

- [ ] **Step 1: Create TimerBar.vue**

```vue
<script setup lang="ts">
const props = defineProps<{
  timeRemainingMs: number
  totalDurationMs: number
  urgentThresholdMs?: number
}>()

const percent = computed(() =>
  Math.max(0, (props.timeRemainingMs / props.totalDurationMs) * 100),
)

const isUrgent = computed(() =>
  props.timeRemainingMs < (props.urgentThresholdMs ?? 8000),
)
</script>

<template>
  <div class="timer-bar-container">
    <div
      class="timer-bar-fill"
      :class="{ urgent: isUrgent }"
      :style="{ width: `${percent}%` }"
    />
  </div>
</template>

<style scoped>
.timer-bar-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: var(--color-rush-800);
  z-index: 100;
}

.timer-bar-fill {
  height: 100%;
  background: var(--color-cyan-400);
  transition: width 0.1s linear;
  box-shadow: 0 0 10px rgba(0, 232, 255, 0.35);
}

.timer-bar-fill.urgent {
  background: var(--color-magenta-400);
  box-shadow: 0 0 12px rgba(255, 45, 120, 0.4);
}

:root.light .timer-bar-container {
  background: var(--color-rush-200);
}

:root.light .timer-bar-fill {
  box-shadow: none;
}

:root.light .timer-bar-fill.urgent {
  box-shadow: none;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add components/game/TimerBar.vue
git commit -m "feat: extract TimerBar game component"
```

---

### Task 6: Create ScoreFloat and ScoreDisplay components

**Files:**
- Create: `components/game/ScoreFloat.vue`
- Create: `components/game/ScoreDisplay.vue`

- [ ] **Step 1: Create ScoreFloat.vue**

This component creates DOM elements for the ripple and floating score effects. It's controlled imperatively via an exposed `show()` method rather than props, since these are ephemeral visual effects tied to click positions.

```vue
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
    text-shadow: 0 0 8px ${correct ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 51, 85, 0.5)'};
    animation: float-up 0.7s ease forwards;
  `
  float.textContent = delta > 0 ? `+${delta}` : String(delta)
  document.body.appendChild(float)
  setTimeout(() => float.remove(), 700)
}

defineExpose({ show })
</script>

<template>
  <!-- Render target — effects are appended to document.body -->
  <span />
</template>
```

- [ ] **Step 2: Create ScoreDisplay.vue**

```vue
<script setup lang="ts">
const props = defineProps<{
  score: number
}>()

const flashClass = ref('')

function flash(correct: boolean) {
  flashClass.value = correct ? 'flash-green' : 'flash-red'
  setTimeout(() => { flashClass.value = '' }, 200)
}

defineExpose({ flash })
</script>

<template>
  <span class="score-display font-mono" :class="flashClass">
    {{ score }}
  </span>
</template>

<style scoped>
.score-display {
  font-weight: 900;
  font-size: 1.5rem;
  color: var(--color-cyan-400);
  transition: color 0.1s;
}

.flash-green {
  animation: flash-green-kf 0.2s ease;
}

.flash-red {
  animation: flash-red-kf 0.2s ease;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add components/game/ScoreFloat.vue components/game/ScoreDisplay.vue
git commit -m "feat: extract ScoreFloat and ScoreDisplay game components"
```

---

### Task 7: Create LeaderboardRow and Leaderboard components

**Files:**
- Create: `components/game/LeaderboardRow.vue`
- Create: `components/game/Leaderboard.vue`

- [ ] **Step 1: Create LeaderboardRow.vue**

```vue
<script setup lang="ts">
defineProps<{
  rank: number
  username: string
  score: number
  isNewBest?: boolean
}>()

</script>

<template>
  <div
    class="lb-row"
    :class="{
      'rank-1': rank === 1,
      'rank-2': rank === 2,
      'rank-3': rank === 3,
    }"
  >
    <span class="lb-rank font-mono">#{{ rank }}</span>
    <span class="lb-name">{{ username }}</span>
    <UBadge v-if="isNewBest" color="warning" variant="subtle" size="xs">
      NEW BEST
    </UBadge>
    <span class="lb-score font-mono">{{ score }}</span>
  </div>
</template>

<style scoped>
.lb-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-rush-800);
  border-radius: 10px;
  animation: slide-in-left 0.3s ease both;
}

.lb-rank {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-rush-400);
  min-width: 36px;
}

.rank-1 .lb-rank { color: var(--color-gold-400); font-size: 1.1rem; text-shadow: 0 0 8px rgba(255, 194, 51, 0.3); }
.rank-2 .lb-rank { color: #c0c0c0; }
.rank-3 .lb-rank { color: #cd7f32; }
.rank-1 { font-size: 1.05rem; }

.lb-name {
  font-weight: 500;
  flex: 1;
}

.lb-score {
  font-weight: 700;
  color: var(--color-cyan-400);
  min-width: 50px;
  text-align: right;
}

:root.light .lb-row {
  background: var(--color-rush-100);
}

:root.light .lb-rank {
  color: var(--color-rush-500);
}

:root.light .rank-1 .lb-rank { text-shadow: none; }
</style>
```

- [ ] **Step 2: Create Leaderboard.vue**

```vue
<script setup lang="ts">
import type { LeaderboardEntry, SessionScore } from '~/types/game'

const props = defineProps<{
  entries: LeaderboardEntry[]
  sessionScores?: SessionScore[]
}>()

function isNewBest(entry: LeaderboardEntry): boolean {
  if (!props.sessionScores) return false
  const roundResult = props.sessionScores.find(s => s.playerId === entry.playerId)
  return !!roundResult && roundResult.score === entry.bestScore && roundResult.score > 0
}
</script>

<template>
  <div class="leaderboard">
    <template v-if="entries.length > 0">
      <LeaderboardRow
        v-for="(entry, index) in entries"
        :key="entry.playerId"
        :rank="index + 1"
        :username="entry.username"
        :score="entry.bestScore"
        :is-new-best="isNewBest(entry)"
        :style="{ animationDelay: `${index * 0.06}s` }"
      />
    </template>
    <p v-else class="text-sm text-neutral-400">
      No scores yet
    </p>
  </div>
</template>

<style scoped>
.leaderboard {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 500px;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add components/game/LeaderboardRow.vue components/game/Leaderboard.vue
git commit -m "feat: extract LeaderboardRow and Leaderboard game components"
```

---

### Task 8: Create RoomCodeDisplay and QRJoinDisplay components

**Files:**
- Create: `components/game/RoomCodeDisplay.vue`
- Create: `components/game/QRJoinDisplay.vue`

- [ ] **Step 1: Create RoomCodeDisplay.vue**

```vue
<script setup lang="ts">
const props = defineProps<{
  code: string
  size?: 'sm' | 'md' | 'lg'
  copyable?: boolean
}>()

const toast = useToast()
const copied = ref(false)

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code)
  } catch {
    const input = document.createElement('input')
    input.value = props.code
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    input.remove()
  }
  copied.value = true
  toast.add({ title: 'Room code copied!', color: 'success' })
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="room-code-display">
    <span
      class="room-code font-mono"
      :class="{
        'text-3xl': size === 'sm',
        'text-5xl': !size || size === 'md',
        'text-7xl lg:text-8xl': size === 'lg',
      }"
    >
      {{ code }}
    </span>
    <UButton
      v-if="copyable"
      :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
      variant="ghost"
      color="primary"
      size="sm"
      @click="copyCode"
    />
  </div>
</template>

<style scoped>
.room-code-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.room-code {
  font-weight: 900;
  color: var(--color-cyan-400);
  letter-spacing: 0.08em;
}

.dark .room-code {
  text-shadow: 0 0 20px rgba(0, 232, 255, 0.35);
}
</style>
```

- [ ] **Step 2: Create QRJoinDisplay.vue**

```vue
<script setup lang="ts">
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
```

- [ ] **Step 3: Commit**

```bash
git add components/game/RoomCodeDisplay.vue components/game/QRJoinDisplay.vue
git commit -m "feat: extract RoomCodeDisplay and QRJoinDisplay game components"
```

---

### Task 9: Create PlayerList and GameStatusBanner components

**Files:**
- Create: `components/game/PlayerList.vue`
- Create: `components/game/GameStatusBanner.vue`

- [ ] **Step 1: Create PlayerList.vue**

```vue
<script setup lang="ts">
defineProps<{
  players: Array<{ id: string; username: string }>
  scores?: Map<string, number> | Record<string, number>
}>()

function getScore(playerId: string, scores?: Map<string, number> | Record<string, number>): number {
  if (!scores) return 0
  if (scores instanceof Map) return scores.get(playerId) ?? 0
  return scores[playerId] ?? 0
}
</script>

<template>
  <div class="player-list">
    <p v-if="players.length === 0" class="text-sm text-neutral-400">
      No players yet — share the room code
    </p>
    <div v-else class="player-rows">
      <div
        v-for="player in players"
        :key="player.id"
        class="player-row"
      >
        <UAvatar :text="player.username.charAt(0).toUpperCase()" size="xs" />
        <span class="player-name">{{ player.username }}</span>
        <span v-if="scores" class="player-score font-mono text-primary">
          {{ getScore(player.id, scores) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--color-rush-800);
  border-radius: 8px;
}

.player-name {
  font-weight: 500;
  font-size: 0.9rem;
  flex: 1;
}

.player-score {
  font-weight: 700;
  font-size: 0.85rem;
}

:root.light .player-row {
  background: var(--color-rush-100);
}
</style>
```

- [ ] **Step 2: Create GameStatusBanner.vue**

```vue
<script setup lang="ts">
import type { RoomStatus } from '~/types/game'

defineProps<{
  status: RoomStatus | 'lobby' | 'connecting'
  roundCount?: number
}>()

const statusConfig: Record<string, { label: string; color: string }> = {
  connecting: { label: 'Connecting', color: 'neutral' },
  waiting: { label: 'Waiting', color: 'primary' },
  lobby: { label: 'Lobby', color: 'primary' },
  playing: { label: 'Playing', color: 'success' },
  finished: { label: 'Finished', color: 'warning' },
  results: { label: 'Results', color: 'warning' },
}
</script>

<template>
  <div class="game-status-banner">
    <UBadge
      :color="(statusConfig[status]?.color as any) ?? 'neutral'"
      variant="subtle"
      size="sm"
    >
      {{ statusConfig[status]?.label ?? status }}
    </UBadge>
    <span v-if="roundCount" class="text-sm font-mono text-neutral-400">
      Round {{ roundCount }}
    </span>
  </div>
</template>

<style scoped>
.game-status-banner {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add components/game/PlayerList.vue components/game/GameStatusBanner.vue
git commit -m "feat: extract PlayerList and GameStatusBanner game components"
```

---

## Phase 3: Swap Raw HTML for Nuxt UI in Pages

### Task 10: Refactor landing page

**Files:**
- Modify: `pages/index.vue`

- [ ] **Step 1: Rewrite pages/index.vue using Nuxt UI + Tailwind**

Replace the entire file:

```vue
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const mode = ref<'choose' | 'join'>('choose')
const roomCode = ref('')
const username = ref('')
const error = ref('')
const loading = ref(false)

onMounted(() => {
  const queryRoom = route.query.room as string
  if (queryRoom) {
    roomCode.value = queryRoom.toUpperCase()
    mode.value = 'join'
  }
})

function handleJoin() {
  const code = roomCode.value.trim().toUpperCase()
  const name = username.value.trim()
  if (!code || !name) {
    error.value = 'Please enter both room code and username'
    return
  }
  loading.value = true
  router.push(`/play/${code}?u=${encodeURIComponent(name)}`)
}

function handleHost() {
  router.push('/host')
}

useHead({ title: 'Symbol Rush' })
</script>

<template>
  <div class="grid-bg min-h-dvh flex items-center justify-center p-6">
    <div class="max-w-[400px] w-full text-center relative z-1">
      <h1 class="font-mono font-black text-primary text-[clamp(2.5rem,8vw,3.5rem)] tracking-wide mb-2 title-glow">
        SYMBOL<span class="text-neutral-400">RUSH</span>
      </h1>
      <p class="text-neutral-400 mb-12">
        Match the symbol. Beat the clock. Win the prize.
      </p>

      <div v-if="mode === 'choose'" class="flex flex-col gap-3">
        <UButton block size="lg" @click="mode = 'join'">
          Join Game
        </UButton>
        <UButton block size="lg" variant="outline" @click="handleHost">
          Host a Room
        </UButton>
      </div>

      <form v-else class="flex flex-col gap-3" @submit.prevent="handleJoin">
        <UInput
          v-model="roomCode"
          placeholder="ROOM CODE"
          size="lg"
          :ui="{ base: 'font-mono font-bold text-2xl text-center tracking-[0.15em]' }"
          maxlength="6"
          autocapitalize="characters"
          @input="roomCode = roomCode.toUpperCase()"
        />
        <UInput
          v-model="username"
          placeholder="Your name"
          size="lg"
          maxlength="20"
        />
        <p v-if="error" class="text-error text-sm">{{ error }}</p>
        <UButton block size="lg" type="submit" :loading="loading">
          Let's Go
        </UButton>
        <UButton
          block
          size="lg"
          variant="ghost"
          color="neutral"
          @click="mode = 'choose'; error = ''"
        >
          &larr; Back
        </UButton>
      </form>
    </div>
  </div>
</template>

<style scoped>
.dark .title-glow {
  text-shadow: 0 0 30px rgba(0, 232, 255, 0.35), 0 0 60px rgba(0, 232, 255, 0.15);
}
</style>
```

- [ ] **Step 2: Verify the landing page renders**

Run: `pnpm dev`

Navigate to `http://localhost:3000`. Verify:
- Title "SYMBOLRUSH" displays with cyan glow in dark mode
- "Join Game" and "Host a Room" buttons render with Nuxt UI styling
- Join form shows monospace room code input + standard name input
- Buttons have proper hover and active states
- Mobile viewport (375px wide) looks good

- [ ] **Step 3: Commit**

```bash
git add pages/index.vue
git commit -m "refactor: landing page uses Nuxt UI components and Tailwind"
```

---

### Task 11: Refactor player page

**Files:**
- Modify: `pages/play/[roomCode].vue`

- [ ] **Step 1: Rewrite pages/play/[roomCode].vue using extracted components**

Replace the entire file:

```vue
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

const scoreFloatRef = ref<InstanceType<typeof ScoreFloat> | null>(null)
const scoreDisplayRef = ref<InstanceType<typeof ScoreDisplay> | null>(null)
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

    <!-- Connecting -->
    <div v-if="phase === 'connecting'" class="min-h-dvh flex items-center justify-center relative z-1">
      <p class="font-mono text-neutral-400">Joining room...</p>
    </div>

    <!-- Waiting -->
    <div v-else-if="phase === 'waiting'" class="min-h-dvh flex flex-col items-center justify-center p-6 relative z-1 gap-4">
      <span class="text-5xl">👀</span>
      <h1 class="font-mono font-black text-3xl text-primary">You're in!</h1>
      <p>Room: <strong>{{ roomCode }}</strong></p>
      <p class="text-neutral-400 text-sm text-center">Watch the projector — game starts any moment</p>
      <UBadge variant="outline" color="neutral" size="sm">
        <span class="font-mono">playing as {{ username }}</span>
      </UBadge>
    </div>

    <!-- Playing -->
    <div v-else-if="phase === 'playing'" class="min-h-dvh flex flex-col items-center pt-6 px-6 relative z-1 gap-4">
      <div class="w-full flex justify-between items-center px-1">
        <span class="font-mono text-neutral-400">{{ secondsRemaining }}s</span>
        <ScoreDisplay ref="scoreDisplayRef" :score="score" />
      </div>
      <p class="font-mono text-neutral-400 text-xs uppercase tracking-widest">
        TAP THE SYMBOL ON SCREEN!
      </p>
      <SymbolGrid
        :symbols="symbolChoices"
        class="mt-auto mb-auto"
        @tap="handleTap"
      />
    </div>

    <!-- Results -->
    <div v-else-if="phase === 'results'" class="min-h-dvh flex flex-col items-center justify-center p-6 relative z-1 gap-4">
      <p class="font-mono text-neutral-400 text-xs uppercase tracking-widest">Round over</p>
      <h1 class="font-mono font-black text-3xl text-primary">Nice run!</h1>
      <div class="flex gap-4 w-full max-w-[340px]">
        <div class="flex-1 bg-neutral-800 rounded-xl p-4 text-center">
          <span class="text-xs text-neutral-400 block mb-1">Round Score</span>
          <span class="font-mono font-black text-3xl text-primary">{{ roundScore }}</span>
        </div>
        <div class="flex-1 bg-neutral-800 rounded-xl p-4 text-center">
          <span class="text-xs text-neutral-400 block mb-1">Personal Best</span>
          <span class="font-mono font-black text-3xl text-warning">{{ personalBest }}</span>
        </div>
      </div>
      <UBadge variant="outline" color="primary" size="md">
        <span class="font-mono">#{{ leaderboardRank }} on leaderboard</span>
      </UBadge>
      <p class="text-neutral-400 text-sm">Next round starting soon...</p>
    </div>

    <!-- Bottom bar -->
    <div class="fixed bottom-0 left-0 right-0 px-6 py-4 flex items-center justify-between z-50">
      <span class="font-mono font-bold text-xs tracking-wide">
        <span class="text-primary">SYMBOL</span><span class="text-neutral-400">RUSH</span>
      </span>
      <span
        class="w-2 h-2 rounded-full transition-colors"
        :class="connected ? 'bg-success shadow-[0_0_6px_rgba(0,255,136,0.4)]' : 'bg-error'"
      />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify player page renders**

Run dev server and navigate to `http://localhost:3000/play/TEST?u=TestUser`. Verify all phases look correct (it will show "Joining room..." without a server connection, which is expected).

- [ ] **Step 3: Commit**

```bash
git add pages/play/\\[roomCode\\].vue
git commit -m "refactor: player page uses game components and Nuxt UI"
```

---

### Task 12: Refactor host page

**Files:**
- Modify: `pages/host/index.vue`

- [ ] **Step 1: Rewrite pages/host/index.vue**

Replace the entire file:

```vue
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

function openPublicScreen() {
  window.open(`/ps/${roomCode.value}`, '_blank')
}

const toast = useToast()
async function copyPublicScreenUrl() {
  try {
    await navigator.clipboard.writeText(psFullUrl.value)
  } catch {
    const input = document.createElement('input')
    input.value = psFullUrl.value
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    input.remove()
  }
  toast.add({ title: 'URL copied!', color: 'success' })
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

        <!-- Public Screen actions -->
        <div class="py-4 border-b border-neutral-900">
          <h2 class="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Public Screen</h2>
          <div class="flex gap-2">
            <UButton variant="soft" color="neutral" size="sm" icon="i-lucide-external-link" @click="openPublicScreen">
              Open
            </UButton>
            <UButton variant="soft" color="neutral" size="sm" icon="i-lucide-copy" @click="copyPublicScreenUrl">
              Copy URL
            </UButton>
            <UButton v-if="canShare" variant="soft" color="neutral" size="sm" icon="i-lucide-share" @click="sharePublicScreenUrl">
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
```

- [ ] **Step 2: Commit**

```bash
git add pages/host/index.vue
git commit -m "refactor: host page uses game components and Nuxt UI"
```

---

### Task 13: Refactor projector screen page

**Files:**
- Modify: `pages/ps/[roomCode].vue`

- [ ] **Step 1: Rewrite pages/ps/[roomCode].vue**

Replace the entire file:

```vue
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
    <div v-if="phase === 'connecting'" class="min-h-dvh flex items-center justify-center relative z-1">
      <p class="font-mono text-neutral-400">Connecting to room...</p>
    </div>

    <!-- Lobby -->
    <div v-else-if="phase === 'lobby'" class="min-h-dvh grid grid-cols-[3fr_1fr] relative z-1 p-10 gap-6">
      <div class="flex flex-col items-center justify-center gap-6">
        <div class="text-center">
          <span class="block font-mono text-sm text-neutral-400 uppercase tracking-[0.15em] mb-2">SCAN TO JOIN</span>
        </div>
        <QRJoinDisplay :room-code="roomCode" />
      </div>

      <div class="flex flex-col gap-3 py-5 self-center">
        <template v-if="players.length > 0">
          <p class="font-mono text-sm text-neutral-400">
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
        <p class="font-mono text-sm text-neutral-400 mt-auto">
          Starts in <span class="font-bold text-primary">{{ lobbyCountdown }}</span>s
        </p>
      </div>
    </div>

    <!-- Playing -->
    <div v-else-if="phase === 'playing'" class="min-h-dvh flex flex-col items-center justify-center gap-5 relative z-1">
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
      <p class="font-mono text-2xl text-neutral-400">
        <span class="font-bold text-neutral-100">{{ secondsRemaining }}</span>s
      </p>
    </div>

    <!-- Results -->
    <div v-else-if="phase === 'results'" class="min-h-dvh flex flex-col items-center justify-center gap-6 p-10 relative z-1">
      <h2 class="font-mono text-sm text-neutral-400 uppercase tracking-[0.15em]">BEST SCORES</h2>
      <Leaderboard :entries="leaderboard" :session-scores="sessionScores" />
      <p class="font-mono text-sm text-neutral-400">
        Next round in <span class="font-bold text-primary">{{ lobbyCountdown }}</span>s
      </p>
    </div>

    <!-- Bottom bar -->
    <div class="fixed bottom-0 left-0 right-0 px-6 py-4 flex items-center justify-between z-50">
      <span class="font-mono font-bold text-xs tracking-wide">
        <span class="text-primary">SYMBOL</span><span class="text-neutral-400">RUSH</span>
      </span>
      <span
        class="w-2 h-2 rounded-full transition-colors"
        :class="connected ? 'bg-success shadow-[0_0_6px_rgba(0,255,136,0.4)]' : 'bg-error'"
      />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify all pages render**

Run: `pnpm dev`

Navigate to each page and verify no console errors:
- `http://localhost:3000` — landing
- `http://localhost:3000/host` — host panel
- `http://localhost:3000/play/TEST?u=Demo` — player screen
- `http://localhost:3000/ps/TEST` — projector screen

- [ ] **Step 3: Commit**

```bash
git add pages/ps/\\[roomCode\\].vue
git commit -m "refactor: projector screen uses game components and Nuxt UI"
```

---

## Phase 4: Storybook

### Task 14: Configure Storybook with decorators and viewports

**Files:**
- Create: `.storybook/main.ts`
- Create: `.storybook/preview.ts`

- [ ] **Step 1: Create .storybook/main.ts**

```ts
import type { StorybookConfig } from '@storybook-vue/nuxt'

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.stories.@(js|ts)',
  ],
  framework: {
    name: '@storybook-vue/nuxt',
    options: {},
  },
}

export default config
```

Note: `@nuxtjs/storybook` module auto-generates Storybook config. This file may already be created by the module. If so, merge the `stories` glob into the existing config.

- [ ] **Step 2: Create .storybook/preview.ts**

```ts
import type { Preview } from '@storybook/vue3'

const preview: Preview = {
  parameters: {
    viewport: {
      viewports: {
        iphoneSE: {
          name: 'iPhone SE',
          styles: { width: '375px', height: '667px' },
        },
        iphone14: {
          name: 'iPhone 14',
          styles: { width: '390px', height: '844px' },
        },
        projector: {
          name: 'Projector (1080p)',
          styles: { width: '1920px', height: '1080px' },
        },
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#06060e' },
        { name: 'light', value: '#f6f6f8' },
      ],
    },
  },
}

export default preview
```

- [ ] **Step 3: Add storybook script to package.json**

Add to scripts section of `package.json`:
```json
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build"
```

- [ ] **Step 4: Verify Storybook starts**

Run:
```bash
pnpm storybook
```

Expected: Storybook opens at `http://localhost:6006` with no stories yet. No errors in terminal.

- [ ] **Step 5: Commit**

```bash
git add .storybook/ package.json
git commit -m "feat: configure Storybook with mobile viewports and dark/light backgrounds"
```

---

### Task 15: Write token stories

**Files:**
- Create: `stories/1-Tokens/Colors.stories.ts`
- Create: `stories/1-Tokens/Typography.stories.ts`
- Create: `stories/1-Tokens/Spacing.stories.ts`
- Create: `stories/1-Tokens/Animations.stories.ts`

- [ ] **Step 1: Create Colors.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import { h } from 'vue'

const colorScales = {
  cyan: { label: 'Primary (Cyan)', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  magenta: { label: 'Secondary (Magenta)', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  green: { label: 'Success (Green)', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  red: { label: 'Error (Red)', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  gold: { label: 'Warning (Gold)', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  rush: { label: 'Neutral (Rush)', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
}

const ColorPalette = {
  name: 'ColorPalette',
  setup() {
    return () =>
      h('div', { style: 'display: flex; flex-direction: column; gap: 32px; padding: 24px;' },
        Object.entries(colorScales).map(([name, { label, shades }]) =>
          h('div', {}, [
            h('h3', {
              style: 'font-family: Outfit, sans-serif; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #e8e8f2;',
            }, label),
            h('div', { style: 'display: flex; gap: 4px;' },
              shades.map(shade =>
                h('div', {
                  style: `
                    width: 60px; height: 60px; border-radius: 8px;
                    background: var(--color-${name}-${shade});
                    display: flex; align-items: flex-end; justify-content: center;
                    padding: 4px; font-size: 10px; font-family: monospace;
                    color: ${shade < 400 ? '#06060e' : '#e8e8f2'};
                  `,
                }, String(shade)),
              ),
            ),
          ]),
        ),
      )
  },
}

const meta: Meta = {
  title: '1-Tokens/Colors',
  component: ColorPalette,
}

export default meta

type Story = StoryObj

export const AllColors: Story = {}
```

- [ ] **Step 2: Create Typography.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import { h } from 'vue'

const TypographyShowcase = {
  name: 'TypographyShowcase',
  setup() {
    const samples = [
      { family: 'font-sans', label: 'Outfit (Sans)', weights: ['400', '500', '600', '700'] },
      { family: 'font-mono', label: 'Azeret Mono', weights: ['400', '700', '900'] },
    ]
    const sizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl']

    return () =>
      h('div', { style: 'display: flex; flex-direction: column; gap: 40px; padding: 24px; color: #e8e8f2;' }, [
        ...samples.map(({ family, label, weights }) =>
          h('div', {}, [
            h('h3', { style: 'font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #7c7c96;' }, label),
            ...weights.map(w =>
              h('p', {
                class: family,
                style: `font-weight: ${w}; font-size: 24px; margin-bottom: 8px;`,
              }, `Weight ${w} — The quick brown fox jumps over the lazy dog`),
            ),
          ]),
        ),
        h('div', {}, [
          h('h3', { style: 'font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #7c7c96;' }, 'Size Scale'),
          ...sizes.map(size =>
            h('p', {
              class: `font-sans ${size}`,
              style: 'margin-bottom: 6px;',
            }, `${size} — Symbol Rush`),
          ),
        ]),
      ])
  },
}

const meta: Meta = {
  title: '1-Tokens/Typography',
  component: TypographyShowcase,
}

export default meta

type Story = StoryObj

export const FontFamilies: Story = {}
```

- [ ] **Step 3: Create Spacing.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import { h } from 'vue'

const SpacingShowcase = {
  name: 'SpacingShowcase',
  setup() {
    const spacings = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48]

    return () =>
      h('div', { style: 'padding: 24px; color: #e8e8f2;' }, [
        h('h3', { style: 'font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #7c7c96;' }, 'Tailwind Spacing Scale'),
        ...spacings.map(s =>
          h('div', { style: 'display: flex; align-items: center; gap: 12px; margin-bottom: 4px;' }, [
            h('span', { style: 'font-family: monospace; font-size: 12px; min-width: 40px; color: #7c7c96;' }, String(s)),
            h('div', {
              style: `width: ${s * 4}px; height: 16px; background: var(--color-cyan-400); border-radius: 2px; opacity: 0.7;`,
            }),
            h('span', { style: 'font-family: monospace; font-size: 11px; color: #60607a;' }, `${s * 4}px`),
          ]),
        ),
      ])
  },
}

const meta: Meta = {
  title: '1-Tokens/Spacing',
  component: SpacingShowcase,
}

export default meta

type Story = StoryObj

export const Scale: Story = {}
```

- [ ] **Step 4: Create Animations.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import { h, ref } from 'vue'

const AnimationShowcase = {
  name: 'AnimationShowcase',
  setup() {
    const trigger = ref(0)

    function replay() {
      trigger.value++
    }

    return () =>
      h('div', { style: 'padding: 24px; display: flex; flex-direction: column; gap: 32px; color: #e8e8f2;' }, [
        h('button', {
          onClick: replay,
          style: 'padding: 8px 16px; background: var(--color-cyan-400); color: #06060e; border: none; border-radius: 8px; cursor: pointer; font-family: monospace; font-weight: 700; align-self: flex-start;',
        }, 'Replay Animations'),

        h('div', { key: `se-${trigger.value}`, style: 'font-size: 48px; animation: symbol-enter 0.3s ease;' }, '▲ symbol-enter'),
        h('div', { key: `sd-${trigger.value}`, style: 'font-size: 18px; animation: slide-down 0.3s ease;' }, 'slide-down'),
        h('div', { key: `sil-${trigger.value}`, style: 'font-size: 18px; animation: slide-in-left 0.3s ease;' }, 'slide-in-left'),
        h('div', { style: 'position: relative; width: 200px; height: 200px; background: rgba(255,255,255,0.04); border-radius: 8px; overflow: hidden;' }, [
          h('div', {
            style: 'position: absolute; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--color-cyan-400), transparent); animation: scan 2.5s linear infinite;',
          }),
          h('span', { style: 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 12px; color: #7c7c96;' }, 'scan'),
        ]),
      ])
  },
}

const meta: Meta = {
  title: '1-Tokens/Animations',
  component: AnimationShowcase,
}

export default meta

type Story = StoryObj

export const AllAnimations: Story = {}
```

- [ ] **Step 5: Commit**

```bash
git add stories/1-Tokens/
git commit -m "feat: add design token stories (colors, typography, spacing, animations)"
```

---

### Task 16: Write Nuxt UI themed component stories

**Files:**
- Create: `stories/2-NuxtUI/Button.stories.ts`
- Create: `stories/2-NuxtUI/Input.stories.ts`
- Create: `stories/2-NuxtUI/Badge.stories.ts`
- Create: `stories/2-NuxtUI/Modal.stories.ts`
- Create: `stories/2-NuxtUI/Toast.stories.ts`
- Create: `stories/2-NuxtUI/Progress.stories.ts`
- Create: `stories/2-NuxtUI/Alert.stories.ts`
- Create: `stories/2-NuxtUI/Avatar.stories.ts`
- Create: `stories/2-NuxtUI/Switch.stories.ts`
- Create: `stories/2-NuxtUI/ColorMode.stories.ts`

- [ ] **Step 1: Create Button.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = {
  title: '2-NuxtUI/Button',
  // UButton is auto-imported by Nuxt — use in render templates directly
  argTypes: {
    label: { control: 'text' },
    color: { control: 'select', options: ['primary', 'secondary', 'success', 'error', 'warning', 'neutral'] },
    variant: { control: 'select', options: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    block: { control: 'boolean' },
  },
  args: {
    label: 'Join Game',
    color: 'primary',
    variant: 'solid',
    size: 'lg',
    disabled: false,
    loading: false,
    block: false,
  },
}

export default meta
type Story = StoryObj

export const Primary: Story = {}

export const Secondary: Story = {
  args: { label: 'Cancel', color: 'secondary' },
}

export const Outline: Story = {
  args: { label: 'Host a Room', variant: 'outline' },
}

export const Ghost: Story = {
  args: { label: '← Back', variant: 'ghost', color: 'neutral' },
}

export const Danger: Story = {
  args: { label: 'End Room', color: 'error' },
}

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px; padding: 24px;">
        <UButton label="Solid" color="primary" variant="solid" />
        <UButton label="Outline" color="primary" variant="outline" />
        <UButton label="Soft" color="primary" variant="soft" />
        <UButton label="Subtle" color="primary" variant="subtle" />
        <UButton label="Ghost" color="primary" variant="ghost" />
        <UButton label="Link" color="primary" variant="link" />
      </div>
    `,
  }),
}

export const AllColors: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px; padding: 24px;">
        <UButton label="Primary" color="primary" />
        <UButton label="Secondary" color="secondary" />
        <UButton label="Success" color="success" />
        <UButton label="Error" color="error" />
        <UButton label="Warning" color="warning" />
        <UButton label="Neutral" color="neutral" />
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; padding: 24px;">
        <UButton label="XS" size="xs" />
        <UButton label="SM" size="sm" />
        <UButton label="MD" size="md" />
        <UButton label="LG" size="lg" />
        <UButton label="XL" size="xl" />
      </div>
    `,
  }),
}
```

- [ ] **Step 2: Create Input.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = {
  title: '2-NuxtUI/Input',
  // UInput is auto-imported by Nuxt — use in render templates directly
  argTypes: {
    placeholder: { control: 'text' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    disabled: { control: 'boolean' },
    color: { control: 'select', options: ['primary', 'secondary', 'error', 'neutral'] },
  },
  args: {
    placeholder: 'Your name',
    size: 'lg',
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {}

export const RoomCode: Story = {
  args: {
    placeholder: 'ROOM CODE',
    ui: { base: 'font-mono font-bold text-2xl text-center tracking-[0.15em]' },
  },
}

export const WithError: Story = {
  args: {
    placeholder: 'Username',
    color: 'error',
  },
}
```

- [ ] **Step 3: Create Badge.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = {
  title: '2-NuxtUI/Badge',
  // UBadge is auto-imported by Nuxt — use in render templates directly
  argTypes: {
    label: { control: 'text' },
    color: { control: 'select', options: ['primary', 'secondary', 'success', 'error', 'warning', 'neutral'] },
    variant: { control: 'select', options: ['solid', 'outline', 'subtle', 'soft'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
  },
  args: { label: 'Connected', color: 'success', variant: 'subtle', size: 'sm' },
}

export default meta
type Story = StoryObj

export const Connected: Story = {}

export const Disconnected: Story = {
  args: { label: 'Disconnected', color: 'neutral' },
}

export const StatusVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; padding: 24px;">
        <UBadge label="Waiting" color="primary" variant="subtle" />
        <UBadge label="Playing" color="success" variant="subtle" />
        <UBadge label="Results" color="warning" variant="subtle" />
        <UBadge label="NEW BEST" color="warning" variant="subtle" size="xs" />
      </div>
    `,
  }),
}
```

- [ ] **Step 4: Create remaining Nuxt UI stories**

Create `stories/2-NuxtUI/Modal.stories.ts`:
```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

const meta: Meta = {
  title: '2-NuxtUI/Modal',
}

export default meta
type Story = StoryObj

export const JoinFlow: Story = {
  render: () => ({
    setup() {
      const open = ref(true)
      return { open }
    },
    template: `
      <UButton label="Open Join Modal" @click="open = true" />
      <UModal v-model:open="open" title="Join a Room">
        <template #body>
          <div class="flex flex-col gap-3 p-4">
            <UInput placeholder="ROOM CODE" :ui="{ base: 'font-mono font-bold text-xl text-center' }" />
            <UInput placeholder="Your name" />
            <UButton block label="Let's Go" />
          </div>
        </template>
      </UModal>
    `,
  }),
}
```

Create `stories/2-NuxtUI/Toast.stories.ts`:
```ts
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = {
  title: '2-NuxtUI/Toast',
}

export default meta
type Story = StoryObj

export const Notifications: Story = {
  render: () => ({
    setup() {
      const toast = useToast()
      return {
        showSuccess: () => toast.add({ title: 'Player joined!', description: 'Alice has joined the room', color: 'success' }),
        showError: () => toast.add({ title: 'Connection lost', description: 'Attempting to reconnect...', color: 'error' }),
        showInfo: () => toast.add({ title: 'Room code copied!', color: 'primary' }),
      }
    },
    template: `
      <div class="flex gap-3 p-6">
        <UButton label="Player Joined" color="success" @click="showSuccess" />
        <UButton label="Connection Error" color="error" @click="showError" />
        <UButton label="Code Copied" color="primary" variant="outline" @click="showInfo" />
      </div>
    `,
  }),
}
```

Create `stories/2-NuxtUI/Progress.stories.ts`:
```ts
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = {
  title: '2-NuxtUI/Progress',
  // UProgress is auto-imported by Nuxt — use in render templates directly
  argTypes: {
    modelValue: { control: { type: 'range', min: 0, max: 100 } },
    color: { control: 'select', options: ['primary', 'secondary', 'success', 'error', 'warning'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
  },
  args: { modelValue: 75, color: 'primary', size: 'xs' },
}

export default meta
type Story = StoryObj

export const Default: Story = {}

export const Urgent: Story = {
  args: { modelValue: 20, color: 'secondary' },
}
```

Create `stories/2-NuxtUI/Alert.stories.ts`:
```ts
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = {
  title: '2-NuxtUI/Alert',
}

export default meta
type Story = StoryObj

export const RoomFull: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-4 p-6 max-w-md">
        <UAlert title="Room is full" description="This room has reached its player limit." color="error" />
        <UAlert title="Connection lost" description="Trying to reconnect..." color="warning" />
        <UAlert title="You're in!" description="Waiting for the host to start." color="success" />
      </div>
    `,
  }),
}
```

Create `stories/2-NuxtUI/Avatar.stories.ts`:
```ts
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = {
  title: '2-NuxtUI/Avatar',
}

export default meta
type Story = StoryObj

export const PlayerInitials: Story = {
  render: () => ({
    template: `
      <div class="flex gap-3 p-6">
        <UAvatar text="A" size="xs" />
        <UAvatar text="B" size="sm" />
        <UAvatar text="C" size="md" />
        <UAvatar text="D" size="lg" />
      </div>
    `,
  }),
}
```

Create `stories/2-NuxtUI/Switch.stories.ts`:
```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

const meta: Meta = {
  title: '2-NuxtUI/Switch',
}

export default meta
type Story = StoryObj

export const HostSettings: Story = {
  render: () => ({
    setup() {
      const autoStart = ref(true)
      const showScores = ref(false)
      return { autoStart, showScores }
    },
    template: `
      <div class="flex flex-col gap-4 p-6">
        <div class="flex items-center gap-3">
          <USwitch v-model="autoStart" />
          <span class="text-sm">Auto-start rounds</span>
        </div>
        <div class="flex items-center gap-3">
          <USwitch v-model="showScores" />
          <span class="text-sm">Show live scores</span>
        </div>
      </div>
    `,
  }),
}
```

Create `stories/2-NuxtUI/ColorMode.stories.ts`:
```ts
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = {
  title: '2-NuxtUI/ColorMode',
}

export default meta
type Story = StoryObj

export const Toggle: Story = {
  render: () => ({
    template: `
      <div class="flex items-center gap-4 p-6">
        <span class="text-sm">Toggle theme:</span>
        <UColorModeButton />
      </div>
    `,
  }),
}
```

- [ ] **Step 5: Commit**

```bash
git add stories/2-NuxtUI/
git commit -m "feat: add Nuxt UI themed component stories"
```

---

### Task 17: Write game component stories

**Files:**
- Create all files in `stories/3-Game/`

- [ ] **Step 1: Create SymbolTile.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import SymbolTile from '~/components/game/SymbolTile.vue'

const meta: Meta<typeof SymbolTile> = {
  title: '3-Game/SymbolTile',
  component: SymbolTile,
  argTypes: {
    symbol: { control: 'select', options: ['▲', '●', '■', '✦', '◆', '✖'] },
  },
  args: { symbol: '▲' },
}

export default meta
type Story = StoryObj<typeof SymbolTile>

export const Default: Story = {}

export const AllSymbols: Story = {
  render: () => ({
    components: { SymbolTile },
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, 80px); gap: 12px; padding: 24px;">
        <SymbolTile symbol="▲" />
        <SymbolTile symbol="●" />
        <SymbolTile symbol="■" />
        <SymbolTile symbol="✦" />
        <SymbolTile symbol="◆" />
        <SymbolTile symbol="✖" />
      </div>
    `,
  }),
}
```

- [ ] **Step 2: Create SymbolGrid.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import SymbolGrid from '~/components/game/SymbolGrid.vue'

const meta: Meta<typeof SymbolGrid> = {
  title: '3-Game/SymbolGrid',
  component: SymbolGrid,
  args: {
    symbols: ['▲', '●', '■', '✦'],
    columns: 2,
  },
}

export default meta
type Story = StoryObj<typeof SymbolGrid>

export const TwoByTwo: Story = {}

export const ThreeByTwo: Story = {
  args: {
    symbols: ['▲', '●', '■', '✦', '◆', '✖'],
    columns: 3,
  },
}
```

- [ ] **Step 3: Create TimerBar.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import TimerBar from '~/components/game/TimerBar.vue'

const meta: Meta<typeof TimerBar> = {
  title: '3-Game/TimerBar',
  component: TimerBar,
  argTypes: {
    timeRemainingMs: { control: { type: 'range', min: 0, max: 30000, step: 1000 } },
    totalDurationMs: { control: 'number' },
    urgentThresholdMs: { control: 'number' },
  },
  args: {
    timeRemainingMs: 20000,
    totalDurationMs: 30000,
    urgentThresholdMs: 8000,
  },
}

export default meta
type Story = StoryObj<typeof TimerBar>

export const Normal: Story = {}

export const Urgent: Story = {
  args: { timeRemainingMs: 5000 },
}

export const AlmostDone: Story = {
  args: { timeRemainingMs: 1000 },
}
```

- [ ] **Step 4: Create remaining game component stories**

Create `stories/3-Game/ScoreFloat.stories.ts`:
```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import ScoreFloat from '~/components/game/ScoreFloat.vue'
import { ref } from 'vue'

const meta: Meta<typeof ScoreFloat> = {
  title: '3-Game/ScoreFloat',
  component: ScoreFloat,
}

export default meta
type Story = StoryObj<typeof ScoreFloat>

export const Interactive: Story = {
  render: () => ({
    components: { ScoreFloat },
    setup() {
      const floatRef = ref<InstanceType<typeof ScoreFloat> | null>(null)
      function showCorrect(e: MouseEvent) {
        floatRef.value?.show(e.clientX, e.clientY, true, 10)
      }
      function showWrong(e: MouseEvent) {
        floatRef.value?.show(e.clientX, e.clientY, false, -5)
      }
      return { floatRef, showCorrect, showWrong }
    },
    template: `
      <div style="padding: 48px; display: flex; gap: 16px;">
        <ScoreFloat ref="floatRef" />
        <button @click="showCorrect" style="padding: 16px 32px; background: var(--color-green-400); color: #06060e; border: none; border-radius: 8px; cursor: pointer; font-weight: 700;">
          Click for +10
        </button>
        <button @click="showWrong" style="padding: 16px 32px; background: var(--color-red-400); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700;">
          Click for -5
        </button>
      </div>
    `,
  }),
}
```

Create `stories/3-Game/ScoreDisplay.stories.ts`:
```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import ScoreDisplay from '~/components/game/ScoreDisplay.vue'
import { ref } from 'vue'

const meta: Meta<typeof ScoreDisplay> = {
  title: '3-Game/ScoreDisplay',
  component: ScoreDisplay,
  args: { score: 42 },
}

export default meta
type Story = StoryObj<typeof ScoreDisplay>

export const Default: Story = {}

export const WithFlash: Story = {
  render: () => ({
    components: { ScoreDisplay },
    setup() {
      const score = ref(42)
      const displayRef = ref<InstanceType<typeof ScoreDisplay> | null>(null)
      function correct() { score.value += 10; displayRef.value?.flash(true) }
      function wrong() { score.value -= 5; displayRef.value?.flash(false) }
      return { score, displayRef, correct, wrong }
    },
    template: `
      <div style="display: flex; align-items: center; gap: 16px; padding: 24px;">
        <ScoreDisplay ref="displayRef" :score="score" />
        <button @click="correct" style="padding: 8px 16px; background: var(--color-green-400); color: #06060e; border: none; border-radius: 6px; cursor: pointer;">+10</button>
        <button @click="wrong" style="padding: 8px 16px; background: var(--color-red-400); color: white; border: none; border-radius: 6px; cursor: pointer;">-5</button>
      </div>
    `,
  }),
}
```

Create `stories/3-Game/LeaderboardRow.stories.ts`:
```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import LeaderboardRow from '~/components/game/LeaderboardRow.vue'

const meta: Meta<typeof LeaderboardRow> = {
  title: '3-Game/LeaderboardRow',
  component: LeaderboardRow,
  args: { rank: 1, username: 'Alice', score: 120, isNewBest: false },
}

export default meta
type Story = StoryObj<typeof LeaderboardRow>

export const Gold: Story = {}
export const Silver: Story = { args: { rank: 2, username: 'Bob', score: 95 } }
export const Bronze: Story = { args: { rank: 3, username: 'Carol', score: 80 } }
export const NewBest: Story = { args: { rank: 1, username: 'Alice', score: 120, isNewBest: true } }
export const Regular: Story = { args: { rank: 7, username: 'Dave', score: 35 } }
```

Create `stories/3-Game/Leaderboard.stories.ts`:
```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import Leaderboard from '~/components/game/Leaderboard.vue'

const sampleEntries = [
  { playerId: '1', username: 'Alice', bestScore: 120, sessionCount: 3 },
  { playerId: '2', username: 'Bob', bestScore: 95, sessionCount: 3 },
  { playerId: '3', username: 'Carol', bestScore: 80, sessionCount: 2 },
  { playerId: '4', username: 'Dave', bestScore: 60, sessionCount: 1 },
  { playerId: '5', username: 'Eve', bestScore: 45, sessionCount: 2 },
]

const meta: Meta<typeof Leaderboard> = {
  title: '3-Game/Leaderboard',
  component: Leaderboard,
  args: { entries: sampleEntries },
}

export default meta
type Story = StoryObj<typeof Leaderboard>

export const Default: Story = {}
export const Empty: Story = { args: { entries: [] } }
export const WithNewBest: Story = {
  args: {
    entries: sampleEntries,
    sessionScores: [{ playerId: '1', username: 'Alice', score: 120 }],
  },
}
```

Create `stories/3-Game/RoomCodeDisplay.stories.ts`:
```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import RoomCodeDisplay from '~/components/game/RoomCodeDisplay.vue'

const meta: Meta<typeof RoomCodeDisplay> = {
  title: '3-Game/RoomCodeDisplay',
  component: RoomCodeDisplay,
  args: { code: 'ABCD12', size: 'md', copyable: true },
}

export default meta
type Story = StoryObj<typeof RoomCodeDisplay>

export const Default: Story = {}
export const Large: Story = { args: { size: 'lg' } }
export const Small: Story = { args: { size: 'sm' } }
export const NoCopy: Story = { args: { copyable: false } }
```

Create `stories/3-Game/QRJoinDisplay.stories.ts`:
```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import QRJoinDisplay from '~/components/game/QRJoinDisplay.vue'

const meta: Meta<typeof QRJoinDisplay> = {
  title: '3-Game/QRJoinDisplay',
  component: QRJoinDisplay,
  args: { roomCode: 'DEMO42' },
}

export default meta
type Story = StoryObj<typeof QRJoinDisplay>

export const Default: Story = {}
```

Create `stories/3-Game/PlayerList.stories.ts`:
```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import PlayerList from '~/components/game/PlayerList.vue'

const players = [
  { id: '1', username: 'Alice' },
  { id: '2', username: 'Bob' },
  { id: '3', username: 'Carol' },
  { id: '4', username: 'Dave' },
]

const meta: Meta<typeof PlayerList> = {
  title: '3-Game/PlayerList',
  component: PlayerList,
  args: { players },
}

export default meta
type Story = StoryObj<typeof PlayerList>

export const Default: Story = {}
export const Empty: Story = { args: { players: [] } }
export const WithScores: Story = {
  args: { players, scores: { '1': 120, '2': 95, '3': 80, '4': 60 } },
}
```

Create `stories/3-Game/GameStatusBanner.stories.ts`:
```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import GameStatusBanner from '~/components/game/GameStatusBanner.vue'

const meta: Meta<typeof GameStatusBanner> = {
  title: '3-Game/GameStatusBanner',
  component: GameStatusBanner,
  argTypes: {
    status: { control: 'select', options: ['connecting', 'waiting', 'lobby', 'playing', 'finished', 'results'] },
    roundCount: { control: 'number' },
  },
  args: { status: 'lobby', roundCount: 0 },
}

export default meta
type Story = StoryObj<typeof GameStatusBanner>

export const Lobby: Story = {}
export const Playing: Story = { args: { status: 'playing', roundCount: 3 } }
export const Results: Story = { args: { status: 'results', roundCount: 3 } }
```

- [ ] **Step 5: Commit**

```bash
git add stories/3-Game/
git commit -m "feat: add game component stories"
```

---

### Task 18: Write composition stories

**Files:**
- Create: `stories/4-Compositions/LobbyScreen.stories.ts`
- Create: `stories/4-Compositions/GameplayScreen.stories.ts`
- Create: `stories/4-Compositions/HostPanel.stories.ts`

- [ ] **Step 1: Create LobbyScreen.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = {
  title: '4-Compositions/LobbyScreen',
  parameters: {
    viewport: { defaultViewport: 'projector' },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj

export const WithPlayers: Story = {
  render: () => ({
    template: `
      <div class="grid-bg min-h-screen grid grid-cols-[3fr_1fr] p-10 gap-6" style="background: var(--color-rush-950);">
        <div class="flex flex-col items-center justify-center gap-6">
          <span class="font-mono text-sm text-neutral-400 uppercase tracking-[0.15em]">SCAN TO JOIN</span>
          <div class="w-[300px] h-[300px] bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-500 text-sm">
            QR Code Placeholder
          </div>
          <span class="font-mono font-black text-7xl text-primary">DEMO42</span>
        </div>
        <div class="flex flex-col gap-3 self-center">
          <p class="font-mono text-sm text-neutral-400"><span class="font-bold text-neutral-100">4</span> players</p>
          <UBadge color="success" variant="subtle" size="sm">Alice</UBadge>
          <UBadge color="success" variant="subtle" size="sm">Bob</UBadge>
          <UBadge color="success" variant="subtle" size="sm">Carol</UBadge>
          <UBadge color="success" variant="subtle" size="sm">Dave</UBadge>
          <p class="font-mono text-sm text-neutral-400 mt-auto">
            Starts in <span class="font-bold text-primary">45</span>s
          </p>
        </div>
      </div>
    `,
  }),
}
```

- [ ] **Step 2: Create GameplayScreen.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import SymbolGrid from '~/components/game/SymbolGrid.vue'
import ScoreDisplay from '~/components/game/ScoreDisplay.vue'
import TimerBar from '~/components/game/TimerBar.vue'

const meta: Meta = {
  title: '4-Compositions/GameplayScreen',
  parameters: {
    viewport: { defaultViewport: 'iphoneSE' },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj

export const Playing: Story = {
  render: () => ({
    components: { SymbolGrid, ScoreDisplay, TimerBar },
    template: `
      <div class="grid-bg grid-bg-phone min-h-screen relative select-none" style="background: var(--color-rush-950); color: var(--color-rush-100);">
        <TimerBar :time-remaining-ms="20000" :total-duration-ms="30000" />
        <div class="min-h-screen flex flex-col items-center pt-6 px-6 relative z-1 gap-4">
          <div class="w-full flex justify-between items-center px-1">
            <span class="font-mono text-neutral-400">22s</span>
            <ScoreDisplay :score="30" />
          </div>
          <p class="font-mono text-neutral-400 text-xs uppercase tracking-widest">
            TAP THE SYMBOL ON SCREEN!
          </p>
          <SymbolGrid
            :symbols="['▲', '●', '■', '✦']"
            class="mt-auto mb-auto"
          />
        </div>
      </div>
    `,
  }),
}
```

- [ ] **Step 3: Create HostPanel.stories.ts**

```ts
import type { Meta, StoryObj } from '@storybook/vue3'
import RoomCodeDisplay from '~/components/game/RoomCodeDisplay.vue'
import GameStatusBanner from '~/components/game/GameStatusBanner.vue'
import PlayerList from '~/components/game/PlayerList.vue'

const meta: Meta = {
  title: '4-Compositions/HostPanel',
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj

export const Lobby: Story = {
  render: () => ({
    components: { RoomCodeDisplay, GameStatusBanner, PlayerList },
    template: `
      <div class="grid-bg min-h-screen flex justify-center p-8" style="background: var(--color-rush-950); color: var(--color-rush-100);">
        <div class="w-full max-w-[480px] flex flex-col relative z-1">
          <div class="flex items-center justify-between pb-6 mb-6 border-b border-neutral-800">
            <h1 class="font-mono font-black text-xl text-primary tracking-wide">
              SYMBOL<span class="text-neutral-400">RUSH</span>
            </h1>
            <span class="w-2 h-2 rounded-full bg-success shadow-[0_0_6px_rgba(0,255,136,0.4)]" />
          </div>

          <div class="py-4 border-b border-neutral-900">
            <div class="flex items-baseline gap-3 mb-2">
              <span class="text-sm text-neutral-400">Room</span>
              <RoomCodeDisplay code="DEMO42" size="sm" />
            </div>
            <GameStatusBanner status="lobby" />
          </div>

          <div class="py-4 border-b border-neutral-900">
            <h2 class="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              Players <UBadge variant="subtle" color="neutral" size="xs">3</UBadge>
            </h2>
            <PlayerList
              :players="[
                { id: '1', username: 'Alice' },
                { id: '2', username: 'Bob' },
                { id: '3', username: 'Carol' },
              ]"
              :scores="{ '1': 120, '2': 95, '3': 80 }"
            />
          </div>

          <div class="pt-5">
            <UButton block size="lg">Start Round</UButton>
          </div>
        </div>
      </div>
    `,
  }),
}
```

- [ ] **Step 4: Verify all stories render in Storybook**

Run:
```bash
pnpm storybook
```

Expected: Storybook opens at `http://localhost:6006` showing all 4 story categories:
- 1-Tokens: Colors, Typography, Spacing, Animations
- 2-NuxtUI: Button, Input, Badge, Modal, Toast, Progress, Alert, Avatar, Switch, ColorMode
- 3-Game: All 11 game components
- 4-Compositions: LobbyScreen, GameplayScreen, HostPanel

- [ ] **Step 5: Commit**

```bash
git add stories/4-Compositions/
git commit -m "feat: add composition stories for lobby, gameplay, and host panel"
```

---

## Final Verification

- [ ] **Run the full app**: `pnpm dev` — all 4 pages render correctly
- [ ] **Run Storybook**: `pnpm storybook` — all stories render without errors
- [ ] **Test color mode**: Toggle dark/light in both app and Storybook
- [ ] **Test mobile viewport**: Use Storybook's viewport switcher on gameplay screen
- [ ] **Final commit** (if any loose changes):

```bash
git add -A
git commit -m "feat: complete Symbol Rush design system with Storybook"
```
