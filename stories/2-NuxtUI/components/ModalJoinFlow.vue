<script setup lang="ts">
const open = ref(true)
</script>

<template>
  <UButton label="Open Join Modal" @click="open = true" />
  <UModal v-model:open="open" title="Join a Room">
    <template #body>
      <div class="flex flex-col gap-3 p-4">
        <UInput placeholder="ROOM CODE" :ui="{ base: 'font-mono font-bold text-xl text-center' }" />
        <UInput placeholder="Your name" />
        <UButton block label="Let's Go" />
      </div>
    </template>
  </UModal>
</template>
