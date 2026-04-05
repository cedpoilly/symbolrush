<script setup lang="ts">
defineProps<{
  rank: number
  username: string
  score: number
  isNewBest?: boolean
}>()
</script>

<template>
  <UCard
    :ui="{
      root: 'lb-row',
      body: 'flex items-center gap-3 p-3',
    }"
    :class="{
      'rank-1': rank === 1,
      'rank-2': rank === 2,
      'rank-3': rank === 3,
    }"
    variant="subtle"
  >
    <span class="lb-rank font-mono">#{{ rank }}</span>
    <span class="lb-name flex-1 font-medium">{{ username }}</span>
    <UBadge v-if="isNewBest" color="warning" variant="subtle" size="xs">
      NEW BEST
    </UBadge>
    <span class="lb-score font-mono font-bold text-primary min-w-[50px] text-right">{{ score }}</span>
  </UCard>
</template>

<style scoped>
.lb-row {
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

:root.light .lb-rank { color: var(--color-rush-500); }
:root.light .rank-1 .lb-rank { text-shadow: none; }
</style>
