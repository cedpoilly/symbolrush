<script setup lang="ts">
const props = defineProps<{
  code: string
  size?: 'sm' | 'md' | 'lg'
  copyable?: boolean
}>()

const toast = useToast()
const copied = ref(false)

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code)
  } catch {
    const input = document.createElement('input')
    input.value = props.code
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    input.remove()
  }
  copied.value = true
  toast.add({ title: 'Room code copied!', color: 'success' })
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="room-code-display">
    <span
      class="room-code font-mono"
      :class="{
        'text-3xl': size === 'sm',
        'text-5xl': !size || size === 'md',
        'text-7xl lg:text-8xl': size === 'lg',
      }"
    >
      {{ code }}
    </span>
    <UButton
      v-if="copyable"
      :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
      variant="ghost"
      color="primary"
      size="sm"
      @click="copyCode"
    />
  </div>
</template>

<style scoped>
.room-code-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.room-code {
  font-weight: 900;
  color: var(--color-cyan-400);
  letter-spacing: 0.08em;
}

.dark .room-code {
  text-shadow: 0 0 20px rgba(0, 232, 255, 0.35);
}
</style>
