import { getRoom, getLeaderboard } from '../../../utils/game-engine'
import { useDB } from '../../../database/index'
import { scores, players } from '../../../database/schema'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')?.toUpperCase()
  if (!code) throw createError({ statusCode: 400, message: 'Room code required' })

  // Try in-memory first
  const room = getRoom(code)
  if (room) {
    return getLeaderboard(code)
  }

  // Fall back to DB aggregation
  const db = useDB()
  const results = await db
    .select({
      playerId: scores.playerId,
      username: players.username,
      bestScore: sql<number>`MAX(${scores.score})`.as('best_score'),
      sessionCount: sql<number>`COUNT(${scores.sessionId})`.as('session_count'),
    })
    .from(scores)
    .innerJoin(players, eq(scores.playerId, players.id))
    .where(eq(scores.roomCode, code))
    .groupBy(scores.playerId, players.username)
    .orderBy(sql`MAX(${scores.score}) DESC`)

  return results
})
