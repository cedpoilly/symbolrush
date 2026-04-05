<script setup lang="ts">
const toast = useToast()

function showSuccess() {
  toast.add({ title: 'Player joined!', description: 'Alice has joined the room', color: 'success' })
}
function showError() {
  toast.add({ title: 'Connection lost', description: 'Attempting to reconnect...', color: 'error' })
}
function showInfo() {
  toast.add({ title: 'Room code copied!', color: 'primary' })
}
</script>

<template>
  <div class="flex gap-3 p-6">
    <UButton label="Player Joined" color="success" @click="showSuccess" />
    <UButton label="Connection Error" color="error" @click="showError" />
    <UButton label="Code Copied" color="primary" variant="outline" @click="showInfo" />
  </div>
</template>
