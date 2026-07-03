import { beforeEach, describe, expect, it } from 'vitest'
import { type CombatState, loadCombat, saveCombat } from './combatStorage'

const state: CombatState = {
  encounterId: 'e1',
  encounterName: 'The Sunken Crypt',
  turnOrder: [{ participantId: 'p1', participantType: 'pc', name: 'Lyra', initiative: 18 }],
  round: 2,
  turnIndex: 0,
}

describe('combatStorage', () => {
  beforeEach(() => sessionStorage.clear())

  it('round-trips combat state', () => {
    saveCombat(state)
    expect(loadCombat('e1')).toEqual(state)
  })

  it('returns null for unknown encounters', () => {
    expect(loadCombat('nope')).toBeNull()
  })

  it('returns null for corrupt payloads', () => {
    sessionStorage.setItem('dicefight.combat.bad', '{not json')
    expect(loadCombat('bad')).toBeNull()
  })
})
