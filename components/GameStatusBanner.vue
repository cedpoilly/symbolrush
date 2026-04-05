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
    <span v-if="roundCount" class="text-sm font-mono text-neutral-300">
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
