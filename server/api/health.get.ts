import { sql } from 'drizzle-orm'
import { useDB } from '../database'

export default defineEventHandler(async () => {
  try {
    const db = useDB()
    await db.execute(sql`SELECT 1`)
    return { status: 'ok' }
  }
  catch {
    throw createError({ statusCode: 503, message: 'Database unreachable' })
  }
})
