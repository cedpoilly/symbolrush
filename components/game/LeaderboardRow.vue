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
