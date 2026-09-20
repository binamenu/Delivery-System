import type { OrderStatusSegment, RevenueDataPoint } from '@/components/admin-dashboard'
import type { Order, OrderStatus, OrdersListResponse, OrderStats } from '@/types/Orders'
import type { Restaurant } from '@/types/Restaurants'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function isSameDay(iso: string, now: Date): boolean {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return false
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function buildOrderStats(orders: Order[], now = new Date()): OrderStats {
  const count = (status: OrderStatus) => orders.filter((order) => order.status === status).length

  return {
    totalToday: orders.filter((order) => isSameDay(order.createdAt, now)).length,
    pending: count('pending'),
    preparing: count('preparing'),
    delivered: count('delivered'),
    rejected: count('rejected'),
  }
}

export function buildOrdersListResponse(orders: Order[]): OrdersListResponse {
  return {
    stats: buildOrderStats(orders),
    orders,
  }
}

export function filterAdminOrders(
  orders: Order[],
  params: { status?: string; search?: string },
): Order[] {
  const status = params.status && params.status !== 'all' ? params.status : undefined
  const search = params.search?.trim().toLowerCase() ?? ''

  return orders.filter((order) => {
    const matchesStatus = !status || order.status === status
    const matchesSearch =
      search.length === 0 ||
      order.orderNumber.toLowerCase().includes(search) ||
      order.customer.name.toLowerCase().includes(search) ||
      order.restaurant.name.toLowerCase().includes(search)

    return matchesStatus && matchesSearch
  })
}

export function sumOrderRevenue(orders: Order[]): number {
  return orders.reduce((sum, order) => {
    if (order.status === 'cancelled' || order.status === 'rejected') return sum
    return sum + order.totalAmount
  }, 0)
}

export function buildRevenueSeries(orders: Order[], monthCount = 7): RevenueDataPoint[] {
  const now = new Date()
  const buckets = Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - index), 1)
    return {
      month: MONTH_LABELS[date.getMonth()],
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      value: 0,
    }
  })

  for (const order of orders) {
    if (order.status === 'cancelled' || order.status === 'rejected') continue
    const date = new Date(order.createdAt)
    if (Number.isNaN(date.getTime())) continue
    const bucket = buckets.find(
      (item) => item.year === date.getFullYear() && item.monthIndex === date.getMonth(),
    )
    if (bucket) bucket.value += order.totalAmount
  }

  return buckets.map(({ month, value }) => ({ month, value }))
}

export function buildOrderStatusSegments(orders: Order[]): OrderStatusSegment[] {
  const counts: Record<string, number> = {
    Delivered: 0,
    Preparing: 0,
    Pending: 0,
    Cancelled: 0,
  }

  for (const order of orders) {
    if (order.status === 'delivered') counts.Delivered += 1
    else if (order.status === 'preparing' || order.status === 'ready_for_pickup') counts.Preparing += 1
    else if (order.status === 'pending') counts.Pending += 1
    else if (order.status === 'cancelled' || order.status === 'rejected') counts.Cancelled += 1
  }

  return [
    { label: 'Delivered', value: counts.Delivered, color: '#14B8A6' },
    { label: 'Preparing', value: counts.Preparing, color: '#F97316' },
    { label: 'Pending', value: counts.Pending, color: '#3B82F6' },
    { label: 'Cancelled', value: counts.Cancelled, color: '#EF4444' },
  ]
}

export function formatEtb(amount: number): string {
  return `ETB ${Math.round(amount).toLocaleString()}`
}

export function uniqueCountById<T extends { id: number }>(items: T[]): number {
  return new Set(items.map((item) => item.id)).size
}

export function pendingRestaurants(restaurants: Restaurant[]): Restaurant[] {
  return restaurants.filter((restaurant) => restaurant.approvalStatus === 'pending')
}
