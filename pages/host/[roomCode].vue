<script setup lang="ts">
// Reconnection stub — redirects to main host page for now
const router = useRouter()
onMounted(() => router.replace('/host'))
</script>

<template>
  <div class="center-screen grid-bg">
    <p class="mono muted">Redirecting...</p>
  </div>
</template>
