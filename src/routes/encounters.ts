import { Hono } from 'hono'
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

export default encounters
