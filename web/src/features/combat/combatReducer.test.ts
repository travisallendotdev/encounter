import { describe, expect, it } from 'vitest'
import { combatReducer } from './combatReducer'
import type { CombatState } from './combatStorage'

const mk = (turnIndex: number, round = 1): CombatState => ({
  encounterId: 'e1',
  encounterName: 'Crypt',
  round,
  turnIndex,
  turnOrder: [
    { participantId: 'a', participantType: 'pc', name: 'A', initiative: 20 },
    {
      participantId: 'b',
      participantType: 'monster',
      name: 'B',
      initiative: 15,
    },
    { participantId: 'c', participantType: 'pc', name: 'C', initiative: 10 },
  ],
})

describe('combatReducer', () => {
  it('advances to the next combatant within a round', () => {
    const next = combatReducer(mk(0), { type: 'NEXT_TURN' })
    expect(next.turnIndex).toBe(1)
    expect(next.round).toBe(1)
  })

  it('wraps to the top of the order and increments the round', () => {
    const next = combatReducer(mk(2), { type: 'NEXT_TURN' })
    expect(next.turnIndex).toBe(0)
    expect(next.round).toBe(2)
  })

  it('keeps incrementing across multiple rounds', () => {
    let state = mk(0)
    for (let i = 0; i < 6; i++)
      state = combatReducer(state, { type: 'NEXT_TURN' })
    expect(state.round).toBe(3)
    expect(state.turnIndex).toBe(0)
  })

  it('does not mutate the previous state', () => {
    const prev = mk(0)
    combatReducer(prev, { type: 'NEXT_TURN' })
    expect(prev.turnIndex).toBe(0)
  })
})
