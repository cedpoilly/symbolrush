import {
  createRoom, getRoom, addPlayer, removePlayer,
  startSession, rotateSymbol, handleTap, endSession,
  getLeaderboard, getSessionTimeRemaining, getSessionScores,
} from '../utils/game-engine'
import type { ClientMessage, ServerMessage } from '~/types/game'

interface PeerMeta {
  type: 'host' | 'player' | 'screen'
  roomCode: string
  playerId?: string
}

interface GameTimers {
  symbolInterval: ReturnType<typeof setInterval>
  tickInterval: ReturnType<typeof setInterval>
  scoresInterval: ReturnType<typeof setInterval>
  endTimeout: ReturnType<typeof setTimeout>
}

const peerMeta = new Map<string, PeerMeta>()
const roomPeers = new Map<string, Set<string>>()
const peerMap = new Map<string, any>()
const gameTimers = new Map<string, GameTimers>()

// ── Helpers ──

function sendTo(peerId: string, message: ServerMessage) {
  const peer = peerMap.get(peerId)
  if (peer) peer.send(JSON.stringify(message))
}

function broadcast(roomCode: string, message: ServerMessage, excludePeerId?: string) {
  const peers = roomPeers.get(roomCode)
  if (!peers) return
  const data = JSON.stringify(message)
  for (const peerId of peers) {
    if (peerId === excludePeerId) continue
    const peer = peerMap.get(peerId)
    if (peer) peer.send(data)
  }
}

function sendToDisplays(roomCode: string, message: ServerMessage) {
  const peers = roomPeers.get(roomCode)
  if (!peers) return
  const data = JSON.stringify(message)
  for (const peerId of peers) {
    const meta = peerMeta.get(peerId)
    if (meta?.type === 'host' || meta?.type === 'screen') {
      const peer = peerMap.get(peerId)
      if (peer) peer.send(data)
    }
  }
}

function addPeerToRoom(peerId: string, roomCode: string) {
  if (!roomPeers.has(roomCode)) roomPeers.set(roomCode, new Set())
  roomPeers.get(roomCode)!.add(peerId)
}

function removePeerFromRoom(peerId: string, roomCode: string) {
  const peers = roomPeers.get(roomCode)
  if (peers) {
    peers.delete(peerId)
    if (peers.size === 0) roomPeers.delete(roomCode)
  }
}

// ── Game loop ──

function startGameLoop(roomCode: string) {
  const room = getRoom(roomCode)
  if (!room || !room.currentSession) return

  const config = room.config

  const symbolInterval = setInterval(() => {
    const result = rotateSymbol(roomCode)
    if (result) {
      // Only host + public screens see the symbol — anti-cheat
      sendToDisplays(roomCode, {
        type: 'session:symbol-change',
        symbol: result.symbol,
        symbolChoices: result.choices,
      })
    }
  }, config.symbolIntervalMs)

  const tickInterval = setInterval(() => {
    const remaining = getSessionTimeRemaining(roomCode)
    broadcast(roomCode, { type: 'session:tick', timeRemainingMs: remaining })
  }, 100)

  // Live round scores to displays every 1s
  const scoresInterval = setInterval(() => {
    const scores = getSessionScores(roomCode)
    sendToDisplays(roomCode, { type: 'session:scores-update', scores })
  }, 1000)

  const endTimeout = setTimeout(() => {
    stopGameLoop(roomCode)
  }, config.sessionDurationMs)

  gameTimers.set(roomCode, { symbolInterval, tickInterval, scoresInterval, endTimeout })
}

async function stopGameLoop(roomCode: string) {
  const timers = gameTimers.get(roomCode)
  if (timers) {
    clearInterval(timers.symbolInterval)
    clearInterval(timers.tickInterval)
    clearInterval(timers.scoresInterval)
    clearTimeout(timers.endTimeout)
    gameTimers.delete(roomCode)
  }

  const room = getRoom(roomCode)
  const session = room?.currentSession

  const sessionScores = endSession(roomCode)
  const leaderboard = getLeaderboard(roomCode)

  broadcast(roomCode, { type: 'session:ended', scores: sessionScores })
  broadcast(roomCode, { type: 'leaderboard:update', leaderboard })

  // Flush to DB
  if (session && sessionScores.length > 0) {
    try {
      await flushSessionToDB(session, sessionScores, roomCode)
    } catch (err) {
      console.error('[SymbolRush] Failed to flush session to DB:', err)
    }
  }
}

async function flushSessionToDB(session: any, sessionScores: any[], roomCode: string) {
  const { useDB } = await import('../database/index')
  const schema = await import('../database/schema')
  const { nanoid } = await import('nanoid')

  const db = useDB()
  const room = getRoom(roomCode)

  // Upsert room
  await db.insert(schema.rooms).values({
    code: roomCode,
    config: room?.config ?? {},
  }).onConflictDoNothing()

  // Upsert players
  if (room) {
    for (const player of room.players.values()) {
      await db.insert(schema.players).values({
        id: player.id,
        username: player.username,
        roomCode: player.roomCode,
      }).onConflictDoNothing()
    }
  }

  // Insert session
  await db.insert(schema.sessions).values({
    id: session.id,
    roomCode,
    startedAt: new Date(session.startedAt),
    endedAt: new Date(),
  })

  // Batch insert scores
  const scoreRows = sessionScores.map((s: any) => ({
    id: nanoid(12),
    sessionId: session.id,
    playerId: s.playerId,
    roomCode,
    score: s.score,
  }))

  if (scoreRows.length > 0) {
    await db.insert(schema.scores).values(scoreRows)
  }
}

