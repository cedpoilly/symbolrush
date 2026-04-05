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
  <div>
    <p v-if="players.length === 0" class="text-sm text-neutral-400">
      No players yet — share the room code
    </p>
    <div v-else class="flex flex-col gap-1">
      <UCard
        v-for="player in players"
        :key="player.id"
        variant="subtle"
        :ui="{ body: 'flex items-center gap-2.5 p-2 px-3' }"
      >
        <UAvatar :text="player.username.charAt(0).toUpperCase()" size="xs" />
        <span class="font-medium text-sm flex-1">{{ player.username }}</span>
        <span v-if="scores" class="font-mono font-bold text-sm text-primary">
          {{ getScore(player.id, scores) }}
        </span>
      </UCard>
    </div>
  </div>
</template>
