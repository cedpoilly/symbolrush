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
  <div class="landing grid-bg">
    <div class="landing-container">
      <h1 class="title">SYMBOL<span class="rush">RUSH</span></h1>
      <p class="subtitle">Match the symbol. Beat the clock. Win the prize.</p>

      <div v-if="mode === 'choose'" class="actions">
        <button class="btn btn-primary" @click="mode = 'join'">Join Game</button>
        <button class="btn btn-outline" @click="handleHost">Host a Room</button>
      </div>

      <form v-else class="join-form" @submit.prevent="handleJoin">
        <input
          v-model="roomCode"
          type="text"
          placeholder="ROOM CODE"
          maxlength="6"
          class="input input-code"
          autocapitalize="characters"
          @input="roomCode = roomCode.toUpperCase()"
        />
        <input
          v-model="username"
          type="text"
          placeholder="Your name"
          maxlength="20"
          class="input"
        />
        <p v-if="error" class="error-text">{{ error }}</p>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Joining...' : "Let's Go" }}
        </button>
        <button type="button" class="btn btn-ghost" @click="mode = 'choose'; error = ''">
          ← Back
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.landing-container {
  max-width: 400px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 1;
}

.title {
  font-family: 'Azeret Mono', monospace;
  font-weight: 900;
  font-size: clamp(2.5rem, 8vw, 3.5rem);
  color: var(--cyan);
  text-shadow: 0 0 30px var(--cyan-glow), 0 0 60px rgba(0, 232, 255, 0.15);
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}

.rush {
  color: var(--muted);
}

.subtitle {
  font-family: 'Outfit', sans-serif;
  color: var(--muted);
  font-size: 1rem;
  margin-bottom: 48px;
}

.actions,
.join-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  padding: 14px 18px;
  background: var(--surface2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--cyan);
}

.input-code {
  font-family: 'Azeret Mono', monospace;
  font-weight: 700;
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 0.15em;
}

.error-text {
  color: var(--red);
  font-size: 0.875rem;
}

.btn {
  font-family: 'Azeret Mono', monospace;
  font-weight: 700;
  font-size: 1rem;
  padding: 14px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  transition: all 0.15s ease;
}

.btn:active {
  transform: scale(0.97);
}

.btn-primary {
  background: var(--cyan);
  color: var(--bg);
}

.btn-primary:hover {
  box-shadow: 0 0 20px var(--cyan-glow);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  color: var(--cyan);
  border: 1.5px solid rgba(0, 232, 255, 0.3);
}

.btn-outline:hover {
  border-color: var(--cyan);
  background: var(--cyan-dim);
}

.btn-ghost {
  background: transparent;
  color: var(--muted);
}

.btn-ghost:hover {
  color: var(--text);
}
</style>
