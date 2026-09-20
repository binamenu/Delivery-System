import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useApproveRestaurant, useRestaurants } from '@/hooks/useRestaurants'
import type { Restaurant } from '@/types/Restaurants'
import { getRestaurantDisplayStatus } from '@/components/restaurants/restaurantStatusConfig'
import { getApiErrorMessage } from '@/lib/http'

export function useRestaurantAdminActions() {
  const query = useRestaurants()
  const approveMutation = useApproveRestaurant()
  const [pendingId, setPendingId] = useState<number | null>(null)

  const restaurants = query.data ?? []

  const approve = useCallback(
    async (restaurant: Restaurant) => {
      setPendingId(restaurant.id)
      try {
        await approveMutation.mutateAsync(restaurant.id)
        toast.success(`${restaurant.name} was approved.`)
      } catch (error) {
        toast.error(getApiErrorMessage(error))
      } finally {
        setPendingId(null)
      }
    },
    [approveMutation],
  )

  const suspend = useCallback((restaurant: Restaurant) => {
    toast.error(`${restaurant.name} cannot be suspended. The API has no restaurant status endpoint.`)
  }, [])

  const restore = useCallback((restaurant: Restaurant) => {
    toast.error(`${restaurant.name} cannot be restored. The API has no restaurant status endpoint.`)
  }, [])

  const view = useCallback((restaurant: Restaurant) => {
    const status = getRestaurantDisplayStatus(restaurant)
    toast.info(restaurant.name, {
      description: `${restaurant.managerName || restaurant.address || 'No manager'} • ${status}`,
    })
  }, [])

  return {
    restaurants,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.error ? getApiErrorMessage(query.error) : null,
    pendingId,
    approve,
    suspend,
    restore,
    view,
  }
}
