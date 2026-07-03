import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPc, listPcs } from '../../api/endpoints'

export const pcKeys = {
  list: (campaignId: string) => ['campaigns', campaignId, 'pcs'] as const,
}

export function usePcs(campaignId: string) {
  return useQuery({ queryKey: pcKeys.list(campaignId), queryFn: () => listPcs(campaignId) })
}

export function useCreatePc(campaignId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { name: string; playerName: string }) => createPc(campaignId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pcKeys.list(campaignId) }),
  })
}
