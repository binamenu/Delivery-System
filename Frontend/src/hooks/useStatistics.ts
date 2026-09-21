import { useQuery } from '@tanstack/react-query'
import { fetchAdminStatistics } from '@/lib/statisticsApi'

export function useStatistics() {
  return useQuery({
    queryKey: ['admin-statistics'],
    queryFn: fetchAdminStatistics,
    staleTime: 30_000,
  })
}
