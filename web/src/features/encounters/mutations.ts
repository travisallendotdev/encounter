import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addMonsters,
  removeEncounterPc,
  removeMonster,
  setEncounterPcs,
  startEncounter,
} from '../../api/endpoints'
import { encounterKeys } from './queries'

function useInvalidateEncounter(encounterId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: encounterKeys.detail(encounterId) })
}

export function useAddMonsters(encounterId: string) {
  const invalidate = useInvalidateEncounter(encounterId)
  return useMutation({
    mutationFn: (input: { name: string; quantity: number; initiativeModifier: number }) =>
      addMonsters(encounterId, input),
    onSuccess: invalidate,
  })
}

export function useRemoveMonster(encounterId: string) {
  const invalidate = useInvalidateEncounter(encounterId)
  return useMutation({
    mutationFn: (monsterId: string) => removeMonster(encounterId, monsterId),
    onSuccess: invalidate,
  })
}

export function useSetEncounterPcs(encounterId: string) {
  const invalidate = useInvalidateEncounter(encounterId)
  return useMutation({
    mutationFn: (pcIds: string[]) => setEncounterPcs(encounterId, pcIds),
    onSuccess: invalidate,
  })
}

export function useRemoveEncounterPc(encounterId: string) {
  const invalidate = useInvalidateEncounter(encounterId)
  return useMutation({
    mutationFn: (pcId: string) => removeEncounterPc(encounterId, pcId),
    onSuccess: invalidate,
  })
}

export function useStartEncounter(encounterId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { monsterInitiatives: 'auto' | 'manual'; initiatives: Record<string, number> }) =>
      startEncounter(encounterId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: encounterKeys.detail(encounterId) })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}
