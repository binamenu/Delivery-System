import { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  approveApplication,
  fetchApplications,
  rejectApplication,
} from '@/lib/applicationsApi'
import { getApiErrorMessage } from '@/lib/http'
import type { RestaurantApplication } from '@/types/Applications'

const QUERY_KEY = ['applications'] as const

export function useApplications() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchApplications,
    staleTime: 30_000,
  })
  const [pendingId, setPendingId] = useState<number | null>(null)

  const applications = useMemo(() => query.data ?? [], [query.data])

  const stats = useMemo(
    () => ({
      total: applications.length,
      pending: applications.filter((item) => item.status === 'pending').length,
    }),
    [applications],
  )

  const approve = useCallback(
    async (application: RestaurantApplication) => {
      setPendingId(application.id)
      try {
        await approveApplication(application.id)
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['restaurants'] }),
          queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
        ])
        toast.success(`${application.name} was approved.`)
      } catch (error) {
        toast.error(getApiErrorMessage(error))
      } finally {
        setPendingId(null)
      }
    },
    [queryClient],
  )

  const reject = useCallback(
    async (application: RestaurantApplication) => {
      setPendingId(application.id)
      try {
        await rejectApplication(application.id)
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['restaurants'] }),
          queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
        ])
        toast.success(`${application.name} was rejected.`)
      } catch (error) {
        toast.error(getApiErrorMessage(error))
      } finally {
        setPendingId(null)
      }
    },
    [queryClient],
  )

  const reset = useCallback((application: RestaurantApplication) => {
    toast.error(`Cannot reset ${application.name}. The API has no pending-status endpoint.`)
  }, [])

  return {
    applications,
    stats,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.error ? getApiErrorMessage(query.error) : null,
    pendingId,
    approve,
    reject,
    reset,
  }
}
