import { z } from 'zod'

export const dmSchema = z.object({ id: z.string(), username: z.string() })

export const campaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  dmId: z.string(),
  createdAt: z.string(),
})

export const pcSchema = z.object({
  id: z.string(),
  name: z.string(),
  playerName: z.string(),
  campaignId: z.string(),
})

export const encounterSchema = z.object({
  id: z.string(),
  name: z.string(),
  campaignId: z.string(),
  encounterNumber: z.number(),
  status: z.enum(['draft', 'active']),
})

export const monsterSchema = z.object({
  id: z.string(),
  name: z.string(),
  encounterInstanceName: z.string(),
  initiativeModifier: z.number(),
  encounterId: z.string(),
})

export const encounterDetailSchema = encounterSchema.extend({
  monsters: z.array(monsterSchema),
  pcs: z.array(pcSchema),
})

export const turnEntrySchema = z.object({
  participantId: z.string(),
  participantType: z.enum(['pc', 'monster']),
  name: z.string(),
  initiative: z.number(),
})

export const startResponseSchema = z.object({
  status: z.literal('active'),
  turnOrder: z.array(turnEntrySchema),
})

export type Dm = z.infer<typeof dmSchema>
export type Campaign = z.infer<typeof campaignSchema>
export type Pc = z.infer<typeof pcSchema>
export type Encounter = z.infer<typeof encounterSchema>
export type Monster = z.infer<typeof monsterSchema>
export type EncounterDetail = z.infer<typeof encounterDetailSchema>
export type TurnEntry = z.infer<typeof turnEntrySchema>
export type StartResponse = z.infer<typeof startResponseSchema>
