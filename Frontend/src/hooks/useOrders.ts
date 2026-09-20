import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PlaceOrderData } from '@/lib/customer/orderService'
import { getOrders, getOrder, placeOrder } from '@/lib/customer/orderService'
import { fetchAdminOrderRecords } from '@/lib/ordersApi'
import { buildOrdersListResponse, filterAdminOrders } from '@/lib/adminStats'
import { API_FEATURES } from '@/lib/http'
import type { OrdersQueryParams } from '@/types/Orders'

export function useOrdersQuery(status?: string) {
  return useQuery({
    queryKey: ['orders', status],
    queryFn: () => getOrders(status),
  })
}

export function useOrderDetailQuery(id: number) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
    enabled: !!id,
  })
}

export function usePlaceOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlaceOrderData) => placeOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
  })
}

export function useOrders(params: OrdersQueryParams) {
  const query = useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchAdminOrderRecords,
    enabled: API_FEATURES.orders,
    staleTime: 30_000,
  })

  const data = useMemo(() => {
    const allOrders = (query.data ?? []).map((record) => record.order)
    return {
      stats: buildOrdersListResponse(allOrders).stats,
      orders: filterAdminOrders(allOrders, params),
    }
  }, [query.data, params])

  return {
    ...query,
    data,
  }
}
