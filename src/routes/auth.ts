import { Hono } from 'hono'
import { randomUUID } from 'node:crypto'
import db from '../db/connection.js'

const auth = new Hono()

auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null)

  const username = body?.username

  if (!username || typeof username !== 'string' || username.trim() === '') {
    return c.json({ error: 'username is required' }, 400)
  }

  const trimmed = username.trim()

  const existing = db.prepare('SELECT id, username FROM dms WHERE username = ?').get(trimmed) as { id: string; username: string } | undefined

  if (existing) {
    return c.json(existing)
  }

  const id = randomUUID()
  db.prepare('INSERT INTO dms (id, username) VALUES (?, ?)').run(id, trimmed)

  return c.json({ id, username: trimmed }, 201)
})

export default auth
