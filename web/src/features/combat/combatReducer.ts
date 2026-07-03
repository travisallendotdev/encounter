import type { CombatState } from './combatStorage'

export type CombatAction = { type: 'NEXT_TURN' }

export function combatReducer(
  state: CombatState,
  action: CombatAction,
): CombatState {
  switch (action.type) {
    case 'NEXT_TURN': {
      const last = state.turnIndex >= state.turnOrder.length - 1
      return {
        ...state,
        turnIndex: last ? 0 : state.turnIndex + 1,
        round: last ? state.round + 1 : state.round,
      }
    }
  }
}
