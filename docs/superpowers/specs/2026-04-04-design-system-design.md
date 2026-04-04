# Symbol Rush Design System

## Overview

A full design system for the Symbol Rush multiplayer game, built on **Nuxt UI v4** with **Storybook** documentation. The system provides a themed component library that accounts for mobile/touch inputs and supports dark (default) + light color modes.

**Visual direction:** Hybrid — cyberpunk neon energy for game moments (symbols, scores, timer), clean restrained UI for everything else (forms, navigation, settings).

**Foundation:** Nuxt UI v4 (128 components, Tailwind CSS v4, Reka UI) themed to the Symbol Rush aesthetic. Game-specific components built on top.

## Theme Token Architecture

### Semantic Color Mapping

The current CSS custom properties map onto Nuxt UI's semantic color system:

| Nuxt UI Token | Dark Mode Value | CSS Origin | Usage |
|---|---|---|---|
| `primary` | cyan `#00e8ff` | `--cyan` | CTAs, active states, brand accent |
| `secondary` | magenta `#ff2d78` | `--magenta` | Urgency, timer danger, alt actions |
| `success` | green `#00ff88` | `--green` | Correct taps, positive feedback |
| `error` | red `#ff3355` | `--red` | Wrong taps, destructive actions |
| `warning` | gold `#ffc233` | `--gold` | Rank 1, achievements, attention |
| `neutral` | custom scale from `#06060e` | `--bg`, `--surface`, `--text` | Backgrounds, text, borders |

Each color requires a full 50–950 shade scale defined in `@theme` for Nuxt UI compatibility. The neon values sit around the 400–500 range of their respective scales.

### Typography

```css
@theme {
  --font-sans: 'Outfit', system-ui, sans-serif;
  --font-mono: 'Azeret Mono', monospace;
}
```

- **Outfit** (400, 500, 600, 700) — all UI text
- **Azeret Mono** (400, 700, 900) — room codes, scores, timer, symbol displays

### Light Mode Strategy

Dark is the brand default. Light mode:
- Inverts the neutral scale (dark text on light backgrounds)
- Slightly desaturates neon colors for comfortable readability on white
- Replaces glow/text-shadow effects with subtle box-shadows
- Maintains the same semantic token names — components don't change, only the resolved values

### Configuration Files

**`nuxt.config.ts`** — register semantic color names:
```ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxtjs/storybook'],
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'success', 'error', 'warning', 'neutral']
    }
  }
})
```

**`app.config.ts`** — assign color scales (these names reference custom scales defined in `@theme`):
```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'cyan',      // --color-cyan-50 through --color-cyan-950
      secondary: 'magenta', // --color-magenta-50 through --color-magenta-950
      success: 'green',     // --color-green-50 through --color-green-950
      error: 'red',         // --color-red-50 through --color-red-950
      warning: 'gold',      // --color-gold-50 through --color-gold-950
      neutral: 'rush'       // --color-rush-50 through --color-rush-950
    }
  }
})
```

**`assets/css/main.css`** — define custom color scales and tokens:
```css
@import "tailwindcss";
@import "@nuxt/ui";

@theme {
  --font-sans: 'Outfit', system-ui, sans-serif;
  --font-mono: 'Azeret Mono', monospace;

  --color-cyan-50: /* ... */;
  /* full 50-950 scales for cyan, magenta, green, red, gold, rush(neutral) */
}
```

## Component Inventory

### Tier 1: Themed Nuxt UI Components

We configure these via theming, not build from scratch. Documented in Storybook with Symbol Rush-specific variants.

| Component | Nuxt UI | Variants |
|---|---|---|
| Button | `UButton` | primary (cyan), secondary (magenta), ghost, danger; sizes sm/md/lg; touch-friendly 44px+ targets |
| Input | `UInput` | monospace variant (room codes), standard (usernames) |
| Badge | `UBadge` | connected (green), disconnected (muted), room status (waiting/playing/finished) |
| Modal | `UModal` | join flow overlay, game-over results |
| Toast | `UToast` | player joined, errors, session events |
| Tooltip | `UTooltip` | host controls help text |
| Progress | `UProgress` | timer bar with cyan→magenta gradient |
| Tabs | `UTabs` | leaderboard views (session vs all-time) |
| Separator | `USeparator` | section dividers |
| Skeleton | `USkeleton` | loading states for leaderboard, player list |
| Avatar | `UAvatar` | player initials |
| Alert | `UAlert` | room full, connection errors |
| Switch | `USwitch` | host settings toggles |
| ColorModeButton | `UColorModeButton` | dark/light toggle |

### Tier 2: Custom Game Components

Built as Vue components in `components/game/`. Use Nuxt UI primitives internally where appropriate.

