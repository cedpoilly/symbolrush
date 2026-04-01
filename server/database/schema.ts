import { pgTable, text, integer, timestamp, json, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core'
import type { RoomConfig } from '~/types/game'

export const rooms = pgTable('rooms', {
  code: text('code').primaryKey(),
  name: text('name'),
  config: json('config').$type<RoomConfig>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
})

export const players = pgTable('players', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  roomCode: text('room_code').notNull().references(() => rooms.code),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('unique_username_per_room').on(table.username, table.roomCode),
])

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  roomCode: text('room_code').notNull().references(() => rooms.code),
  startedAt: timestamp('started_at').notNull(),
  endedAt: timestamp('ended_at').notNull(),
}, (table) => [
  index('sessions_room_idx').on(table.roomCode),
])

export const scores = pgTable('scores', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  playerId: text('player_id').notNull().references(() => players.id),
  roomCode: text('room_code').notNull().references(() => rooms.code),
  score: integer('score').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('scores_player_room_idx').on(table.playerId, table.roomCode),
  index('scores_session_idx').on(table.sessionId),
])
