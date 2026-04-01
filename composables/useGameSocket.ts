import type { ClientMessage, ServerMessage } from '~/types/game'

type MessageHandler = (data: ServerMessage) => void

export function useGameSocket() {
  const ws = ref<WebSocket | null>(null)
  const connected = ref(false)
  const handlers = new Map<string, Set<MessageHandler>>()
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

  function connect() {
    if (import.meta.server) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const config = useRuntimeConfig()
    const url = config.public.wsUrl || `${protocol}//${window.location.host}/api/ws`

    const socket = new WebSocket(url)

    socket.onopen = () => {
      connected.value = true
    }

    socket.onclose = () => {
      connected.value = false
      reconnectTimeout = setTimeout(() => connect(), 2000)
    }

    socket.onmessage = (event) => {
      try {
        const data: ServerMessage = JSON.parse(event.data)

        const typeHandlers = handlers.get(data.type)
        if (typeHandlers) {
          for (const handler of typeHandlers) handler(data)
        }

        const wildcardHandlers = handlers.get('*')
        if (wildcardHandlers) {
          for (const handler of wildcardHandlers) handler(data)
        }
      } catch (e) {
        console.error('[SymbolRush] Failed to parse WS message:', e)
      }
    }

    socket.onerror = (e) => {
      console.error('[SymbolRush] WebSocket error:', e)
    }

    ws.value = socket
  }

  function send(message: ClientMessage) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(message))
    }
  }

  function on(type: string, handler: MessageHandler): () => void {
    if (!handlers.has(type)) handlers.set(type, new Set())
    handlers.get(type)!.add(handler)
    return () => { handlers.get(type)?.delete(handler) }
  }

  function disconnect() {
    if (reconnectTimeout) clearTimeout(reconnectTimeout)
    handlers.clear()
    if (ws.value) {
      ws.value.onclose = null
      ws.value.close()
      ws.value = null
    }
    connected.value = false
  }

  onUnmounted(() => disconnect())

  return { connected: readonly(connected), connect, send, on, disconnect }
}
