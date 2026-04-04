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
  <div class="symbol-grid" :style="{ gridTemplateColumns: `repeat(${columns ?? 2}, 1fr)` }">
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
