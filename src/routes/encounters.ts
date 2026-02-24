import { Hono } from 'hono'
import { randomUUID } from 'node:crypto'
import db from '../db/connection.js'
import type { Variables } from '../types.js'

const encounters = new Hono<{ Variables: Variables }>()

encounters.get('/:id', (c) => {
  const dm = c.get('dm')
  const encounterId = c.req.param('id')

  const encounter = db.prepare(`
    SELECT e.id, e.name, e.campaign_id, e.encounter_number, e.status
    FROM encounters e
    JOIN campaigns camp ON camp.id = e.campaign_id
    WHERE e.id = ? AND camp.dm_id = ?
  `).get(encounterId, dm.id) as {
    id: string; name: string; campaign_id: string; encounter_number: number; status: string
  } | undefined

  if (!encounter) {
    return c.json({ error: 'Not found' }, 404)
  }

  const monsters = db.prepare('SELECT id, name, encounter_instance_name, initiative_modifier, encounter_id FROM monsters WHERE encounter_id = ?').all(encounterId) as {
    id: string; name: string; encounter_instance_name: string; initiative_modifier: number; encounter_id: string
  }[]

  const pcs = db.prepare(`
    SELECT p.id, p.name, p.player_name, p.campaign_id
    FROM pcs p
    JOIN encounter_pcs ep ON ep.pc_id = p.id
    WHERE ep.encounter_id = ?
  `).all(encounterId) as {
    id: string; name: string; player_name: string; campaign_id: string
  }[]

  return c.json({
    id: encounter.id,
    name: encounter.name,
    campaignId: encounter.campaign_id,
    encounterNumber: encounter.encounter_number,
    status: encounter.status,
    monsters: monsters.map(m => ({
      id: m.id,
      name: m.name,
      encounterInstanceName: m.encounter_instance_name,
      initiativeModifier: m.initiative_modifier,
      encounterId: m.encounter_id
    })),
    pcs: pcs.map(p => ({ id: p.id, name: p.name, playerName: p.player_name, campaignId: p.campaign_id }))
  })
})

encounters.post('/:id/monsters', async (c) => {
  const dm = c.get('dm')
  const encounterId = c.req.param('id')

  const encounter = db.prepare(`
    SELECT e.id, e.status FROM encounters e
    JOIN campaigns camp ON camp.id = e.campaign_id
    WHERE e.id = ? AND camp.dm_id = ?
  `).get(encounterId, dm.id) as { id: string; status: string } | undefined

  if (!encounter) {
    return c.json({ error: 'Not found' }, 404)
  }
  if (encounter.status !== 'draft') {
    return c.json({ error: 'Encounter must be in draft status' }, 400)
  }

  const body = await c.req.json().catch(() => null)
  const name = body?.name
  const quantity = body?.quantity ?? 1
  const initiativeModifier = body?.initiativeModifier ?? 0

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return c.json({ error: 'name is required' }, 400)
  }
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
    return c.json({ error: 'quantity must be an integer >= 1' }, 400)
  }
  if (typeof initiativeModifier !== 'number' || !Number.isInteger(initiativeModifier)) {
    return c.json({ error: 'initiativeModifier must be an integer' }, 400)
  }

  const baseName = name.trim()
  const created: { id: string; name: string; encounterInstanceName: string; initiativeModifier: number; encounterId: string }[] = []

  for (let i = 1; i <= quantity; i++) {
    const instanceName = quantity > 1 ? `${baseName} ${i}` : baseName
    const id = randomUUID()
    db.prepare('INSERT INTO monsters (id, name, encounter_instance_name, initiative_modifier, encounter_id) VALUES (?, ?, ?, ?, ?)').run(id, baseName, instanceName, initiativeModifier, encounterId)
    created.push({ id, name: baseName, encounterInstanceName: instanceName, initiativeModifier, encounterId })
  }

  return c.json(created, 201)
})

encounters.get('/:id/monsters', (c) => {
  const dm = c.get('dm')
  const encounterId = c.req.param('id')

  const encounter = db.prepare(`
    SELECT e.id FROM encounters e
    JOIN campaigns camp ON camp.id = e.campaign_id
    WHERE e.id = ? AND camp.dm_id = ?
  `).get(encounterId, dm.id)

  if (!encounter) {
    return c.json({ error: 'Not found' }, 404)
  }

  const rows = db.prepare('SELECT id, name, encounter_instance_name, initiative_modifier, encounter_id FROM monsters WHERE encounter_id = ?').all(encounterId) as {
    id: string; name: string; encounter_instance_name: string; initiative_modifier: number; encounter_id: string
  }[]

  return c.json(rows.map(m => ({
    id: m.id,
    name: m.name,
    encounterInstanceName: m.encounter_instance_name,
    initiativeModifier: m.initiative_modifier,
    encounterId: m.encounter_id
  })))
})

