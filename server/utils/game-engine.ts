import { nanoid } from 'nanoid'
import { SYMBOLS, DEFAULT_ROOM_CONFIG } from '~/types/game'
import type { Room, Player, GameSession, RoomConfig, Symbol, SessionScore, LeaderboardEntry } from '~/types/game'

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateRoomCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
  }
  return code
}

function pickRandomFrom<T>(arr: readonly T[], exclude?: T): T {
  const available = exclude != null ? arr.filter(s => s !== exclude) : [...arr]
  return available[Math.floor(Math.random() * available.length)]!
}

// ── In-memory state ──
export const rooms = new Map<string, Room>()

// ── Room management ──

export function createRoom(config?: Partial<RoomConfig>): Room {
  let code: string
  do {
    code = generateRoomCode()
  } while (rooms.has(code))

  const room: Room = {
    code,
    status: 'waiting',
    config: { ...DEFAULT_ROOM_CONFIG, ...config },
    hostConnected: true,
    currentSession: null,
    players: new Map(),
    roundsPlayed: 0,
  }
  rooms.set(code, room)
  return room
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase())
}

export function deleteRoom(code: string): void {
  rooms.delete(code.toUpperCase())
}

// ── Player management ──

export function addPlayer(roomCode: string, username: string): Player | null {
  const room = rooms.get(roomCode.toUpperCase())
  if (!room) return null

  // Reconnect existing player (case-insensitive username match)
  for (const player of room.players.values()) {
    if (player.username.toLowerCase() === username.toLowerCase()) {
      player.connected = true
      // If session in progress, ensure they have a score entry
      if (room.currentSession && !room.currentSession.scores.has(player.id)) {
        room.currentSession.scores.set(player.id, 0)
      }
      return player
    }
  }

  const player: Player = {
    id: nanoid(12),
    username,
    roomCode: room.code,
    connected: true,
    currentSessionScore: 0,
    bestScore: 0,
  }
  room.players.set(player.id, player)

  // If a session is active, add them to it
  if (room.currentSession) {
    room.currentSession.scores.set(player.id, 0)
  }

  return player
}

export function removePlayer(roomCode: string, playerId: string): void {
  const room = rooms.get(roomCode)
  if (!room) return
  const player = room.players.get(playerId)
  if (player) {
    player.connected = false
  }
}

// ── Session management ──

export function startSession(roomCode: string): GameSession | null {
  const room = rooms.get(roomCode)
  if (!room || room.status === 'playing') return null

  const now = Date.now()
  const symbolChoices = SYMBOLS.slice(0, room.config.symbolCount) as unknown as Symbol[]
  const currentSymbol = pickRandomFrom(symbolChoices)

  const session: GameSession = {
    id: nanoid(12),
    roomCode,
    startedAt: now,
    endsAt: now + room.config.sessionDurationMs,
    currentSymbol,
    currentSymbolSetAt: now,
    symbolChoices,
    scores: new Map(),
  }

  // Initialize scores for all connected players
  for (const [id, player] of room.players) {
    if (player.connected) {
      session.scores.set(id, 0)
      player.currentSessionScore = 0
    }
  }

  room.currentSession = session
  room.status = 'playing'
  return session
}

export function rotateSymbol(roomCode: string): { symbol: Symbol; choices: Symbol[] } | null {
  const room = rooms.get(roomCode)
  if (!room || !room.currentSession) return null

  const session = room.currentSession
  const newSymbol = pickRandomFrom(session.symbolChoices, session.currentSymbol)

  session.currentSymbol = newSymbol
  session.currentSymbolSetAt = Date.now()

  return { symbol: newSymbol, choices: session.symbolChoices }
}

export function handleTap(
  roomCode: string,
  playerId: string,
  symbol: Symbol,
): { correct: boolean; delta: number; newScore: number } | null {
  const room = rooms.get(roomCode)
  if (!room || !room.currentSession || room.status !== 'playing') return null

  const session = room.currentSession
  const player = room.players.get(playerId)
  if (!player || !player.connected) return null

  const correct = symbol === session.currentSymbol
  const delta = correct ? room.config.pointsCorrect : room.config.pointsPenalty
  const currentScore = session.scores.get(playerId) ?? 0
  const newScore = currentScore + delta

  session.scores.set(playerId, newScore)
  player.currentSessionScore = newScore

  return { correct, delta, newScore }
}

export function getSessionScores(roomCode: string): SessionScore[] {
  const room = rooms.get(roomCode)
  if (!room || !room.currentSession) return []

  const scores: SessionScore[] = []
  for (const [playerId, score] of room.currentSession.scores) {
    const player = room.players.get(playerId)
    if (!player) continue
    scores.push({ playerId, username: player.username, score })
  }
  return scores.sort((a, b) => b.score - a.score)
}

export function endSession(roomCode: string): SessionScore[] {
  const room = rooms.get(roomCode)
  if (!room || !room.currentSession) return []

  const session = room.currentSession
  const results: SessionScore[] = []

  for (const [playerId, score] of session.scores) {
    const player = room.players.get(playerId)
    if (!player) continue

    if (score > player.bestScore) {
      player.bestScore = score
    }

    results.push({ playerId, username: player.username, score })
  }

  results.sort((a, b) => b.score - a.score)

  room.status = 'waiting'
  room.currentSession = null
  return results
}

export function getLeaderboard(roomCode: string): LeaderboardEntry[] {
  const room = rooms.get(roomCode)
  if (!room) return []

  const entries: LeaderboardEntry[] = []
  for (const player of room.players.values()) {
    entries.push({
      playerId: player.id,
      username: player.username,
      bestScore: player.bestScore,
      sessionCount: 0,
    })
  }

  return entries.sort((a, b) => b.bestScore - a.bestScore)
}

export function getSessionTimeRemaining(roomCode: string): number {
  const room = rooms.get(roomCode)
  if (!room || !room.currentSession) return 0
  return Math.max(0, room.currentSession.endsAt - Date.now())
}
