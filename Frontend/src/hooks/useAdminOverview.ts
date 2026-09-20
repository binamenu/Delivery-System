import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCategories } from '@/lib/categoriesApi'
import { fetchAdminOrderRecords } from '@/lib/ordersApi'
import { fetchRestaurants, updateRestaurantApproval } from '@/lib/restaurantsApi'
import { API_FEATURES } from '@/lib/http'
import {
  buildOrderStatusSegments,
  buildRevenueSeries,
  formatEtb,
  pendingRestaurants,
  sumOrderRevenue,
  uniqueCountById,
} from '@/lib/adminStats'

export function useAdminOverview() {
  const ordersQuery = useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchAdminOrderRecords,
    enabled: API_FEATURES.orders,
    staleTime: 30_000,
  })
  const restaurantsQuery = useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
    staleTime: 30_000,
  })
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 30_000,
  })

  const orderRecords = ordersQuery.data ?? []
  const orders = orderRecords.map((record) => record.order)
  const restaurants = restaurantsQuery.data ?? []
  const categories = categoriesQuery.data ?? []
  const pending = pendingRestaurants(restaurants)

  const overview = useMemo(() => {
    const customers = uniqueCountById(
      orderRecords.map((record) => record.customer).filter((item): item is NonNullable<typeof item> => !!item),
    )
    const drivers = uniqueCountById(
      orderRecords.map((record) => record.driver).filter((item): item is NonNullable<typeof item> => !!item),
    )

    return {
      totalOrders: orders.length,
      revenue: sumOrderRevenue(orders),
      revenueLabel: formatEtb(sumOrderRevenue(orders)),
      customers,
      drivers,
      restaurants: restaurants.length,
      categories: categories.length,
      pendingCount: pending.length,
      delivered: orders.filter((order) => order.status === 'delivered').length,
      cancelled: orders.filter(
        (order) => order.status === 'cancelled' || order.status === 'rejected',
      ).length,
      revenueSeries: buildRevenueSeries(orders),
      statusSegments: buildOrderStatusSegments(orders),
      pendingApprovals: pending.length > 0 ? pending : restaurants.slice(0, 5),
    }
  }, [orderRecords, orders, restaurants, categories, pending])

  return {
    ...overview,
    isLoading: restaurantsQuery.isLoading,
    isError: restaurantsQuery.isError,
  }
}

export function useApproveRestaurantFromDashboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => updateRestaurantApproval(id, 'approved'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      void queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}
