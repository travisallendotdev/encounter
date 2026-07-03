import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createEncounter,
  getEncounter,
  listEncounters,
} from '../../api/endpoints'

export const encounterKeys = {
  list: (campaignId: string) =>
    ['campaigns', campaignId, 'encounters'] as const,
  detail: (id: string) => ['encounters', id] as const,
}

export function useEncounters(campaignId: string) {
  return useQuery({
    queryKey: encounterKeys.list(campaignId),
    queryFn: () => listEncounters(campaignId),
  })
}

export function useEncounter(id: string) {
  return useQuery({
    queryKey: encounterKeys.detail(id),
    queryFn: () => getEncounter(id),
  })
}

export function useCreateEncounter(campaignId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createEncounter(campaignId, name),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: encounterKeys.list(campaignId),
      }),
  })
}