| Component | Purpose | Key Details |
|---|---|---|
| `SymbolTile` | Single tappable symbol with ripple + float feedback | Touch events, CSS animations, emits `tap` with position data |
| `SymbolGrid` | 2x2 (or configurable) grid of SymbolTiles | Layout wrapper, receives `symbols[]` and `currentSymbol` |
| `TimerBar` | Full-width countdown bar with color transition | Uses `UProgress` internally, cyan→magenta gradient based on remaining time |
| `ScoreFloat` | Animated +10/-5 floating from tap position | Absolute positioned, `float-up` keyframe animation, auto-removes |
| `ScoreDisplay` | Current score with flash feedback (green/red) | Inline display with animation triggers on score change |
| `LeaderboardRow` | Single player row: rank, name, score | Flat layout (no card wrapping), rank coloring: gold/silver/bronze |
| `Leaderboard` | Full leaderboard list | Composes LeaderboardRows, handles empty state via `UEmpty` |
| `RoomCodeDisplay` | Large monospace room code with copy action | Uses `UButton` for copy, `UToast` for confirmation |
| `QRJoinDisplay` | QR code with room code below | Canvas-based QR rendering + RoomCodeDisplay |
| `PlayerList` | Connected players with status badges | Flat list with `UBadge` for status, `UAvatar` for initials |
| `GameStatusBanner` | Current game phase indicator | Contextual styling per phase: waiting (muted), playing (cyan glow), finished (gold) |

### Design Constraints

- **No card abuse** — use spacing and typography hierarchy over wrapping content in bordered containers. Cards only when content genuinely needs a bounded surface.
- **Minimum 44x44px touch targets** (WCAG) on all interactive elements
- **`touch-action: manipulation`** on all tappable elements
- **No hover-dependent interactions** — hover enhances but isn't required for functionality
- **Ripple feedback on tap** for visual confirmation
- **`overscroll-behavior: none`** on game screens to prevent scroll bounce
- **Responsive sizing** via `clamp()` and container queries

## Storybook Structure

```
stories/
├── 1-Tokens/
│   ├── Colors.stories.ts
│   ├── Typography.stories.ts
│   ├── Spacing.stories.ts
│   └── Animations.stories.ts
│
├── 2-NuxtUI/
│   ├── Button.stories.ts
│   ├── Input.stories.ts
│   ├── Badge.stories.ts
│   ├── Modal.stories.ts
│   ├── Toast.stories.ts
│   ├── Progress.stories.ts
│   ├── Tabs.stories.ts
│   ├── Alert.stories.ts
│   ├── Avatar.stories.ts
│   ├── Switch.stories.ts
│   └── ColorMode.stories.ts
│
├── 3-Game/
│   ├── SymbolTile.stories.ts
│   ├── SymbolGrid.stories.ts
│   ├── TimerBar.stories.ts
│   ├── ScoreFloat.stories.ts
│   ├── ScoreDisplay.stories.ts
│   ├── Leaderboard.stories.ts
│   ├── LeaderboardRow.stories.ts
│   ├── RoomCodeDisplay.stories.ts
│   ├── QRJoinDisplay.stories.ts
│   ├── PlayerList.stories.ts
│   └── GameStatusBanner.stories.ts
│
└── 4-Compositions/
    ├── LobbyScreen.stories.ts
    ├── GameplayScreen.stories.ts
    └── HostPanel.stories.ts
```

### Story Conventions

- Each story includes **Controls** (Storybook args) for interactive prop tweaking
- Mobile viewport preset registered (375x667 iPhone SE) alongside desktop
- Dark and light mode toggled via `UApp` wrapper in Storybook decorator
- Touch interaction stories use Storybook `play` functions to simulate taps
- Stories live in root-level `stories/` directory, not inside `components/`

## Migration Path

### Phase 1: Foundation

- Install `@nuxt/ui`, `tailwindcss`, `@nuxtjs/storybook`
- Replace `assets/css/main.css` with Tailwind imports + `@theme` token definitions
- Generate full 50–950 shade scales for each neon color
- Configure `app.config.ts` with semantic color mapping
- Configure `nuxt.config.ts` with modules and theme color registration
- Wrap root layout with `<UApp>`
- Add light mode neutral/color variants
- Verify app renders correctly with new CSS foundation

### Phase 2: Extract Custom Game Components

- Create `components/game/` directory
- Extract from page files: SymbolTile, SymbolGrid, TimerBar, ScoreFloat, ScoreDisplay, LeaderboardRow, Leaderboard, RoomCodeDisplay, QRJoinDisplay, PlayerList, GameStatusBanner
- Each component gets typed props and emits
- Pages become thin orchestrators: layout + composable wiring

### Phase 3: Swap Raw HTML for Nuxt UI

- Replace `<button>` → `<UButton>`, `<input>` → `<UInput>` etc. inside pages and game components
- Replace hand-rolled modals → `<UModal>`
- Add `<UToast>` for notifications (player join, errors)
- Add `<UColorModeButton>` for dark/light toggle
- Add `<USkeleton>` loading states
- Remove redundant scoped CSS that Nuxt UI now handles

### Phase 4: Storybook

- Configure `@nuxtjs/storybook` with `UApp` decorator
- Register mobile viewport preset (375x667)
- Write token stories: Colors, Typography, Spacing, Animations
- Write Nuxt UI themed component stories with Symbol Rush variants
- Write custom game component stories with controls and touch simulation
- Write composition stories: LobbyScreen, GameplayScreen, HostPanel

### Phase Ordering Rationale

Tokens first ensures nothing looks broken during component extraction. Extracting game components before swapping Nuxt UI primitives allows testing each swap in isolation. Storybook last because it documents finished components, not works-in-progress.
