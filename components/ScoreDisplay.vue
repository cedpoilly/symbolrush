<script setup lang="ts">
const props = defineProps<{
  score: number
}>()

const flashClass = ref('')

function flash(correct: boolean) {
  flashClass.value = correct ? 'flash-green' : 'flash-red'
  setTimeout(() => { flashClass.value = '' }, 200)
}

defineExpose({ flash })
</script>

<template>
  <span class="score-display font-mono" :class="flashClass">
    {{ score }}
  </span>
</template>

<style scoped>
.score-display {
  font-weight: 900;
  font-size: 1.5rem;
  color: var(--color-cyan-400);
  transition: color 0.1s;
}

.flash-green {
  animation: flash-green-kf 0.2s ease;
}

.flash-red {
  animation: flash-red-kf 0.2s ease;
}
</style>
