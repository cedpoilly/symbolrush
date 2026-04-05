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
