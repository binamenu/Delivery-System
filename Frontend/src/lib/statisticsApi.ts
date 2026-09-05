import axios from 'axios'
import api from '@/lib/api'
import { fetchRestaurants } from '@/lib/restaurantsApi'
import type { AdminStatistics, MonthlyPoint, StatusShare } from '@/types/Statistics'

interface OrderRecord {
  id?: number
  status?: string
  total_amount?: number
  totalAmount?: number
  created_at?: string
  createdAt?: string
}

interface UserRecord {
  id?: number
  role?: string
  status?: string
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const STATUS_COLORS: Record<string, { label: string; color: string }> = {
  delivered: { label: 'Delivered', color: '#22C55E' },
  preparing: { label: 'Preparing', color: '#F97316' },
  pending: { label: 'Pending', color: '#3B82F6' },
  ready_for_pickup: { label: 'Ready', color: '#3B82F6' },
  in_transit: { label: 'In Transit', color: '#8B5CF6' },
  cancelled: { label: 'Cancelled', color: '#EF4444' },
  rejected: { label: 'Rejected', color: '#EF4444' },
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (isRecord(payload) && Array.isArray(payload.data)) return payload.data as T[]
  if (isRecord(payload) && isRecord(payload.data) && Array.isArray(payload.data.data)) {
    return payload.data.data as T[]
  }
  return []
}

function isMissingEndpoint(error: unknown): boolean {
  return axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 405)
}

async function fetchList<T>(path: string): Promise<T[]> {
  try {
    const response = await api.get(path)
    return unwrapList<T>(response.data)
  } catch (error) {
    if (isMissingEndpoint(error)) return []
    throw error
  }
}

function formatEtb(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000
    return `ETB ${millions >= 10 ? millions.toFixed(0) : millions.toFixed(1)}M`
  }
  return `ETB ${Math.round(amount).toLocaleString()}`
}

function percentChange(current: number, previous: number): string {
  if (previous <= 0 && current <= 0) return 'this month'
  if (previous <= 0) return '+100% this month'
  const change = ((current - previous) / previous) * 100
  const rounded = Math.abs(change).toFixed(1).replace(/\.0$/, '')
  const sign = change >= 0 ? '+' : '-'
  return `${sign}${rounded}% this month`
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function lastSevenMonths(now = new Date()): { key: string; label: string }[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (6 - index), 1)
    return { key: monthKey(date), label: MONTH_LABELS[date.getMonth()] }
  })
}

function orderAmount(order: OrderRecord): number {
  const amount = order.totalAmount ?? order.total_amount ?? 0
  return Number(amount) || 0
}

function orderDate(order: OrderRecord): Date | null {
  const raw = order.createdAt ?? order.created_at
  if (!raw) return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

function buildMonthly(orders: OrderRecord[]): MonthlyPoint[] {
  const buckets = lastSevenMonths()
  const revenueByMonth = new Map<string, number>()
  const ordersByMonth = new Map<string, number>()

  for (const order of orders) {
    const date = orderDate(order)
    if (!date) continue
    const key = monthKey(date)
    revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + orderAmount(order))
    ordersByMonth.set(key, (ordersByMonth.get(key) ?? 0) + 1)
  }

  return buckets.map((bucket) => ({
    month: bucket.label,
    revenue: revenueByMonth.get(bucket.key) ?? 0,
    orders: ordersByMonth.get(bucket.key) ?? 0,
  }))
}

function buildStatusShares(orders: OrderRecord[]): StatusShare[] {
  if (orders.length === 0) return []

  const grouped = new Map<string, number>()
  for (const order of orders) {
    const raw = (order.status ?? 'pending').toLowerCase()
    const key =
      raw === 'rejected' || raw === 'cancelled'
        ? 'cancelled'
        : raw === 'ready_for_pickup' || raw === 'in_transit'
          ? raw
          : raw
    grouped.set(key, (grouped.get(key) ?? 0) + 1)
  }

  return Array.from(grouped.entries())
    .map(([key, count]) => {
      const meta = STATUS_COLORS[key] ?? { label: key, color: '#94A3B8' }
      return {
        key,
        label: meta.label,
        count,
        percent: Math.round((count / orders.length) * 100),
        color: meta.color,
      }
    })
    .sort((a, b) => b.count - a.count)
}

export function buildAdminStatistics(
  orders: OrderRecord[],
  users: UserRecord[],
  restaurantCount: number,
  pendingRestaurants: number,
): AdminStatistics {
  const monthly = buildMonthly(orders)
  const last = monthly[monthly.length - 1]
  const previous = monthly[monthly.length - 2]
  const delivered = orders.filter((order) => (order.status ?? '').toLowerCase() === 'delivered').length
  const completion = orders.length === 0 ? 0 : (delivered / orders.length) * 100
  const previousMonth = new Date()
  previousMonth.setMonth(previousMonth.getMonth() - 1)
  const previousMonthOrders = orders.filter((order) => {
    const date = orderDate(order)
    if (!date) return false
    return date.getMonth() === previousMonth.getMonth() && date.getFullYear() === previousMonth.getFullYear()
  })
  const previousCompletion =
    previousMonthOrders.length === 0
      ? completion
      : (previousMonthOrders.filter((order) => (order.status ?? '').toLowerCase() === 'delivered').length /
          previousMonthOrders.length) *
        100
  const completionDelta = completion - previousCompletion

  const activeUsers = users.filter((user) => (user.status ?? 'active') === 'active').length
  const activeDrivers = users.filter(
    (user) => user.role === 'driver' && (user.status ?? 'active') === 'active',
  ).length

  const totalRevenue = orders.reduce((sum, order) => sum + orderAmount(order), 0)

  return {
    kpis: {
      totalRevenue: {
        id: 'revenue',
        label: 'Total Revenue',
        value: formatEtb(totalRevenue),
        badge: percentChange(last?.revenue ?? 0, previous?.revenue ?? 0),
      },
      totalOrders: {
        id: 'orders',
        label: 'Total Orders',
        value: orders.length.toLocaleString(),
        badge: percentChange(last?.orders ?? 0, previous?.orders ?? 0),
      },
      activeUsers: {
        id: 'users',
        label: 'Active Users',
        value: activeUsers.toLocaleString(),
        badge: 'this week',
      },
      activeDrivers: {
        id: 'drivers',
        label: 'Active Drivers',
        value: String(activeDrivers),
        badge: 'online right now',
      },
      restaurants: {
        id: 'restaurants',
        label: 'Restaurants',
        value: String(restaurantCount),
        badge: `${pendingRestaurants} pending`,
      },
      completionRate: {
        id: 'completion',
        label: 'Completion Rate',
        value: `${completion.toFixed(1)}%`,
        badge: `${completionDelta >= 0 ? '+' : ''}${completionDelta.toFixed(1)}% vs last month`,
      },
    },
    monthly,
    statusShares: buildStatusShares(orders),
  }
}

export async function fetchAdminStatistics(): Promise<AdminStatistics> {
  const [orders, users, restaurants] = await Promise.all([
    fetchList<OrderRecord>('/orders'),
    fetchList<UserRecord>('/users'),
    fetchRestaurants().catch(() => []),
  ])

  return buildAdminStatistics(
    orders,
    users,
    restaurants.length,
    restaurants.filter((restaurant) => restaurant.approvalStatus === 'pending').length,
  )
}
