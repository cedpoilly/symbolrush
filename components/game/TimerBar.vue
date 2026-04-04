<script setup lang="ts">
const props = defineProps<{
  timeRemainingMs: number
  totalDurationMs: number
  urgentThresholdMs?: number
}>()

const percent = computed(() =>
  Math.max(0, (props.timeRemainingMs / props.totalDurationMs) * 100),
)

const isUrgent = computed(() =>
  props.timeRemainingMs < (props.urgentThresholdMs ?? 8000),
)
</script>

<template>
  <div class="timer-bar-container">
    <div
      class="timer-bar-fill"
      :class="{ urgent: isUrgent }"
      :style="{ width: `${percent}%` }"
    />
  </div>
</template>

<style scoped>
.timer-bar-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: var(--color-rush-800);
  z-index: 100;
}

.timer-bar-fill {
  height: 100%;
  background: var(--color-cyan-400);
  transition: width 0.1s linear;
  box-shadow: 0 0 10px rgba(0, 232, 255, 0.35);
}

.timer-bar-fill.urgent {
  background: var(--color-magenta-400);
  box-shadow: 0 0 12px rgba(255, 45, 120, 0.4);
}

:root.light .timer-bar-container {
  background: var(--color-rush-200);
}

:root.light .timer-bar-fill {
  box-shadow: none;
}

:root.light .timer-bar-fill.urgent {
  box-shadow: none;
}
</style>
