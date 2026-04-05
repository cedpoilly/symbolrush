<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const mode = ref<'choose' | 'join'>('choose')
const roomCode = ref('')
const username = ref('')
const error = ref('')
const loading = ref(false)

onMounted(() => {
  const queryRoom = route.query.room as string
  if (queryRoom) {
    roomCode.value = queryRoom.toUpperCase()
    mode.value = 'join'
  }
})

function handleJoin() {
  const code = roomCode.value.trim().toUpperCase()
  const name = username.value.trim()
  if (!code || !name) {
    error.value = 'Please enter both room code and username'
    return
  }
  loading.value = true
  router.push(`/play/${code}?u=${encodeURIComponent(name)}`)
}

function handleHost() {
  router.push('/host')
}

useHead({ title: 'Symbol Rush' })
</script>

<template>
  <div class="grid-bg min-h-dvh flex items-center justify-center p-6">
    <div class="max-w-[400px] w-full text-center relative z-1">
      <h1 class="font-mono font-black text-primary text-[clamp(2.5rem,8vw,3.5rem)] tracking-wide mb-2 title-glow">
        SYMBOL<span class="text-neutral-400">RUSH</span>
      </h1>
      <p class="text-neutral-400 mb-12">
        Match the symbol. Beat the clock. Win the prize.
      </p>

      <div v-if="mode === 'choose'" class="flex flex-col gap-3">
        <UButton block size="lg" @click="mode = 'join'">
          Join Game
        </UButton>
        <UButton block size="lg" variant="outline" @click="handleHost">
          Host a Room
        </UButton>
      </div>

      <form v-else class="flex flex-col gap-3" @submit.prevent="handleJoin">
        <UInput
          v-model="roomCode"
          placeholder="ROOM CODE"
          size="lg"
          :ui="{ base: 'font-mono font-bold text-2xl text-center tracking-[0.15em]' }"
          maxlength="6"
          autocapitalize="characters"
          @input="roomCode = roomCode.toUpperCase()"
        />
        <UInput
          v-model="username"
          placeholder="Your name"
          size="lg"
          maxlength="20"
        />
        <p v-if="error" class="text-error text-sm">{{ error }}</p>
        <UButton block size="lg" type="submit" :loading="loading">
          Let's Go
        </UButton>
        <UButton
          block
          size="lg"
          variant="ghost"
          color="neutral"
          @click="mode = 'choose'; error = ''"
        >
          &larr; Back
        </UButton>
      </form>
    </div>
  </div>
</template>

<style scoped>
.dark .title-glow {
  text-shadow: 0 0 30px rgba(0, 232, 255, 0.35), 0 0 60px rgba(0, 232, 255, 0.15);
}
</style>
