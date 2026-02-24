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

campaigns.post('/:id/pcs', async (c) => {
  const dm = c.get('dm')
  const campaignId = c.req.param('id')

  const campaign = db.prepare('SELECT id FROM campaigns WHERE id = ? AND dm_id = ?').get(campaignId, dm.id)
  if (!campaign) {
    return c.json({ error: 'Not found' }, 404)
  }

  const body = await c.req.json().catch(() => null)
  const name = body?.name
  const playerName = body?.playerName

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return c.json({ error: 'name is required' }, 400)
  }
  if (!playerName || typeof playerName !== 'string' || playerName.trim() === '') {
    return c.json({ error: 'playerName is required' }, 400)
  }

  const id = randomUUID()
  db.prepare('INSERT INTO pcs (id, name, player_name, campaign_id) VALUES (?, ?, ?, ?)').run(id, name.trim(), playerName.trim(), campaignId)

  const pc = db.prepare('SELECT id, name, player_name, campaign_id FROM pcs WHERE id = ?').get(id) as {
    id: string; name: string; player_name: string; campaign_id: string
  }

  return c.json({ id: pc.id, name: pc.name, playerName: pc.player_name, campaignId: pc.campaign_id }, 201)
})

campaigns.get('/:id/pcs', (c) => {
  const dm = c.get('dm')
  const campaignId = c.req.param('id')

  const campaign = db.prepare('SELECT id FROM campaigns WHERE id = ? AND dm_id = ?').get(campaignId, dm.id)
  if (!campaign) {
    return c.json({ error: 'Not found' }, 404)
  }

  const rows = db.prepare('SELECT id, name, player_name, campaign_id FROM pcs WHERE campaign_id = ?').all(campaignId) as {
    id: string; name: string; player_name: string; campaign_id: string
  }[]

  return c.json(rows.map(r => ({ id: r.id, name: r.name, playerName: r.player_name, campaignId: r.campaign_id })))
})

export default campaigns
