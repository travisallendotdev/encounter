import { z } from 'zod'
import { apiFetch } from './client'
import {
  campaignSchema,
  dmSchema,
  encounterDetailSchema,
  encounterSchema,
  monsterSchema,
  pcSchema,
  startResponseSchema,
} from './schemas'

const post = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) })

export const login = (username: string) => apiFetch('/api/auth/login', dmSchema, post({ username }))

export const listCampaigns = () => apiFetch('/api/campaigns', z.array(campaignSchema))
export const createCampaign = (name: string) => apiFetch('/api/campaigns', campaignSchema, post({ name }))
export const getCampaign = (id: string) => apiFetch(`/api/campaigns/${id}`, campaignSchema)

export const listPcs = (campaignId: string) => apiFetch(`/api/campaigns/${campaignId}/pcs`, z.array(pcSchema))
export const createPc = (campaignId: string, input: { name: string; playerName: string }) =>
  apiFetch(`/api/campaigns/${campaignId}/pcs`, pcSchema, post(input))

export const listEncounters = (campaignId: string) =>
  apiFetch(`/api/campaigns/${campaignId}/encounters`, z.array(encounterSchema))
export const createEncounter = (campaignId: string, name: string) =>
  apiFetch(`/api/campaigns/${campaignId}/encounters`, encounterSchema, post({ name }))
export const getEncounter = (id: string) => apiFetch(`/api/encounters/${id}`, encounterDetailSchema)

export const addMonsters = (
  encounterId: string,
  input: { name: string; quantity: number; initiativeModifier: number },
) => apiFetch(`/api/encounters/${encounterId}/monsters`, z.array(monsterSchema), post(input))
export const removeMonster = (encounterId: string, monsterId: string) =>
  apiFetch(`/api/encounters/${encounterId}/monsters/${monsterId}`, z.void(), { method: 'DELETE' })

export const setEncounterPcs = (encounterId: string, pcIds: string[]) =>
  apiFetch(`/api/encounters/${encounterId}/pcs`, z.array(pcSchema), post({ pcIds }))
export const removeEncounterPc = (encounterId: string, pcId: string) =>
  apiFetch(`/api/encounters/${encounterId}/pcs/${pcId}`, z.void(), { method: 'DELETE' })

export const startEncounter = (
  encounterId: string,
  input: { monsterInitiatives: 'auto' | 'manual'; initiatives: Record<string, number> },
) => apiFetch(`/api/encounters/${encounterId}/start`, startResponseSchema, post(input))
