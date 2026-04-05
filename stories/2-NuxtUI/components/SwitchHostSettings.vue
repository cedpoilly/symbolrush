<script setup lang="ts">
const autoStart = ref(true)
const showScores = ref(false)
</script>

<template>
  <div class="flex flex-col gap-4 p-6">
    <div class="flex items-center gap-3">
      <USwitch v-model="autoStart" />
      <span class="text-sm">Auto-start rounds</span>
    </div>
    <div class="flex items-center gap-3">
      <USwitch v-model="showScores" />
      <span class="text-sm">Show live scores</span>
    </div>
  </div>
</template>
