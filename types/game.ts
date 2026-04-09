export const SYMBOLS = ['▲', '●', '■', '✦', '◆', '✖'] as const
export type Symbol = (typeof SYMBOLS)[number]

export interface RoomConfig {
  sessionDurationMs: number
  symbolIntervalMs: number
  pointsCorrect: number
  pointsPenalty: number
  symbolCount: number
  autoLoop: boolean
  pauseBetweenRoundsMs: number
  autoStartDelayMs: number
  maxRounds: number | null
}

export const DEFAULT_ROOM_CONFIG: RoomConfig = {
  sessionDurationMs: 30_000,
  symbolIntervalMs: 3_000,
  pointsCorrect: 10,
  pointsPenalty: -5,
  symbolCount: 4,
  autoLoop: false,
  pauseBetweenRoundsMs: 25_000,
  autoStartDelayMs: 120_000,
  maxRounds: null,
}

export type RoomStatus = 'waiting' | 'playing' | 'finished'

export interface Room {
  code: string
  status: RoomStatus
  config: RoomConfig
  hostConnected: boolean
  currentSession: GameSession | null
  players: Map<string, Player>
  roundsPlayed: number
}

export interface Player {
  id: string
  username: string
  roomCode: string
  connected: boolean
  currentSessionScore: number
  bestScore: number
}

export interface GameSession {
  id: string
  roomCode: string
  startedAt: number
  endsAt: number
  currentSymbol: Symbol
  currentSymbolSetAt: number
  symbolChoices: Symbol[]
  scores: Map<string, number>
}

export interface SessionScore {
  playerId: string
  username: string
  score: number
}

export interface LeaderboardEntry {
  playerId: string
  username: string
  bestScore: number
  sessionCount: number
}

// Client → Server messages
export type ClientMessage =
  | { type: 'host:create-room'; config?: Partial<RoomConfig> }
  | { type: 'host:start-session' }
  | { type: 'host:end-room' }
  | { type: 'host:set-auto-loop'; enabled: boolean }
  | { type: 'screen:join'; roomCode: string }
  | { type: 'player:join'; roomCode: string; username: string }
  | { type: 'player:tap'; symbol: Symbol }

// Server → Client messages
export type ServerMessage =
  | { type: 'room:created'; roomCode: string }
  | { type: 'room:player-joined'; player: { id: string; username: string } }
  | { type: 'room:player-left'; playerId: string }
  | { type: 'room:status'; status: RoomStatus; playerCount: number }
  | { type: 'room:auto-loop-changed'; enabled: boolean }
  | { type: 'room:next-round-at'; timestamp: number }
  | { type: 'session:started'; endsAt: number; symbolChoices: Symbol[] }
  | { type: 'session:symbol-change'; symbol: Symbol; symbolChoices: Symbol[] }
  | { type: 'session:tick'; timeRemainingMs: number }
  | { type: 'session:scores-update'; scores: SessionScore[] }
  | { type: 'session:ended'; scores: SessionScore[] }
  | { type: 'player:tap-result'; correct: boolean; score: number; delta: number }
  | { type: 'leaderboard:update'; leaderboard: LeaderboardEntry[] }
  | { type: 'error'; message: string }
