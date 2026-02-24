import { createMiddleware } from 'hono/factory'
import db from '../db/connection.js'
import type { Variables } from '../types.js'

export const authMiddleware = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  const username = c.req.header('X-DM-Username')

  if (!username || username.trim() === '') {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const dm = db
    .prepare('SELECT id, username FROM dms WHERE username = ?')
    .get(username.trim()) as { id: string; username: string } | undefined

  if (!dm) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('dm', dm)
  await next()
})