encounters.delete('/:id/monsters/:monsterId', (c) => {
  const dm = c.get('dm')
  const encounterId = c.req.param('id')
  const monsterId = c.req.param('monsterId')

  const encounter = db.prepare(`
    SELECT e.id, e.status FROM encounters e
    JOIN campaigns camp ON camp.id = e.campaign_id
    WHERE e.id = ? AND camp.dm_id = ?
  `).get(encounterId, dm.id) as { id: string; status: string } | undefined

  if (!encounter) {
    return c.json({ error: 'Not found' }, 404)
  }
  if (encounter.status !== 'draft') {
    return c.json({ error: 'Encounter must be in draft status' }, 400)
  }

  db.prepare('DELETE FROM monsters WHERE id = ? AND encounter_id = ?').run(monsterId, encounterId)
  return c.body(null, 204)
})

encounters.post('/:id/pcs', async (c) => {
  const dm = c.get('dm')
  const encounterId = c.req.param('id')

  const encounter = db.prepare(`
    SELECT e.id, e.status, e.campaign_id FROM encounters e
    JOIN campaigns camp ON camp.id = e.campaign_id
    WHERE e.id = ? AND camp.dm_id = ?
  `).get(encounterId, dm.id) as { id: string; status: string; campaign_id: string } | undefined

  if (!encounter) {
    return c.json({ error: 'Not found' }, 404)
  }
  if (encounter.status !== 'draft') {
    return c.json({ error: 'Encounter must be in draft status' }, 400)
  }

  const body = await c.req.json().catch(() => null)
  const pcIds = body?.pcIds

  if (!Array.isArray(pcIds) || pcIds.length === 0) {
    return c.json({ error: 'pcIds must be a non-empty array' }, 400)
  }

  // Verify all PCs belong to the same campaign
  for (const pcId of pcIds) {
    const pc = db.prepare('SELECT id FROM pcs WHERE id = ? AND campaign_id = ?').get(pcId, encounter.campaign_id)
    if (!pc) {
      return c.json({ error: `PC ${pcId} does not belong to this campaign` }, 400)
    }
  }

  const insert = db.prepare('INSERT OR IGNORE INTO encounter_pcs (encounter_id, pc_id) VALUES (?, ?)')
  for (const pcId of pcIds) {
    insert.run(encounterId, pcId)
  }

  const rows = db.prepare(`
    SELECT p.id, p.name, p.player_name, p.campaign_id
    FROM pcs p
    JOIN encounter_pcs ep ON ep.pc_id = p.id
    WHERE ep.encounter_id = ?
  `).all(encounterId) as { id: string; name: string; player_name: string; campaign_id: string }[]

  return c.json(rows.map(p => ({ id: p.id, name: p.name, playerName: p.player_name, campaignId: p.campaign_id })))
})

encounters.get('/:id/pcs', (c) => {
  const dm = c.get('dm')
  const encounterId = c.req.param('id')

  const encounter = db.prepare(`
    SELECT e.id FROM encounters e
    JOIN campaigns camp ON camp.id = e.campaign_id
    WHERE e.id = ? AND camp.dm_id = ?
  `).get(encounterId, dm.id)

  if (!encounter) {
    return c.json({ error: 'Not found' }, 404)
  }

  const rows = db.prepare(`
    SELECT p.id, p.name, p.player_name, p.campaign_id
    FROM pcs p
    JOIN encounter_pcs ep ON ep.pc_id = p.id
    WHERE ep.encounter_id = ?
  `).all(encounterId) as { id: string; name: string; player_name: string; campaign_id: string }[]

  return c.json(rows.map(p => ({ id: p.id, name: p.name, playerName: p.player_name, campaignId: p.campaign_id })))
})

encounters.delete('/:id/pcs/:pcId', (c) => {
  const dm = c.get('dm')
  const encounterId = c.req.param('id')
  const pcId = c.req.param('pcId')

  const encounter = db.prepare(`
    SELECT e.id, e.status FROM encounters e
    JOIN campaigns camp ON camp.id = e.campaign_id
    WHERE e.id = ? AND camp.dm_id = ?
  `).get(encounterId, dm.id) as { id: string; status: string } | undefined

  if (!encounter) {
    return c.json({ error: 'Not found' }, 404)
  }
  if (encounter.status !== 'draft') {
    return c.json({ error: 'Encounter must be in draft status' }, 400)
  }

  db.prepare('DELETE FROM encounter_pcs WHERE encounter_id = ? AND pc_id = ?').run(encounterId, pcId)
  return c.body(null, 204)
})

export default encounters
