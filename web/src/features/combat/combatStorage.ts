import { z } from 'zod'
import { turnEntrySchema } from '../../api/schemas'

const combatStateSchema = z.object({
  encounterId: z.string(),
  encounterName: z.string(),
  turnOrder: z.array(turnEntrySchema),
  round: z.number().int().min(1),
  turnIndex: z.number().int().min(0),
})

export type CombatState = z.infer<typeof combatStateSchema>

const key = (encounterId: string) => `dicefight.combat.${encounterId}`

export function saveCombat(state: CombatState): void {
  sessionStorage.setItem(key(state.encounterId), JSON.stringify(state))
}

export function loadCombat(encounterId: string): CombatState | null {
  const raw = sessionStorage.getItem(key(encounterId))
  if (!raw) return null
  try {
    return combatStateSchema.parse(JSON.parse(raw))
  } catch {
    return null
  }
}
