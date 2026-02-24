import { Hono } from 'hono'
import { randomUUID } from 'node:crypto'
import db from '../db/connection.js'
import type { Variables } from '../types.js'

const campaigns = new Hono<{ Variables: Variables }>()

campaigns.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const name = body?.name

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return c.json({ error: 'name is required' }, 400)
  }

  const dm = c.get('dm')
  const id = randomUUID()
  db.prepare('INSERT INTO campaigns (id, name, dm_id) VALUES (?, ?, ?)').run(id, name.trim(), dm.id)

  const campaign = db.prepare('SELECT id, name, dm_id, created_at FROM campaigns WHERE id = ?').get(id) as {
    id: string; name: string; dm_id: string; created_at: string
  }

  return c.json({ id: campaign.id, name: campaign.name, dmId: campaign.dm_id, createdAt: campaign.created_at }, 201)
})

campaigns.get('/', (c) => {
  const dm = c.get('dm')
  const rows = db.prepare('SELECT id, name, dm_id, created_at FROM campaigns WHERE dm_id = ?').all(dm.id) as {
    id: string; name: string; dm_id: string; created_at: string
  }[]

  return c.json(rows.map(r => ({ id: r.id, name: r.name, dmId: r.dm_id, createdAt: r.created_at })))
})

campaigns.get('/:id', (c) => {
  const dm = c.get('dm')
  const row = db.prepare('SELECT id, name, dm_id, created_at FROM campaigns WHERE id = ? AND dm_id = ?').get(c.req.param('id'), dm.id) as {
    id: string; name: string; dm_id: string; created_at: string
  } | undefined

  if (!row) {
    return c.json({ error: 'Not found' }, 404)
  }

  return c.json({ id: row.id, name: row.name, dmId: row.dm_id, createdAt: row.created_at })
})

export default campaigns
