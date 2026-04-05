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
  <button class="symbol-tile" @click="handleTap">
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