// ── WebSocket handler ──

export default defineWebSocketHandler({
  open(peer) {
    peerMap.set(peer.id, peer)
  },

  message(peer, msg) {
    let data: ClientMessage
    try {
      data = JSON.parse(typeof msg === 'string' ? msg : msg.text())
    } catch {
      sendTo(peer.id, { type: 'error', message: 'Invalid JSON' })
      return
    }

    switch (data.type) {
      case 'host:create-room': {
        const room = createRoom(data.config)
        peerMeta.set(peer.id, { type: 'host', roomCode: room.code })
        addPeerToRoom(peer.id, room.code)
        sendTo(peer.id, { type: 'room:created', roomCode: room.code })
        break
      }

      case 'host:start-session': {
        const meta = peerMeta.get(peer.id)
        if (!meta || (meta.type !== 'host' && meta.type !== 'screen')) {
          sendTo(peer.id, { type: 'error', message: 'Not authorized' })
          return
        }
        const session = startSession(meta.roomCode)
        if (!session) {
          sendTo(peer.id, { type: 'error', message: 'Cannot start session' })
          return
        }
        // Broadcast session start to all (players need endsAt + symbolChoices)
        broadcast(meta.roomCode, {
          type: 'session:started',
          endsAt: session.endsAt,
          symbolChoices: session.symbolChoices,
        })
        // Send initial symbol only to displays (host + public screens)
        sendToDisplays(meta.roomCode, {
          type: 'session:symbol-change',
          symbol: session.currentSymbol,
          symbolChoices: session.symbolChoices,
        })
        startGameLoop(meta.roomCode)
        break
      }

      case 'host:end-room': {
        const meta = peerMeta.get(peer.id)
        if (!meta || meta.type !== 'host') return
        stopGameLoop(meta.roomCode)
        broadcast(meta.roomCode, { type: 'room:status', status: 'finished', playerCount: 0 })
        break
      }

      case 'screen:join': {
        const roomCode = data.roomCode.toUpperCase()
        const room = getRoom(roomCode)
        if (!room) {
          sendTo(peer.id, { type: 'error', message: 'Room not found' })
          return
        }
        peerMeta.set(peer.id, { type: 'screen', roomCode })
        addPeerToRoom(peer.id, roomCode)

        // Send current room status
        sendTo(peer.id, {
          type: 'room:status',
          status: room.status,
          playerCount: room.players.size,
        })

        // Send existing players
        for (const player of room.players.values()) {
          if (player.connected) {
            sendTo(peer.id, {
              type: 'room:player-joined',
              player: { id: player.id, username: player.username },
            })
          }
        }

        // If game in progress, send current state
        if (room.status === 'playing' && room.currentSession) {
          sendTo(peer.id, {
            type: 'session:started',
            endsAt: room.currentSession.endsAt,
            symbolChoices: room.currentSession.symbolChoices,
          })
          sendTo(peer.id, {
            type: 'session:symbol-change',
            symbol: room.currentSession.currentSymbol,
            symbolChoices: room.currentSession.symbolChoices,
          })
        }

        // If we have leaderboard data, send it
        const lb = getLeaderboard(roomCode)
        if (lb.length > 0) {
          sendTo(peer.id, { type: 'leaderboard:update', leaderboard: lb })
        }
        break
      }

      case 'player:join': {
        const roomCode = data.roomCode.toUpperCase()
        const room = getRoom(roomCode)
        if (!room) {
          sendTo(peer.id, { type: 'error', message: 'Room not found' })
          return
        }
        const player = addPlayer(roomCode, data.username)
        if (!player) {
          sendTo(peer.id, { type: 'error', message: 'Could not join room' })
          return
        }
        peerMeta.set(peer.id, { type: 'player', roomCode, playerId: player.id })
        addPeerToRoom(peer.id, roomCode)

        // Send room status to joining player
        sendTo(peer.id, {
          type: 'room:status',
          status: room.status,
          playerCount: room.players.size,
        })

        // Broadcast join to everyone (including the host)
        broadcast(roomCode, {
          type: 'room:player-joined',
          player: { id: player.id, username: player.username },
        })

        // If game already in progress, bring them up to speed
        if (room.status === 'playing' && room.currentSession) {
          sendTo(peer.id, {
            type: 'session:started',
            endsAt: room.currentSession.endsAt,
            symbolChoices: room.currentSession.symbolChoices,
          })
        }
        break
      }

      case 'player:tap': {
        const meta = peerMeta.get(peer.id)
        if (!meta || meta.type !== 'player' || !meta.playerId) return

        const result = handleTap(meta.roomCode, meta.playerId, data.symbol)
        if (result) {
          sendTo(peer.id, {
            type: 'player:tap-result',
            correct: result.correct,
            score: result.newScore,
            delta: result.delta,
          })
        }
        break
      }
    }
  },

  close(peer) {
    const meta = peerMeta.get(peer.id)
    if (meta) {
      removePeerFromRoom(peer.id, meta.roomCode)

      if (meta.type === 'player' && meta.playerId) {
        removePlayer(meta.roomCode, meta.playerId)
        broadcast(meta.roomCode, { type: 'room:player-left', playerId: meta.playerId })
      }

      if (meta.type === 'host') {
        const room = getRoom(meta.roomCode)
        if (room) room.hostConnected = false
      }

      peerMeta.delete(peer.id)
    }
    peerMap.delete(peer.id)
  },

  error(peer, error) {
    console.error('[SymbolRush] WebSocket error:', error)
  },
})
