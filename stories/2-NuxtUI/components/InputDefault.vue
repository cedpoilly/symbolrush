<template>
  <div style="max-width: 400px; padding: 24px; display: flex; flex-direction: column; gap: 12px;">
    <UInput placeholder="Your name" size="lg" />
    <UInput placeholder="ROOM CODE" size="lg" :ui="{ base: 'font-mono font-bold text-2xl text-center tracking-[0.15em]' }" />
  </div>
</template>
