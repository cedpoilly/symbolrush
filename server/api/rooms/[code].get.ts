import { getRoom } from '../../utils/game-engine'

export default defineEventHandler((event) => {
  const code = getRouterParam(event, 'code')?.toUpperCase()
  if (!code) throw createError({ statusCode: 400, message: 'Room code required' })

  const room = getRoom(code)
  if (!room) throw createError({ statusCode: 404, message: 'Room not found' })

  return {
    code: room.code,
    status: room.status,
    playerCount: room.players.size,
    config: room.config,
  }
})
