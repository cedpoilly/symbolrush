<script setup lang="ts">
import type { LeaderboardEntry, SessionScore } from '~/types/game'
import LeaderboardRow from './LeaderboardRow.vue'

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
    <p v-else class="text-sm text-neutral-300">
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
