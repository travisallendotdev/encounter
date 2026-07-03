import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCampaign, getCampaign, listCampaigns } from '../../api/endpoints'

export const campaignKeys = {
  all: ['campaigns'] as const,
  detail: (id: string) => ['campaigns', id] as const,
}

export function useCampaigns() {
  return useQuery({ queryKey: campaignKeys.all, queryFn: listCampaigns })
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => getCampaign(id),
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: campaignKeys.all }),
  })
}
