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
  <UButton
    variant="soft"
    color="neutral"
    class="symbol-tile"
    :ui="{ base: 'aspect-square text-[40px] justify-center min-h-[44px] min-w-[44px]' }"
    @click="handleTap"
  >
    {{ symbol }}
  </UButton>
</template>

<style scoped>
.symbol-tile {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
}

.symbol-tile:active {
  transform: scale(0.93);
}
</style>
